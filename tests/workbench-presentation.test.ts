import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createWorkbenchPresentation, workbenchStatLabel } from '../src/client/workbench/presentation.ts'

class Node {
  attributes = new Map<string, string>()
  parentElement: Node | null = null
  selected: Node | null = null
  children: Node[] = []
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
  assert.equal(root.hasAttribute('data-workbench-trajectory'), true)
  assert.equal(countRoot.hasAttribute('data-workbench-agent-count'), true)
  setMenus([])
  presentation.update(['chat', 'trajectory'])
  assert.equal(menu.hasAttribute('data-workbench-agent-menu'), false)
  presentation.clear()
  assert.deepEqual([...header.attributes], [['data-host', 'preserved']])
  assert.equal(root.attributes.size, 0)
  assert.equal(countRoot.attributes.size, 0)
})
