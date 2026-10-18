import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { test } from 'node:test'
import { runInNewContext } from 'node:vm'

const source = readFileSync(new URL('../src/client/effects/model-menu-anchor.ts', import.meta.url), 'utf8')
const executable = stripTypeScriptTypes(source.replace(/^import .*\n/gm, '').replaceAll('export function', 'function'))

test('model seat resolves its own portal by aria-controls', () => {
  class Element {
    readonly trigger: boolean
    constructor(trigger = false) { this.trigger = trigger }
    closest(selector: string) { return this.trigger && selector.includes('conversation.input.model') ? this : null }
    contains(node: Element) { return node === this }
    getAttribute(name: string) { return name === 'aria-controls' ? 'native-menu' : null }
    getBoundingClientRect() { return { left: 12, width: 246, height: 74 } }
    style = {
      left: '12px',
      getPropertyValue() { return this.left },
      getPropertyPriority() { return '' },
      setProperty(_key: string, value: string) { this.left = value },
      removeProperty() { this.left = '' },
    }
  }
  const trigger = new Element(true), menu = new Element(), unrelated = new Element()
  const card = { getBoundingClientRect: () => ({ left: 16, width: 326, height: 100 }) }
  const listeners = new Map<string, (event: { target: Element }) => void>()
  const viewListeners = new Map<string, () => void>()
  const frames = new Map<number, () => void>()
  const timers = new Map<number, () => void>()
  let dispose = () => {}
  let sequence = 0
  let scans = 0
  runInNewContext(`${executable}; installModelMenuAnchor({})`, {
    Element,
    document: {
      documentElement: { clientWidth: 360 },
      querySelectorAll: (selector: string) => { assert.equal(selector, '[data-slot="conversation.input.model"] button[aria-haspopup="menu"]'); scans++; return [trigger] },
      getElementById: (id: string) => { assert.equal(id, 'native-menu'); return menu },
      querySelector: (selector: string) => selector === '[data-composer-card]' ? card : trigger,
      addEventListener: (key: string, fn: (event: { target: Element }) => void) => listeners.set(key, fn),
      removeEventListener: (key: string) => listeners.delete(key),
    },
    window: {
      requestAnimationFrame: (fn: () => void) => { frames.set(++sequence, fn); return sequence },
      cancelAnimationFrame: (id: number) => frames.delete(id),
      setTimeout: (fn: () => void) => { timers.set(++sequence, fn); return sequence },
      clearTimeout: (id: number) => timers.delete(id),
      addEventListener: (key: string, fn: () => void) => viewListeners.set(key, fn),
      removeEventListener: (key: string) => viewListeners.delete(key),
    },
    installMobileEffect: (_ctx: object, _label: string, install: () => () => void) => { dispose = install() },
  })
  const flush = () => { const pending = [...frames.values()]; frames.clear(); pending.forEach(fn => fn()) }
  listeners.get('click')!({ target: unrelated }); flush()
  assert.equal(scans, 0)
  listeners.get('click')!({ target: trigger }); flush()
  assert.equal(menu.style.left, '56px')
  assert.equal(unrelated.style.left, '12px')
  listeners.get('click')!({ target: menu }); flush()
  assert.equal(scans, 2, 'portal interaction rescans the model seat')
  viewListeners.get('resize')!(); flush()
  assert.equal(scans, 2, 'viewport following does not rescan model seats')
  dispose()
  assert.equal(menu.style.left, '12px', 'disposal restores the native inline anchor')
  assert.equal(listeners.size, 0)
  assert.equal(viewListeners.size, 0)
  assert.equal(frames.size, 0)
  assert.equal(timers.size, 0)
})
