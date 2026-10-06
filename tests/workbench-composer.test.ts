import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { test } from 'node:test'
import { runInNewContext } from 'node:vm'
import { WORKBENCH_COMPOSER_CSS } from '../src/client/styles/workbench-composer.css.ts'
import { WORKBENCH_CSS } from '../src/client/styles/workbench.css.ts'

const source = readFileSync(new URL('../src/client/workbench/composer.ts', import.meta.url), 'utf8')
// Evaluate the exported pure policy without loading browser effect dependencies.
const policy = source.slice(source.indexOf('// Pure geometry'), source.indexOf('const CARD')).replaceAll('export function', 'function')
const { composerHeightBudget: budget, composerKeyboardOpen: keyboard, composerPermissionLabel: permissionLabel, composerModelLabel: modelLabel, composerNavigationRelease: navigationRelease, composerEndpointReturn: endpointReturn } = runInNewContext(`${stripTypeScriptTypes(policy)}; ({ composerHeightBudget, composerKeyboardOpen, composerPermissionLabel, composerModelLabel, composerNavigationRelease, composerEndpointReturn })`)

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

test('navigation clearance releases continuously across the keyboard threshold and fully clears', () => {
  const clearance = (height: number, size = 56) => Math.max(0, size - navigationRelease(844, height, 1))
  assert.equal(clearance(693), 56)
  assert.ok(Math.abs(clearance(692) - 55.92) < 0.001)
  assert.equal(clearance(520), 0)
  assert.equal(clearance(520, 90), 0)
  assert.equal(clearance(844), 56)
  const heights = Array.from({ length: 325 }, (_, i) => 844 - i)
  for (let i = 1; i < heights.length; i++) {
    assert.ok(Math.abs(clearance(heights[i]) - clearance(heights[i - 1])) <= 1.001)
  }
  assert.equal(navigationRelease(844, 520, 1.5), 0)
  assert.equal(navigationRelease(844, 780, 1), 0)
})

test('height budget uses the same continuous navigation clearance on both sides of threshold', () => {
  const value = (height: number) => budget(height - 80 - Math.max(0, 56 - navigationRelease(844, height, 1)) - 24, 120)
  const before = value(693)
  const after = value(692)
  assert.ok(Math.abs(before.card - after.card) <= 1.001)
  assert.ok(Math.abs(before.input - after.input) <= 1.001)
  assert.doesNotMatch(source, /root\.hasAttribute\(KEYBOARD\) \? 0 : navHeight/)
})

test('normal frame clamp yields to expanded editing, true modals and zoom', () => {
  assert.match(WORKBENCH_CSS, /:not\(\[data-mobile-compose-expanded="true"\]\):not\(:has\(\[aria-modal="true"\]\)\)/)
  assert.match(WORKBENCH_CSS, /max-height: min\(100%, var\(--mobile-compose-frame-max, 100%\)\) !important/)
  assert.match(WORKBENCH_CSS, /height: var\(--mobile-workbench-nav-size\)/)
  assert.match(WORKBENCH_CSS, /--mobile-workbench-nav-height: max\(0px, calc\(var\(--mobile-workbench-nav-size\) - var\(--mobile-compose-nav-release, 0px\)\)\)/)
  assert.match(source, /height \+ \(viewport\?\.offsetTop \?\? 0\)/)
  assert.match(source, /: '100%'/)
  assert.doesNotMatch(source, /setTimeout|virtualKeyboard|scrollTo|scrollIntoView/)
})

test('only coarse closing steps qualify for theme fallback and continuous viewport steps do not', () => {
  assert.equal(endpointReturn(520, 844, 844, 1), true)
  assert.equal(endpointReturn(800, 844, 844, 1), false)
  assert.equal(endpointReturn(844, 520, 844, 1), false)
  assert.equal(endpointReturn(520, 844, 844, 1.5), false)
  assert.match(source, /root\.hasAttribute\(KEYBOARD\) && !keyboard && currentWidth === previousWidth/)
  assert.match(source, /!reducedMotion\.matches/)
  assert.match(source, /\(viewport\?\.offsetTop \?\? 0\) === previousBottom - previousHeight/)
  assert.match(source, /!duration \|\| parseFloat\(duration\) > 0/)
  assert.match(WORKBENCH_CSS, /transition: max-height var\(--ds-transition-duration, 0\.2s\)[^;]+padding-bottom var\(--ds-transition-duration, 0\.2s\)/)
  assert.match(WORKBENCH_CSS, /@media \(prefers-reduced-motion: reduce\)/)
})

test('return budget follows painted frame and actual clearance through the existing observer', () => {
  assert.match(source, /Math\.min\(height, Math\.max\(0, layoutFrame\.getBoundingClientRect\(\)\.bottom/)
  assert.match(source, /getComputedStyle\(layoutFrame\)\.paddingBottom/)
  assert.match(source, /composerHeightBudget\(Math\.max\(100, availableHeight - top - nav - dock - 12\), chrome\)/)
  assert.match(source, /resizeObserver\?\.observe\(layoutFrame\)/)
  assert.match(source, /animation\.transitionProperty === 'max-height'/)
  assert.match(source, /animation\.transitionProperty === 'padding-bottom'/)
  assert.match(source, /document\.removeEventListener\('transitionend', onTransitionEnd, true\)/)
  assert.match(source, /reducedMotion\.removeEventListener\('change', onReducedMotion\)/)
})

test('same-editor contract: inject only owned button, never move or copy host draft', () => {
  assert.match(source, /row\.append\(button\)/)
  assert.match(source, /next\.append\(header\)/)
  assert.doesNotMatch(source, /cloneNode|innerHTML|textContent\s*=.*draft|\.focus\(|\.blur\(|append\(.*editor|appendChild\(.*editor/)
  assert.match(source, /event\.preventDefault\(\)/)
  assert.match(source, /event\.isComposing/)
  assert.match(source, /button\.setAttribute\('aria-label', value \? '收起编辑' : '展开编辑'\)/)
  assert.match(source, /createElementNS/)
})

test('permission names track the official state and unknown states stay untouched', () => {
  for (const [full, short] of [
    ['访问模式，当前：只读', '只读'],
    ['访问模式，当前：工作区内修改', '工作区'],
    ['访问模式，当前：完全权限', '完全权限'],
    ['Full access', '完全权限'],
  ]) assert.equal(permissionLabel(full), short)
  assert.equal(permissionLabel('访问模式，当前：自定义策略'), null)
})

test('model names shorten only known provider prefixes and keep reasoning untouched', () => {
  assert.equal(modelLabel('openai/gpt-6.1-sol'), 'GPT-6.1-sol')
  assert.equal(modelLabel('anthropic/claude-sonnet-4.6'), 'Claude sonnet-4.6')
  assert.equal(modelLabel('deepseek/deepseek-v4-pro'), 'deepseek-v4-pro')
  assert.equal(modelLabel('my-provider/custom-model'), 'my-provider/custom-model')
  assert.doesNotMatch(source, /setAttribute\('(?:aria-label|title)',.*short/)
})

test('all owned resources and prior markers/styles are restored', () => {
  for (const contract of ['observer.disconnect()', 'resizeObserver?.disconnect()', 'button?.remove()', 'header?.remove()', 'decorations.clear()', 'probeNode.remove()', 'window.cancelAnimationFrame(frame)', "viewport?.removeEventListener('resize', schedule)", "viewport?.removeEventListener('scroll', schedule)", "document.removeEventListener('keydown', onKey, true)", 'oldMarkers', 'oldProperties', 'restoreCard?.()']) {
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
    get parentElement() { return this.parent }
    contains(node: Node | null): boolean { return this === node || this.children.some(child => child.contains(node)) }
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
    append(...nodes: Node[]) { for (const node of nodes) { node.remove(); this.children.push(node); node.parent = this } }
    remove() { if (this.parent) this.parent.children = this.parent.children.filter(node => node !== this); this.parent = null }
    getBoundingClientRect() { return { width: 360, height: 56, top: 0 } }
    querySelector(_selector: string): Node | null { return null }
    closest(_selector: string): Node | null { return null }
    getAnimations() { return [] }
  }
  const root = new Node()
  const card = new Node()
  const editor = new Node()
  const scroll = new Node()
  let row = new Node()
  row.setAttribute('data-mobile-compose-bar', 'prior')
  const permission = new Node()
  const permissionText = new Node()
  permission.setAttribute('aria-label', '访问模式，当前：工作区内修改')
  permissionText.textContent = '工作区内修改'
  permission.querySelector = () => permissionText
  const model = new Node()
  const modelText = new Node()
  modelText.textContent = 'openai/gpt-6.1-sol'
  model.querySelector = () => modelText
  const seat = new Node()
  const content = new Node()
  const layoutFrame = new Node()
  layoutFrame.getBoundingClientRect = () => ({ width: 393, height: 844, top: 0, bottom: 844 })
  const motion = Object.assign(new Node(), { matches: false })
  editor.textContent = '长草稿保持不变'
  card.append(scroll, row)
  scroll.append(editor)
  card.getBoundingClientRect = () => ({ width: 360, height: 260, top: 200 })
  scroll.getBoundingClientRect = () => ({ width: 340, height: 120, top: 210 })
  seat.getBoundingClientRect = () => ({ width: 360, height: 280, top: 200 })
  content.getBoundingClientRect = () => ({ width: 393, height: 440, top: 80 })
  card.querySelector = selector => {
    if (selector === '[data-input-scroll]') return scroll
    if (selector === '[data-composer-input]') return editor
    if (selector.includes(':scope > [class*="_row"]')) return row
    if (selector.includes('conversation.input.permission')) return permission
    if (selector.includes('conversation.input.model')) return model
    return null
  }
  card.closest = selector => selector === '[data-mobile-nav="frame"]' ? layoutFrame : selector === '[data-composer-seat]' ? seat : content
  root.style.setProperty('--mobile-compose-vv-height', 'original')
  const frames = new Map<number, () => void>()
  let nextFrame = 0
  let dispose: (() => void) | undefined
  const windowEvents = new Node()
  const viewport = Object.assign(new Node(), { height: 844, width: 393, scale: 1, offsetTop: 0, offsetLeft: 0 })
  const documentEvents = new Node()
  let menuOpen = false
  let cardVisible = true
  const fakeDocument = Object.assign(documentEvents, {
    documentElement: root, body: new Node(),
    createElement: () => new Node(),
    createElementNS: () => new Node(),
    querySelectorAll: () => cardVisible ? [card] : [],
    querySelector: () => menuOpen ? new Node() : null,
  })
  let mutate: ((record?: object) => void) | undefined
  const browserSource = source.replace(/^import .*\n/gm, '').replaceAll('export function', 'function')
  runInNewContext(`${stripTypeScriptTypes(browserSource)}; installWorkbenchComposer({})`, {
    document: fakeDocument,
    boundaryMutation: (record: { target: object }) => record.target === card, COMPOSER_BOUNDARY: '[data-composer-card]', Element: Node,
    window: Object.assign(windowEvents, {
      innerWidth: 393, innerHeight: 844, visualViewport: viewport,
      matchMedia: () => motion,
      requestAnimationFrame: (callback: () => void) => { frames.set(++nextFrame, callback); return nextFrame },
      cancelAnimationFrame: (id: number) => frames.delete(id),
    }),
    installMobileEffect: (_ctx: unknown, _label: string, install: () => () => void) => { dispose = install() },
    getComputedStyle: () => root.style,
    MutationObserver: class { constructor(callback: (records: object[]) => void) { mutate = (record = { target: card, type: 'childList' }) => callback([record]) } observe() {} disconnect() {} },
    ResizeObserver: class { observe() {} disconnect() {} },
  })
  const flush = () => {
    const callbacks = [...frames.values()]
    frames.clear()
    callbacks.forEach(callback => callback())
  }
  flush()
  const button = row.children.find(node => node.hasAttribute('data-mobile-compose-toggle'))!
  const header = card.children.find(node => node.hasAttribute('data-mobile-compose-header'))!
  const done = header.children[1]
  assert.ok(button)
  assert.equal(card.children.length, 3)
  assert.equal(button.getAttribute('aria-label'), '展开编辑')
  assert.equal(permissionText.getAttribute('data-mobile-compose-label'), '工作区')
  assert.equal(modelText.getAttribute('data-mobile-compose-label'), 'GPT-6.1-sol')
  assert.equal(permission.getAttribute('aria-label'), '访问模式，当前：工作区内修改')
  assert.equal(modelText.textContent, 'openai/gpt-6.1-sol')
  let prevented = 0
  const key = (value: string, isComposing = false) => documentEvents.listeners.get('keydown')!({ key: value, isComposing, preventDefault() { prevented++ }, stopPropagation() {} })
  button.listeners.get('pointerdown')!({ preventDefault() { prevented++ } })
  assert.equal(prevented, 1)
  button.listeners.get('click')!({ stopPropagation() {} })
  assert.equal(root.getAttribute('data-mobile-compose-expanded'), 'true')
  assert.equal(button.getAttribute('aria-label'), '收起编辑')
  key('Enter')
  key('Escape', true)
  menuOpen = true
  key('Escape')
  menuOpen = false
  assert.equal(root.getAttribute('data-mobile-compose-expanded'), 'true')
  assert.equal(prevented, 1)
  header.remove()
  const oldRow = row
  row = new Node()
  oldRow.remove()
  card.append(row)
  permission.setAttribute('aria-label', '访问模式，当前：只读')
  modelText.textContent = 'custom-unknown-model'
  mutate!()
  flush()
  assert.equal(button.parent, row)
  assert.equal(header.parent, card)
  assert.equal(oldRow.children.length, 0)
  assert.equal(root.getAttribute('data-mobile-compose-expanded'), 'true')
  assert.equal(permissionText.getAttribute('data-mobile-compose-label'), '只读')
  assert.equal(modelText.hasAttribute('data-mobile-compose-label'), false)
  done.listeners.get('click')!({ stopPropagation() {} })
  assert.equal(root.hasAttribute('data-mobile-compose-expanded'), false)
  button.listeners.get('click')!({ stopPropagation() {} })
  key('Escape')
  assert.equal(root.hasAttribute('data-mobile-compose-expanded'), false)
  assert.equal(prevented, 2)
  assert.equal(editor.parent, scroll)
  assert.equal(scroll.parent, card)
  assert.equal(editor.textContent, '长草稿保持不变')
  viewport.height = 520
  viewport.listeners.get('resize')!({})
  flush()
  assert.equal(root.getAttribute('data-mobile-workbench-keyboard'), 'true')
  assert.ok(parseFloat(root.style.getPropertyValue('--mobile-compose-nav-release')) > 56)
  assert.equal(root.style.getPropertyValue('--mobile-compose-frame-max'), '520px')
  viewport.height = 844
  viewport.listeners.get('resize')!({})
  flush()
  assert.equal(root.getAttribute('data-mobile-compose-returning'), 'true')
  documentEvents.listeners.get('transitionend')!({ target: layoutFrame, propertyName: 'max-height' })
  flush()
  assert.equal(root.hasAttribute('data-mobile-compose-returning'), false)
  viewport.height = 520
  viewport.listeners.get('resize')!({})
  flush()
  viewport.height = 844
  viewport.listeners.get('resize')!({})
  flush()
  assert.equal(root.getAttribute('data-mobile-compose-returning'), 'true')
  motion.matches = true
  motion.listeners.get('change')!({})
  flush()
  assert.equal(root.hasAttribute('data-mobile-compose-returning'), false)
  mutate!({ target: new Node(), type: 'characterData' })
  assert.equal(frames.size, 0, 'conversation tokens do not schedule composer measurements')
  cardVisible = false
  mutate!(); flush()
  assert.equal(card.hasAttribute('data-mobile-workbench-composer'), false)
  cardVisible = true
  const phase = new Node()
  phase.querySelector = selector => selector === '[data-composer-card]' ? card : null
  mutate!({ target: phase, type: 'attributes', attributeName: 'data-phase' }); flush()
  assert.equal(card.hasAttribute('data-mobile-workbench-composer'), true, 'app phase reveals the hidden-in-place card even after release')
  assert.equal(editor.parent, scroll)
  dispose!()
  assert.equal(card.children.length, 2)
  assert.equal(row.children.length, 0)
  assert.equal(row.hasAttribute('data-mobile-compose-bar'), false)
  assert.equal(oldRow.getAttribute('data-mobile-compose-bar'), 'prior')
  assert.equal(permissionText.hasAttribute('data-mobile-compose-label'), false)
  assert.equal(done.listeners.size, 0)
  assert.equal(button.listeners.size, 0)
  assert.equal(card.hasAttribute('data-mobile-workbench-composer'), false)
  assert.equal(root.hasAttribute('data-mobile-workbench-keyboard'), false)
  assert.equal(root.style.getPropertyValue('--mobile-compose-vv-height'), 'original')
  assert.equal(root.style.getPropertyValue('--mobile-compose-nav-release'), '')
  assert.equal(root.style.getPropertyValue('--mobile-compose-frame-max'), '')
  assert.equal(root.children.length, 0)
  assert.equal(viewport.listeners.size, 0)
  assert.equal(windowEvents.listeners.size, 0)
  assert.equal(motion.listeners.size, 0)
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
  assert.doesNotMatch(WORKBENCH_COMPOSER_CSS, /calc\(100% - 96px\)|text-overflow: ellipsis|flex: 1 0 100%/)
  assert.match(WORKBENCH_COMPOSER_CSS, /display: contents !important/)
  assert.match(WORKBENCH_COMPOSER_CSS, /flex-wrap: nowrap !important/)
  assert.match(WORKBENCH_COMPOSER_CSS, /width: 100% !important/)
  assert.match(WORKBENCH_COMPOSER_CSS, /\[data-mobile-nav="file-upload"\]/)
  assert.match(WORKBENCH_COMPOSER_CSS, /\[data-mobile-nav="stats-ring"\] \{\s+position: static !important/)
  assert.doesNotMatch(WORKBENCH_COMPOSER_CSS, /\[data-slot="(?:conversation\.input\.left|input\.right)"\] \{\s+display: none/)
  assert.match(WORKBENCH_COMPOSER_CSS, /width: 18px;\s+height: 18px/)
  assert.match(WORKBENCH_COMPOSER_CSS, /\[data-mobile-compose-header\]/)
  assert.match(WORKBENCH_COMPOSER_CSS, /html\[data-mobile-compose-expanded="true"\][^{]*_toBottomSlot[^}]*visibility: hidden !important/s)
  assert.match(WORKBENCH_COMPOSER_CSS, /\[data-mobile-compose-expanded="true"\] > \[data-mobile-compose-bar\] > \[data-mobile-compose-toggle\] \{\s+display: none !important/)
})

test('shared bar neutralizes the native primary offset and gives menus visible affordances', () => {
  assert.match(WORKBENCH_COMPOSER_CSS, /button\[class\*="_primary"\] \{[^}]*transform: none !important/s)
  assert.match(WORKBENCH_COMPOSER_CSS, /svg:not\(\[class\*="_chevron"\]\)/)
  assert.match(WORKBENCH_COMPOSER_CSS, /\[class\*="_chevron"\] \{\s+display: block !important;[^}]*position: absolute;[^}]*top: 50%/s)
  assert.match(WORKBENCH_COMPOSER_CSS, /padding: 0 18px 0 6px !important/)
  assert.equal((WORKBENCH_COMPOSER_CSS.match(/background: color-mix\(in srgb, currentColor 4%, transparent\)/g) ?? []).length, 4)
})

test('only model previews clamp to two lines, or name plus effort on separate lines', () => {
  assert.match(WORKBENCH_COMPOSER_CSS, /button\[aria-haspopup="menu"\] > \[class\*="_triggerLabel"\] \{[^}]*-webkit-line-clamp: 2;[^}]*max-height: 30px;[^}]*overflow: hidden/s)
  assert.match(WORKBENCH_COMPOSER_CSS, /:has\(> \[class\*="_triggerEffort"\]:not\(:empty\)\) > \[class\*="_triggerLabel"\] \{\s+-webkit-line-clamp: 1;\s+max-height: 15px/)
  assert.match(WORKBENCH_COMPOSER_CSS, /\[data-mobile-compose-label\]::after \{\s+display: -webkit-box;[^}]*-webkit-line-clamp: 2/s)
  assert.match(WORKBENCH_COMPOSER_CSS, /:has\(> \[class\*="_triggerEffort"\]:not\(:empty\)\) > \[class\*="_triggerLabel"\]\[data-mobile-compose-label\]::after \{\s+-webkit-line-clamp: 1/)
})

test('official model menu reveals full names at both levels without changing other menus', () => {
  const scope = '[role="menu"][class*="_menu"]:has([class*="_cellValue"], [class*="_modelName"])'
  const menuRules = WORKBENCH_COMPOSER_CSS.slice(WORKBENCH_COMPOSER_CSS.indexOf('/* Portal scope'), WORKBENCH_COMPOSER_CSS.indexOf(' > [class*="_trailing"] > [class*="_activity"]', WORKBENCH_COMPOSER_CSS.indexOf('/* Portal scope')))
  assert.ok(menuRules.includes(scope))
  assert.match(menuRules, /max-width: calc\(100vw - 24px\) !important/)
  assert.match(menuRules, /white-space: normal !important;\s+overflow: visible !important;\s+text-overflow: clip !important/)
  assert.match(menuRules, /-webkit-line-clamp: unset;\s+max-height: none/)
  for (const line of menuRules.split('\n').filter(line => line.includes('[role="menu"]'))) assert.ok(line.includes(scope), line)
  assert.doesNotMatch(source, /setAttribute\('(?:aria-label|title)',.*short/)
})

test('empty and loaded toolbar share edge padding, fixed hitboxes and a right-pinned tail', () => {
  assert.match(WORKBENCH_COMPOSER_CSS, /height: 60px;[\s\S]*?gap: 6px !important;\s+padding: 8px !important;\s+justify-content: flex-start !important/)
  assert.match(WORKBENCH_COMPOSER_CSS, /padding: 8px 0 0 !important/)
  assert.match(WORKBENCH_COMPOSER_CSS, /\[data-mobile-compose-toggle\] \{[^}]*margin-left: auto !important/s)
  assert.doesNotMatch(WORKBENCH_COMPOSER_CSS, /border-radius: (?:12|14|50)px/)
  assert.match(WORKBENCH_COMPOSER_CSS, /conversation.input.permission"\] > span \{\s+display: inline-flex !important/)
  assert.match(WORKBENCH_COMPOSER_CSS, /\[data-trigger-menu\] > \[role="listbox"\] \{[^}]*min-height: 0 !important;[^}]*overflow-y: auto !important;[^}]*overscroll-behavior-y: contain/s)
  assert.doesNotMatch(source, /dispatchEvent|onPick|stopImmediatePropagation/)
})

test('only an unexpanded activity wrapper containing its single empty slot loses its gap', () => {
  const rules = [...WORKBENCH_COMPOSER_CSS.matchAll(/([^{}]+)\{\s*display: none !important;\s*\}/g)]
  const activity = rules.find(rule => rule[1].includes('conversation.input.activity'))
  assert.ok(activity)
  assert.ok(activity[1].includes('> [class*="_trailing"] > [class*="_activity"]'))
  assert.ok(activity[1].includes(':not([class*="_activityExpanded"])'))
  assert.ok(activity[1].includes(':has(> [data-slot="conversation.input.activity"]:only-child:empty)'))
})

test('footer reveals the existing host percentage without copying or fabricating values', () => {
  assert.match(WORKBENCH_COMPOSER_CSS, /\[data-mobile-nav="stats-ring"\] > button > span \{\s+display: inline !important;\s+font-size: 11px !important/)
  assert.match(WORKBENCH_COMPOSER_CSS, /\[data-mobile-nav="stats-ring"\] > button > svg \{\s+width: 14px !important;\s+height: 14px !important/)
  assert.match(WORKBENCH_COMPOSER_CSS, /\[data-mobile-nav="stats-ring"\] > button \{\s+width: auto !important;\s+height: 28px/)
  assert.doesNotMatch(source, /textContent\s*=.*%/)
})
