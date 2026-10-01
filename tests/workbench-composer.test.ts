import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { test } from 'node:test'
import { runInNewContext } from 'node:vm'
import { WORKBENCH_COMPOSER_CSS } from '../src/client/styles/workbench-composer.css.ts'

const source = readFileSync(new URL('../src/client/workbench/composer.ts', import.meta.url), 'utf8')
// Evaluate the exported pure policy without loading browser effect dependencies.
const policy = source.slice(source.indexOf('// Pure geometry'), source.indexOf('const CARD')).replaceAll('export function', 'function')
const { composerHeightBudget: budget, composerKeyboardOpen: keyboard } = runInNewContext(`${stripTypeScriptTypes(policy)}; ({ composerHeightBudget, composerKeyboardOpen })`)

test('393x520 long draft leaves 150px context and caps input at 30 percent', () => {
  const result = budget(350, 140)
  assert.equal(result.context, 150)
  assert.equal(result.input, 60)
  const ordinary = budget(430, 140)
  assert.equal(ordinary.context, 150)
  assert.ok(ordinary.input <= 129)
  assert.ok(ordinary.input + 140 + ordinary.context <= 430)
})

test('tall viewports cap the input at 160px and unusually low screens degrade reasonably', () => {
  assert.equal(budget(800, 120).input, 160)
  const low = budget(210, 110)
  assert.ok(low.context >= 48)
  assert.ok(low.input >= 44)
  assert.ok(low.input + 110 + low.context <= 210)
})

test('keyboard requires real viewport shrink and ignores browser chrome and zoom', () => {
  assert.equal(keyboard(844, 520, 1), true)
  assert.equal(keyboard(520, 520, 1), false)
  assert.equal(keyboard(844, 780, 1), false)
  assert.equal(keyboard(844, 520, 1.5), false)
  assert.doesNotMatch(source, /activeElement|focusin|focusout/)
})

test('same-editor contract: inject only owned button, never move or copy host draft', () => {
  assert.match(source, /next\.append\(button\)/)
  assert.doesNotMatch(source, /cloneNode|innerHTML|textContent\s*=.*draft|\.focus\(|\.blur\(|append\(.*editor|appendChild\(.*editor/)
  assert.match(source, /event\.preventDefault\(\)/)
  assert.match(source, /event\.isComposing/)
  assert.match(source, /button\.textContent = value \? '收起编辑' : '展开编辑'/)
})

test('all owned resources and prior markers/styles are restored', () => {
  for (const contract of ['observer.disconnect()', 'resizeObserver?.disconnect()', 'button?.remove()', 'probeNode.remove()', 'window.cancelAnimationFrame(frame)', "viewport?.removeEventListener('resize', schedule)", "viewport?.removeEventListener('scroll', schedule)", "document.removeEventListener('keydown', onKey, true)", 'oldMarkers', 'oldProperties', 'restoreCard?.()']) {
    assert.ok(source.includes(contract), contract)
  }
  assert.match(source, /installMobileEffect\(ctx,/)
  assert.match(source, /getBoundingClientRect\(\)\.width > 0/)
})

test('small DOM contract: same editor/card survives expand, collapse and disposal', () => {
  class Node {
    attrs = new Map<string, string>()
    values = new Map<string, string>()
    listeners = new Map<string, (event: any) => void>()
    children: Node[] = []
    parent: Node | null = null
    textContent = ''
    style = {
      cssText: '', height: '',
      getPropertyValue: (key: string) => this.values.get(key) ?? '',
      getPropertyPriority: () => '',
      setProperty: (key: string, value: string) => this.values.set(key, value),
      removeProperty: (key: string) => this.values.delete(key),
    }
    setAttribute(key: string, value: string) { this.attrs.set(key, value) }
    getAttribute(key: string) { return this.attrs.get(key) ?? null }
    hasAttribute(key: string) { return this.attrs.has(key) }
    removeAttribute(key: string) { this.attrs.delete(key) }
    addEventListener(key: string, callback: (event: any) => void) { this.listeners.set(key, callback) }
    removeEventListener(key: string) { this.listeners.delete(key) }
    append(node: Node) { this.children.push(node); node.parent = this }
    remove() { if (this.parent) this.parent.children = this.parent.children.filter(node => node !== this); this.parent = null }
    getBoundingClientRect() { return { width: 360, height: 56, top: 0 } }
    querySelector(_selector: string): Node | null { return null }
    closest(_selector: string): Node | null { return null }
  }
  const root = new Node()
  const card = new Node()
  const editor = new Node()
  const scroll = new Node()
  const seat = new Node()
  const content = new Node()
  editor.textContent = '长草稿保持不变'
  card.append(scroll)
  scroll.append(editor)
  card.getBoundingClientRect = () => ({ width: 360, height: 260, top: 200 })
  scroll.getBoundingClientRect = () => ({ width: 340, height: 120, top: 210 })
  seat.getBoundingClientRect = () => ({ width: 360, height: 280, top: 200 })
  content.getBoundingClientRect = () => ({ width: 393, height: 440, top: 80 })
  card.querySelector = selector => selector === '[data-input-scroll]' ? scroll : editor
  card.closest = selector => selector === '[data-composer-seat]' ? seat : content
  root.style.setProperty('--mobile-compose-vv-height', 'original')
  const frames = new Map<number, () => void>()
  let nextFrame = 0
  let dispose: (() => void) | undefined
  const windowEvents = new Node()
  const viewport = Object.assign(new Node(), { height: 844, width: 393, scale: 1, offsetTop: 0, offsetLeft: 0 })
  const documentEvents = new Node()
  const fakeDocument = Object.assign(documentEvents, {
    documentElement: root, body: new Node(),
    createElement: () => new Node(),
    querySelectorAll: () => [card],
    querySelector: () => null,
  })
  const browserSource = source.replace(/^import .*\n/gm, '').replaceAll('export function', 'function')
  runInNewContext(`${stripTypeScriptTypes(browserSource)}; installWorkbenchComposer({})`, {
    document: fakeDocument,
    window: Object.assign(windowEvents, {
      innerWidth: 393, innerHeight: 844, visualViewport: viewport,
      requestAnimationFrame: (callback: () => void) => { frames.set(++nextFrame, callback); return nextFrame },
      cancelAnimationFrame: (id: number) => frames.delete(id),
    }),
    installMobileEffect: (_ctx: unknown, _label: string, install: () => () => void) => { dispose = install() },
    getComputedStyle: () => root.style,
    MutationObserver: class { observe() {} disconnect() {} },
    ResizeObserver: class { observe() {} disconnect() {} },
  })
  const flush = () => {
    const callbacks = [...frames.values()]
    frames.clear()
    callbacks.forEach(callback => callback())
  }
  flush()
  const button = card.children.find(node => node.hasAttribute('data-mobile-compose-toggle'))!
  assert.ok(button)
  assert.equal(card.children.length, 2)
  button.listeners.get('click')!({ stopPropagation() {} })
  assert.equal(root.getAttribute('data-mobile-compose-expanded'), 'true')
  assert.equal(button.textContent, '收起编辑')
  button.listeners.get('click')!({ stopPropagation() {} })
  assert.equal(root.hasAttribute('data-mobile-compose-expanded'), false)
  assert.equal(editor.parent, scroll)
  assert.equal(scroll.parent, card)
  assert.equal(editor.textContent, '长草稿保持不变')
  viewport.height = 520
  viewport.listeners.get('resize')!({})
  flush()
  assert.equal(root.getAttribute('data-mobile-workbench-keyboard'), 'true')
  dispose!()
  assert.equal(card.children.length, 1)
  assert.equal(card.hasAttribute('data-mobile-workbench-composer'), false)
  assert.equal(root.hasAttribute('data-mobile-workbench-keyboard'), false)
  assert.equal(root.style.getPropertyValue('--mobile-compose-vv-height'), 'original')
  assert.equal(root.children.length, 0)
  assert.equal(viewport.listeners.size, 0)
  assert.equal(windowEvents.listeners.size, 0)
  assert.equal(documentEvents.listeners.size, 0)
  assert.equal(frames.size, 0)
})

test('CSS gates every layout rule to coarse mobile and preserves scroll document', () => {
  assert.match(WORKBENCH_COMPOSER_CSS, /^@media \(max-width: 1023px\) and \(pointer: coarse\)/)
  assert.match(WORKBENCH_COMPOSER_CSS, /@media \(min-width: 1024px\), \(pointer: fine\), \(pointer: none\)/)
  assert.match(WORKBENCH_COMPOSER_CSS, /min-height: 44px/)
  assert.match(WORKBENCH_COMPOSER_CSS, /overflow-y: auto !important/)
  assert.match(WORKBENCH_COMPOSER_CSS, /position: fixed !important/)
  assert.doesNotMatch(WORKBENCH_COMPOSER_CSS, /\[data-composer-input\]\s*\{/)
  assert.doesNotMatch(WORKBENCH_COMPOSER_CSS, /padding-bottom:.*mobile-workbench-nav/)
  assert.doesNotMatch(WORKBENCH_COMPOSER_CSS, /_7KE1Ra/)
  assert.match(WORKBENCH_COMPOSER_CSS, /\[data-slot="conversation.input.model"\]/)
  assert.match(WORKBENCH_COMPOSER_CSS, /var\(--dsw-alias-bg-base, Canvas\)/)
})
