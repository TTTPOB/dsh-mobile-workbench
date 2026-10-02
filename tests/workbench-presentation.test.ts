import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createWorkbenchPresentation, workbenchStatLabel } from '../src/client/workbench/presentation.ts'
import { WORKBENCH_CSS } from '../src/client/styles/workbench.css.ts'
import { WORKBENCH_HEADER_CSS } from '../src/client/styles/workbench-header.css.ts'
import { WORKBENCH_TRAJECTORY_CSS } from '../src/client/styles/workbench-trajectory.css.ts'

class Node {
  attributes = new Map<string, string>()
  parentElement: Node | null = null
  selected: Node | null = null
  children: Node[] = []
  textContent: string | null = null
  prepend(child: Node) { child.parentElement = this; this.children.unshift(child) }
  remove() {
    if (this.parentElement) this.parentElement.children = this.parentElement.children.filter(child => child !== this)
    this.parentElement = null
  }
  getAttribute(key: string) { return this.attributes.get(key) ?? null }
  hasAttribute(key: string) { return this.attributes.has(key) }
  setAttribute(key: string, value: string) { this.attributes.set(key, value) }
  removeAttribute(key: string) { this.attributes.delete(key) }
  querySelector(selector: string) { return selector.includes('session.header.actions') ? this.selected : null }
  querySelectorAll() { return this.children }
  closest() { return this.parentElement }
}

function fixture(t: { after: (fn: () => void) => void }) {
  const header = new Node()
  const root = new Node()
  const split = new Node()
  split.parentElement = root
  const scroll = new Node()
  scroll.parentElement = split
  const count = new Node()
  const countRoot = new Node()
  count.parentElement = countRoot
  header.selected = count
  let menus: Node[] = []
  const original = Object.getOwnPropertyDescriptor(globalThis, 'document')
  Object.defineProperty(globalThis, 'document', { configurable: true, value: {
    querySelector: (selector: string) => selector.startsWith('header') ? header : scroll,
    querySelectorAll: () => menus,
    createElement: () => new Node(),
  } })
  t.after(() => {
    if (original) Object.defineProperty(globalThis, 'document', original)
    else Reflect.deleteProperty(globalThis, 'document')
  })
  return { header, root, countRoot, setMenus: (value: Node[]) => { menus = value } }
}

test('metric summaries preserve native values and leave unknown formats alone', () => {
  assert.equal(workbenchStatLabel('2 轮 4 步 · 1913 tok/s'), '2 轮 · 4 步')
  assert.equal(workbenchStatLabel('1.7K tok · 缓存命中 30%'), '1.7K tok')
  assert.equal(workbenchStatLabel('unknown format'), null)
})

test('remove duplicate native tabs only when the workbench represents every view', t => {
  const { header } = fixture(t)
  const presentation = createWorkbenchPresentation()
  presentation.update(['chat', 'trajectory'])
  assert.equal(header.hasAttribute('data-workbench-tabs-owned'), true)
  presentation.update(['chat', 'trajectory', 'plugin-view'])
  assert.equal(header.hasAttribute('data-workbench-tabs-owned'), false)
})

test('child header uses nearest native ancestor and clears its markers on return', t => {
  const { header } = fixture(t)
  const grandparent = new Node()
  grandparent.parentElement = new Node()
  const parent = new Node()
  parent.parentElement = new Node()
  header.children = [grandparent, parent]
  const presentation = createWorkbenchPresentation()
  presentation.update(['chat', 'trajectory'])
  assert.equal(parent.hasAttribute('data-workbench-parent'), true)
  assert.equal(grandparent.parentElement.hasAttribute('data-workbench-ancestor'), true)
  header.children = []
  presentation.update(['chat', 'trajectory'])
  assert.equal(parent.hasAttribute('data-workbench-parent'), false)
  assert.equal(header.hasAttribute('data-workbench-child'), false)
})

test('native catalog and inspector markers are reversible without changing host attributes', t => {
  const { header, root, countRoot, setMenus } = fixture(t)
  const tree = new Node()
  const menu = new Node()
  tree.parentElement = menu
  setMenus([tree])
  header.setAttribute('data-host', 'preserved')
  const presentation = createWorkbenchPresentation()
  presentation.update(['chat', 'trajectory'])
  assert.equal(menu.hasAttribute('data-workbench-agent-menu'), true)
  const heading = menu.children[0]
  assert.equal(heading.hasAttribute('data-workbench-agent-heading'), true)
  presentation.update(['chat', 'trajectory'])
  assert.equal(menu.children.length, 1)
  assert.equal(tree.parentElement, menu)
  assert.equal(root.hasAttribute('data-workbench-trajectory'), true)
  assert.equal(countRoot.hasAttribute('data-workbench-agent-count'), true)
  setMenus([])
  presentation.update(['chat', 'trajectory'])
  assert.equal(menu.hasAttribute('data-workbench-agent-menu'), false)
  assert.equal(heading.parentElement, null)
  presentation.clear()
  assert.deepEqual([...header.attributes], [['data-host', 'preserved']])
  assert.equal(root.attributes.size, 0)
  assert.equal(countRoot.attributes.size, 0)
})

test('drawer visibility and reservation share open and fading-backdrop gates', () => {
  assert.match(WORKBENCH_CSS, /:has\(\[data-mobile-nav="frame"\]:not\(\[data-sidebar-collapsed\]\)\)/)
  assert.match(WORKBENCH_CSS, /:has\(\[data-mobile-nav="backdrop"\]\)[\s\S]*?--mobile-workbench-nav-height: 0px !important/)
})

test('inspector remains in the native split and reserves composer clearance once', () => {
  assert.match(WORKBENCH_TRAJECTORY_CSS, /grid-template-rows: minmax\(0, 2fr\) minmax\(0, 3fr\)/)
  assert.match(WORKBENCH_TRAJECTORY_CSS, /padding-bottom: var\(--dsh-trajectory-bottom-clearance\)/)
  assert.doesNotMatch(WORKBENCH_TRAJECTORY_CSS, /position: fixed|z-index: (65|70)/)
  assert.match(WORKBENCH_TRAJECTORY_CSS, /header\[class\*="_schemaIntro"\][\s\S]*?padding: 12px 14px 6px !important/)
})

test('catalog title owns a nonshrinking row outside the scrolling native tree', () => {
  assert.match(WORKBENCH_HEADER_CSS, /> \[data-workbench-agent-heading\][\s\S]*?flex: none/)
  assert.match(WORKBENCH_HEADER_CSS, /> \[role="tree"\][\s\S]*?min-height: 0 !important/)
  assert.doesNotMatch(WORKBENCH_HEADER_CSS, /agent-menu\]::before/)
})

test('jobs and more have separate touch targets and matching title reservations', () => {
  assert.match(WORKBENCH_HEADER_CSS, /--mobile-workbench-header-utilities-width: 44px/)
  assert.match(WORKBENCH_HEADER_CSS, /:not\(\[aria-haspopup\]\) > \[class\*="_count"\][\s\S]*?--mobile-workbench-header-utilities-width: 96px/)
  assert.match(WORKBENCH_HEADER_CSS, /padding: 0 var\(--mobile-workbench-header-utilities-width\) 0 44px !important/)
  assert.match(WORKBENCH_HEADER_CSS, /right: 60px !important;[\s\S]*?width: 44px !important/)
  assert.doesNotMatch(WORKBENCH_HEADER_CSS, /QsffPG/)
})
