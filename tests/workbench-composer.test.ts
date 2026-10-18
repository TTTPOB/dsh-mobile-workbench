import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { test } from 'node:test'
import { runInNewContext } from 'node:vm'
import { composerHeightBudget as budget, composerKeyboardOpen as keyboard, composerNavigationRelease as navigationRelease, composerEndpointReturn as endpointReturn } from '../src/client/workbench/composer-geometry.ts'
import { composerModelName } from '../src/client/workbench/composer-model-label.ts'
import { en, zh } from '../src/client/workbench/composer-locales.ts'
import { findRuleBlocks } from '../src/client/core/css-rules.ts'
import { WORKBENCH_COMPOSER_CSS } from '../src/client/styles/workbench-composer.css.ts'

const source = readFileSync(new URL('../src/client/workbench/composer.ts', import.meta.url), 'utf8')

test('keyboard requires viewport shrink and ignores browser chrome and zoom', () => {
  assert.equal(keyboard(844, 520, 1), true)
  assert.equal(keyboard(520, 520, 1), false)
  assert.equal(keyboard(844, 780, 1), false)
  assert.equal(keyboard(844, 520, 1.5), false)
  assert.equal(endpointReturn(520, 844, 844, 1), true)
  assert.equal(endpointReturn(800, 844, 844, 1), false)
  assert.equal(endpointReturn(844, 520, 844, 1), false)
})

test('navigation releases continuously, with no focus-driven keyboard guesses', () => {
  const clearance = (height: number) => Math.max(0, 56 - navigationRelease(844, height, 1))
  assert.equal(clearance(693), 56)
  assert.equal(clearance(520), 0)
  for (let height = 843; height >= 520; height--) assert.ok(Math.abs(clearance(height) - clearance(height + 1)) <= 1.001)
  assert.equal(navigationRelease(844, 520, 1.5), 0)
})

test('height budgets preserve reading context, an input floor and a bounded long draft', () => {
  assert.deepEqual(budget(350, 140), { input: 60, card: 200, context: 150 })
  assert.equal(budget(800, 120).input, 160)
  for (const [available, chrome] of [[210, 110], [430, 140]]) {
    const value = budget(available!, chrome!)
    assert.ok(value.context >= 48)
    assert.ok(value.input >= 44)
    assert.ok(value.input + chrome! + value.context <= available!)
  }
})

test('model label slot shortens only mobile trigger names, preserving catalog and custom identity', () => {
  for (const [name, short] of [
    ['openai/gpt-6.1-sol', 'GPT-6.1-sol'],
    ['anthropic/claude-sonnet-4.6', 'Claude sonnet-4.6'],
    ['deepseek/deepseek-v4-pro', 'deepseek-v4-pro'],
    ['自定义中文模型', '自定义中文模型'],
    ['custom/model-name', 'custom/model-name'],
  ]) {
    const owner = { provider: { id: 'local', name: 'Local' }, model: { id: 'local-model', name: name! }, placement: 'trigger' as const, selected: true }
    assert.equal(composerModelName(owner, true), short)
    assert.equal(composerModelName(owner, false), name)
    for (const placement of ['menu', 'option'] as const) assert.equal(composerModelName({ ...owner, placement }, true), name)
  }
  assert.doesNotMatch(source, /composerPermissionLabel|triggerLabel|data-mobile-compose-label/)
})

test('native editor and submit state are not copied; ownership is disposed', () => {
  assert.doesNotMatch(source, /cloneNode|innerHTML/)
  assert.equal(source.includes('append(editor'), false)
  for (const resource of ['controls?.dispose()', 'focus?.stop()', 'resizeObserver?.disconnect()', 'observer.disconnect()', 'oldMarkers', 'oldProperties', 'probeNode.remove()']) assert.ok(source.includes(resource))
  assert.match(source, /triggers.dismiss()/)
})

test('toolbar uses a 48px row with 44px targets and removes the entire native metrics dock', () => {
  assert.match(WORKBENCH_COMPOSER_CSS, /height: 48px/)
  assert.match(WORKBENCH_COMPOSER_CSS, /width: 44px !important/)
  const rules = findRuleBlocks(WORKBENCH_COMPOSER_CSS)
  const dock = rules.find(rule => rule.selector.includes('[data-composer-dock]'))
  assert.match(dock!.body, /display: none !important/)
  assert.doesNotMatch(WORKBENCH_COMPOSER_CSS, /font-size: 10px|opacity: .65|stats-ring/)
  assert.ok(rules.some(rule => rule.selector.includes('_remove') && rule.body.includes('width: 32px') && rule.body.includes('height: 32px')))
})

test('owned controls track locale changes without rewriting native permission/model nodes', () => {
  class Element {
    attributes = new Map<string, string>()
    children: Element[] = []
    listeners = new Map<string, Function>()
    textContent = ''
    title = ''
    id = ''
    type = ''
    setAttribute(key: string, value: string) { this.attributes.set(key, value) }
    getAttribute(key: string) { return this.attributes.get(key) ?? null }
    append(...children: Element[]) { this.children.push(...children) }
    addEventListener(type: string, handler: Function) { this.listeners.set(type, handler) }
    removeEventListener(type: string) { this.listeners.delete(type) }
    remove() {}
  }
  let locale: 'en' | 'zh' = 'en'
  let listener: (() => void) | undefined
  const dictionary = { en, zh }
  let disposed = false
  let keyboard = false
  const ctx = { locale: { bind: () => (key: keyof typeof en) => dictionary[locale][key], subscribe: (fn: () => void) => { listener = fn; return () => { disposed = true } } } }
  const text = readFileSync(new URL('../src/client/workbench/composer-controls.ts', import.meta.url), 'utf8')
  const code = stripTypeScriptTypes(text.split(String.fromCharCode(10)).filter(line => !line.startsWith('import ')).join(String.fromCharCode(10)).replace('export function', 'function'))
  const create = runInNewContext(code + '; createComposerControls', { COMPOSER_NS: 'mobileComposer', document: { createElement: () => new Element(), createElementNS: () => new Element() } })
  const controls = create(ctx, (value: boolean) => { keyboard = value })
  assert.equal(controls.button.getAttribute('aria-label'), 'Expand editor')
  controls.update(true)
  assert.equal(controls.done.textContent, 'Done')
  locale = 'zh'; listener!()
  assert.equal(controls.heading.textContent, '编辑草稿')
  assert.equal(controls.button.getAttribute('aria-label'), '收起编辑')
  controls.button.listeners.get('click')({ detail: 0, stopPropagation() {} })
  assert.equal(keyboard, true)
  controls.dispose()
  assert.equal(disposed, true)
  assert.equal(controls.button.listeners.size, 0)
})
