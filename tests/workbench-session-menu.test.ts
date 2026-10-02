import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { test } from 'node:test'
import { runInNewContext } from 'node:vm'
import { currentSessionIdOf } from '../src/client/core/sessions-compat.ts'

const source = readFileSync(new URL('../src/client/workbench/session-menu.ts', import.meta.url), 'utf8')
const executable = stripTypeScriptTypes(source.replace(/^import .*\n/gm, '').replaceAll('export function', 'function').replaceAll('export async function', 'async function'))
const { copyCurrentSessionId } = runInNewContext(`${executable}; ({ copyCurrentSessionId })`, { currentSessionIdOf })

test('copies the selected child ID and visibly reports unavailable/rejected clipboard as failure', async () => {
  const values: string[] = []
  const clipboard = { writeText: async (id: string) => { values.push(id) } }
  assert.equal(await copyCurrentSessionId({ current: 'parent' }, clipboard), true)
  assert.equal(await copyCurrentSessionId({ byId: { child: { id: 'child', retainedBy: { mainView: 1 } }, parent: { id: 'parent', retainedBy: {} } } }, clipboard), true)
  assert.deepEqual(values, ['parent', 'child'])
  assert.equal(await copyCurrentSessionId({}, clipboard), false)
  assert.equal(await copyCurrentSessionId({ current: 'child' }, undefined), false)
  assert.equal(await copyCurrentSessionId({ current: 'child' }, { writeText: async () => { throw new Error('denied') } }), false)
})

test('native wrapper attachment reads latest ID, shows outcome, reinjects once and disposes owned resources', async () => {
  class Node {
    attrs = new Map<string, string>()
    children: Node[] = []
    parentElement: Node | null = null
    className = ''
    textContent = ''
    hidden = false
    disabled = false
    listeners = new Map<string, () => Promise<void>>()
    setAttribute(key: string, value: string) { this.attrs.set(key, value) }
    append(...nodes: Node[]) { for (const node of nodes) { node.remove(); node.parentElement = this; this.children.push(node) } }
    remove() { if (this.parentElement) this.parentElement.children = this.parentElement.children.filter(child => child !== this); this.parentElement = null }
    contains(node: Node): boolean { return this === node || this.children.some(child => child.contains(node)) }
    addEventListener(key: string, fn: () => Promise<void>) { this.listeners.set(key, fn) }
    removeEventListener(key: string) { this.listeners.delete(key) }
    querySelector(_selector: string): Node | null { return null }
    querySelectorAll(_selector: string): Node[] { return [] }
  }
  const body = new Node()
  const wrapper = new Node()
  const trigger = new Node()
  const menu = new Node()
  const viewport = new Node()
  const nativeWrap = new Node()
  const native = new Node()
  const nativeLabel = new Node()
  const nativeIcon = new Node()
  nativeIcon.className = 'native_itemIcon'
  native.textContent = 'download'
  native.className = 'native_item'
  nativeLabel.className = 'native_itemLabel'
  nativeWrap.className = 'native_itemWrap'
  native.append(nativeLabel)
  nativeWrap.append(native)
  viewport.append(nativeWrap)
  menu.append(viewport)
  wrapper.append(trigger, menu)
  body.append(wrapper)
  wrapper.querySelector = () => menu.parentElement === wrapper ? menu : null
  native.querySelector = selector => selector.includes('_itemIcon') ? nativeIcon : nativeLabel
  menu.querySelectorAll = () => [native]
  let current = 'parent'
  let rejected = false
  const copied: string[] = []
  let disposed = false
  let dispose = () => {}
  let mutate = () => {}
  const frames = new Map<number, () => void>()
  let sequence = 0
  let visibleTrigger = true
  const ctx = {
    sessions: { list: { getSnapshot: () => ({ current }) } },
    locale: { bind: (namespace: string) => (key: string) => namespace === 'mobileWorkbench' ? key : 'download' },
  }
  runInNewContext(`${executable}; installWorkbenchSessionMenu(ctx)`, {
    ctx, currentSessionIdOf, WORKBENCH_NS: 'mobileWorkbench',
    document: { body, createElement: () => new Node(), createElementNS: () => new Node(), querySelector: () => visibleTrigger ? trigger : null },
    navigator: { clipboard: { writeText: async (id: string) => { if (rejected) throw new Error('denied'); copied.push(id) } } },
    window: { requestAnimationFrame: (fn: () => void) => { frames.set(++sequence, fn); return sequence }, cancelAnimationFrame: (id: number) => frames.delete(id) },
    MutationObserver: class { constructor(fn: () => void) { mutate = fn } observe() {} disconnect() { disposed = true } },
    installMobileEffect: (_ctx: unknown, _label: string, install: () => () => void) => { dispose = install() },
  })
  const flush = () => { const pending = [...frames.values()]; frames.clear(); pending.forEach(fn => fn()) }
  flush()
  assert.equal(viewport.children.length, 2)
  const owned = viewport.children[1]
  const [button, status] = owned.children
  assert.equal(button.attrs.get('role'), 'menuitem')
  assert.equal(button.className, native.className)
  assert.equal(button.children[0].className, nativeIcon.className)
  assert.equal(button.children[0].attrs.get('aria-hidden'), 'true')
  assert.equal(button.children[1].className, nativeLabel.className)
  assert.equal(status.hidden, true)
  current = 'child'
  await button.listeners.get('click')!()
  assert.deepEqual(copied, ['child'])
  assert.equal(status.textContent, 'copySessionIdSuccess')
  assert.equal(status.hidden, false)
  assert.equal(native.parentElement, nativeWrap)
  rejected = true
  await button.listeners.get('click')!()
  assert.equal(status.textContent, 'copySessionIdFailure')
  assert.equal(button.disabled, false)
  mutate(); flush()
  assert.equal(viewport.children.length, 2, 'same menu has exactly one added row')
  visibleTrigger = false
  mutate(); flush()
  assert.equal(viewport.children.length, 1, 'no header wrapper means no injection into an unrelated download menu')
  assert.equal(button.listeners.size, 0)
  visibleTrigger = true
  mutate(); flush()
  assert.equal(viewport.children.length, 2)
  dispose()
  assert.equal(disposed, true)
  assert.equal(viewport.children.length, 1)
  assert.equal(frames.size, 0)
})

test('mobile gating and native ownership need no copied nodes or independent keyboard system', () => {
  assert.match(source, /installMobileEffect\(ctx,/)
  assert.match(source, /header button\[class\*="_moreButton"\]/)
  assert.match(source, /:scope > \[role="menu"\]/)
  assert.match(source, /currentSessionIdOf\(snapshot\)/)
  assert.doesNotMatch(source, /cloneNode|innerHTML|execCommand|location\.|dispatchEvent|addEventListener\('keydown'/)
})
