import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { test } from 'node:test'
import { runInNewContext } from 'node:vm'

function harness() {
  class Target {
    kind: 'add' | 'editor' | 'other'
    constructor(kind: 'add' | 'editor' | 'other') { this.kind = kind }
    closest(selector: string) { return selector.includes('_add') ? this.kind === 'add' : selector.includes('composer-input') && this.kind === 'editor' }
  }
  class Store {
    listeners = new Set<() => void>()
    value = { open: false }
    getSnapshot = () => this.value
    subscribe = (fn: () => void) => { this.listeners.add(fn); return () => { this.listeners.delete(fn) } }
    set(open: boolean) { this.value = { open }; for (const fn of this.listeners) fn() }
  }
  const a = { id: 'a' }, b = { id: 'b' }
  const menuA = new Store(), menuB = new Store()
  const dismisses = { a: 0, b: 0 }
  const controllers = new Map([
    [a, { menu: menuA, dismiss() { dismisses.a++; menuA.set(false) } }],
    [b, { menu: menuB, dismiss() { dismisses.b++; menuB.set(false) } }],
  ])
  let current: typeof a | undefined = a
  let retained = true
  let resolutions = 0
  const listListeners = new Set<() => void>()
  const ctx = {
    sessions: {
      list: { getSnapshot: () => ({ byId: current ? { [current.id]: { id: current.id, retainedBy: { mainView: 1 } } } : {} }), subscribe: (fn: () => void) => { listListeners.add(fn); return () => { listListeners.delete(fn) } } },
      scope: () => retained ? current : undefined,
      retain() { throw new Error('menu inspection must not retain/open a session') },
    },
    inputTriggers: { sessionOf(scope: typeof a) { resolutions++; return controllers.get(scope) } },
  }
  const events = new Map<string, Function>()
  const timers = new Map<number, Function>()
  let timerId = 0
  let blur = 0
  const editor = { blur() { blur++ } }
  const document = {
    activeElement: editor,
    querySelector: () => editor,
    addEventListener(type: string, fn: Function, capture = false) { events.set(type + capture, fn) },
    removeEventListener(type: string, _fn: Function, capture = false) { events.delete(type + capture) },
  }
  let dispose: () => void
  const text = ['../src/client/workbench/composer-session.ts', '../src/client/effects/composer-plus-toggle.ts']
    .map(path => readFileSync(new URL(path, import.meta.url), 'utf8').split(String.fromCharCode(10)).filter(line => !line.startsWith('import ')).join(String.fromCharCode(10)).replaceAll('export function', 'function')).join(String.fromCharCode(10))
  runInNewContext(stripTypeScriptTypes(text) + '; installComposerPlusToggle(ctx)', {
    ctx, document, Element: Target,
    window: { setTimeout(fn: Function) { const id = ++timerId; timers.set(id, fn); return id }, clearTimeout(id: number) { timers.delete(id) } },
    installMobileEffect(_ctx: object, _name: string, install: () => () => void) { dispose = install() },
  })
  const event = (kind: 'add' | 'editor' | 'other' = 'add') => ({ target: new Target(kind) })
  return {
    menuA, menuB, dismisses, events, timers, listListeners,
    capture: () => events.get('clicktrue')!(event()),
    bubble: () => events.get('clickfalse')!(event()),
    pointer: (kind: 'add' | 'editor' | 'other') => events.get('pointerdowntrue')!(event(kind)),
    switch(scope: typeof a | undefined, live = true) { current = scope; retained = live; for (const fn of listListeners) fn() },
    a, b, dispose: () => dispose!(), resolutions: () => resolutions, blur: () => blur,
  }
}

test('plus opens natively and its second click dismisses through the current controller', () => {
  const h = harness()
  h.pointer('add'); assert.equal(h.blur(), 1)
  h.capture(); h.menuA.set(true); h.bubble()
  assert.equal(h.dismisses.a, 0)
  assert.equal(h.timers.size, 3)
  h.capture(); h.bubble()
  assert.equal(h.dismisses.a, 1)
  assert.equal(h.menuA.getSnapshot().open, false)
  assert.equal(h.timers.size, 0)
  h.dispose()
})

test('typed-slash menu closes without depending on a launcher marker or DOM visibility', () => {
  const h = harness()
  h.menuA.set(true)
  h.capture(); h.bubble()
  assert.equal(h.dismisses.a, 1)
  h.dispose()
})

test('switching Sessions cancels old timers/subscriptions and never dismisses a new controller for an old click', () => {
  const h = harness()
  h.capture(); h.menuA.set(true); h.bubble()
  const staleTimers = [...h.timers.values()]
  h.capture()
  h.switch(h.b)
  h.menuB.set(true)
  h.bubble()
  for (const fn of staleTimers) fn()
  assert.deepEqual(h.dismisses, { a: 0, b: 0 })
  assert.equal(h.blur(), 0)
  assert.equal(h.menuA.listeners.size, 0)
  h.capture(); h.bubble()
  assert.equal(h.dismisses.b, 1)
  h.dispose()
  assert.equal(h.events.size, 0)
  assert.equal(h.menuB.listeners.size, 0)
  assert.equal(h.listListeners.size, 0)
})

test('missing selection or retained scope does not create a controller or retain history', () => {
  const h = harness()
  h.switch(undefined)
  const before = h.resolutions()
  h.capture(); h.bubble()
  assert.equal(h.resolutions(), before)
  h.switch(h.a, false)
  h.capture(); h.bubble()
  assert.equal(h.resolutions(), before)
  h.dispose()
})

test('touching the editor cancels delayed IME blur', () => {
  const h = harness()
  h.capture(); h.menuA.set(true); h.bubble()
  h.pointer('editor')
  assert.equal(h.timers.size, 0)
  h.dispose()
})
