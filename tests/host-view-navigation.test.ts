import assert from 'node:assert/strict'
import test from 'node:test'
import { createHostBridge } from '../src/client/workbench/host-bridge.ts'

test('visible and folded Views retain identity across registration order and locale changes', t => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'document')
  t.after(() => { if (original) Object.defineProperty(globalThis, 'document', original); else Reflect.deleteProperty(globalThis, 'document') })
  let language = 'en', active = 'chat', folded = false, menuOpen = false
  const labels = () => language === 'en' ? { chat: 'Read', trajectory: 'Inspect' } : { chat: '阅读', trajectory: '检查' }
  const entries = () => ['trajectory', 'chat'].map(id => ({ id, label: labels()[id as keyof ReturnType<typeof labels>] }))
  const button = (id: 'chat' | 'trajectory') => ({
    get textContent() { return labels()[id] },
    getAttribute: (key: string) => key === 'aria-selected' ? String(active === id) : null,
    click: () => { active = id },
  })
  const chat = button('chat'), trace = button('trajectory')
  const more = { getAttribute: () => String(menuOpen), click: () => { menuOpen = true } }
  const row = { get textContent() { return labels().trajectory }, click: () => { active = 'trajectory'; menuOpen = false } }
  const header = {
    querySelectorAll: (selector: string) => selector.includes('data-conversation-tabs') ? folded ? [chat] : [chat, trace] : [],
    querySelector: (selector: string) => selector.includes('_viewsMoreActive') ? folded && active === 'trajectory' ? more : null : more,
  }
  const frame = { hasAttribute: () => false, querySelector: () => header }
  Object.defineProperty(globalThis, 'document', { configurable: true, value: {
    querySelector: (selector: string) => selector === '[data-mobile-nav="frame"]' ? frame : null,
    querySelectorAll: () => menuOpen ? [row] : [],
  } })
  const bridge = createHostBridge(entries)
  assert.equal(bridge.evidence().selectedView, 'chat')
  bridge.selectView('trajectory')
  assert.equal(bridge.evidence().selectedView, 'trajectory')
  folded = true
  assert.equal(bridge.evidence().selectedView, 'trajectory')
  bridge.selectView('chat')
  assert.equal(bridge.evidence().selectedView, 'chat')
  bridge.selectView('trajectory')
  assert.equal(menuOpen, false)
  assert.equal(bridge.evidence().selectedView, 'trajectory')
  language = 'zh'
  bridge.selectView('chat')
  assert.equal(bridge.evidence().selectedView, 'chat')
  bridge.selectView('trajectory')
  assert.equal(bridge.evidence().selectedView, 'trajectory')
  bridge.clear()
})
