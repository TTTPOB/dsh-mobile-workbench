import assert from 'node:assert/strict'
import test from 'node:test'
import { createHostBridge } from '../src/client/workbench/host-bridge.ts'
import { toggleDrawer } from '../src/client/effects/phone-chrome.ts'
import { subagentCounts } from '../src/client/workbench/agent-counts.ts'
import { destinationAvailable, resolveDestination, viewIndex, type NavigationEvidence } from '../src/client/workbench/navigation.ts'

const base: NavigationEvidence = {
  selectedView: 'chat', filesOpen: false, agentsOpen: false,
  hasChat: true, hasTrajectory: true, hasAgents: false, hasFiles: true,
}

test('selection follows official tabs, not the last navigation request', () => {
  assert.equal(resolveDestination(base), 'chat')
  assert.equal(resolveDestination({ ...base, selectedView: 'trajectory' }), 'trajectory')
  assert.equal(resolveDestination({ ...base, selectedView: undefined }), 'chat')
})

test('mounted Files controls do not select a collapsed file panel', () => {
  assert.equal(destinationAvailable('files', base), true)
  assert.equal(resolveDestination({ ...base, filesOpen: false }), 'chat')
  assert.equal(resolveDestination({ ...base, selectedView: 'trajectory', filesOpen: false }), 'trajectory')
})

test('file pages take precedence while agent overlays preserve the underlying page', () => {
  assert.equal(resolveDestination({ ...base, agentsOpen: true }), 'chat')
  assert.equal(resolveDestination({ ...base, selectedView: 'trajectory', filesOpen: true }), 'files')
  assert.equal(resolveDestination({ ...base, agentsOpen: true, filesOpen: true }), 'files')
})

test('opening and closing the official child catalog never selects a different page', () => {
  assert.equal(resolveDestination({ ...base, agentsOpen: true }), 'chat')
  assert.equal(resolveDestination({ ...base, agentsOpen: false, selectedView: 'trajectory' }), 'trajectory')
})

test('missing subagents and unavailable official capabilities are disabled', () => {
  assert.equal(destinationAvailable('agents', base), false)
  assert.equal(destinationAvailable('agents', { ...base, hasAgents: true }), true)
  for (const destination of ['chat', 'trajectory', 'files'] as const) {
    assert.equal(destinationAvailable(destination, base), true)
  }
  assert.equal(destinationAvailable('trajectory', { ...base, hasTrajectory: false }), false)
  assert.equal(destinationAvailable('chat', { ...base, hasChat: false }), false)
  assert.equal(destinationAvailable('files', { ...base, hasFiles: false }), false)
})

test('stable official view ids map onto the ordered role tab strip', () => {
  assert.equal(viewIndex(['chat', 'trajectory'], 'trajectory', 2), 1)
  assert.equal(viewIndex(['custom', 'chat', 'trajectory'], 'chat', 3), 1)
  assert.equal(viewIndex(['chat', 'trajectory'], 'missing', 2), -1)
})

test('ledger and DOM mismatch never clicks a different view', () => {
  assert.equal(viewIndex(['chat', 'trajectory'], 'chat', 1), -1)
  assert.equal(viewIndex([], 'chat', 0), -1)
})

test('catalog counts retain the total while live running status changes', () => {
  const entries = Array.from({ length: 9 }, (_, i) => ({ id: 'child-' + i }))
  const snapshot = { current: 'root', byId: { 'child-0': { running: true } },
    projectionsBySession: { root: { values: { subagentCatalog: entries } } } }
  assert.deepEqual(subagentCounts(snapshot), { agentActiveCount: 1, agentTotalCount: 9 })
  const statuses = new Map(entries.map(entry => [entry.id, { running: false }]))
  assert.deepEqual(subagentCounts(snapshot, statuses), { agentActiveCount: 0, agentTotalCount: 9 })
  for (const entry of entries.slice(0, 3)) statuses.set(entry.id, { running: true })
  assert.deepEqual(subagentCounts(snapshot, statuses), { agentActiveCount: 3, agentTotalCount: 9 })
})

test('child header prefers its own populated catalog and otherwise its parent switcher', () => {
  const snapshot = { byId: { child: { id: 'child', retainedBy: { mainView: 1 }, parentId: 'parent' } },
    projectionsBySession: {
      child: { state: 'ready', values: { subagentCatalog: [] as { id: string }[] } },
      parent: { values: { subagentCatalog: [{ id: 'child' }, { id: 'sibling' }] } },
    } }
  assert.deepEqual(subagentCounts(snapshot), { agentActiveCount: 0, agentTotalCount: 2 })
  snapshot.projectionsBySession.child.state = 'error'
  assert.deepEqual(subagentCounts(snapshot), { agentActiveCount: 0, agentTotalCount: 0 })
  snapshot.projectionsBySession.child.state = 'ready'
  snapshot.projectionsBySession.child.values.subagentCatalog.push({ id: 'grandchild' })
  assert.deepEqual(subagentCounts(snapshot), { agentActiveCount: 0, agentTotalCount: 1 })
})

test('missing catalog stays unknown while a loaded empty root catalog reports zero', () => {
  assert.equal(subagentCounts({ current: 'root', byId: {} }), undefined)
  assert.equal(subagentCounts({ byId: {} }), undefined)
  assert.deepEqual(subagentCounts({ current: 'root', byId: {},
    projectionsBySession: { root: { values: { subagentCatalog: [] } } } }),
  { agentActiveCount: 0, agentTotalCount: 0 })
})

test('sessions page follows native sidebar state before other page evidence', () => {
  assert.equal(resolveDestination({ ...base, sessionsOpen: true, filesOpen: true }), 'sessions')
  assert.equal(resolveDestination({ ...base, sessionsOpen: false, selectedView: 'trajectory', agentsOpen: true }), 'trajectory')
  assert.equal(destinationAvailable('sessions', { ...base, hasSessions: true }), true)
  assert.equal(destinationAvailable('sessions', { ...base, hasSessions: false }), false)
})

test('page activation reuses native sidebar state and closes sessions before switching view', t => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'document')
  t.after(() => {
    if (original) Object.defineProperty(globalThis, 'document', original)
    else Reflect.deleteProperty(globalThis, 'document')
  })
  const events: string[] = []
  const attributes = new Set(['data-sidebar-collapsed'])
  const tabs = ['chat', 'trajectory'].map(id => ({
    getAttribute: () => id === 'chat' ? 'true' : 'false',
    click: () => { events.push(id) },
  }))
  const header = { querySelectorAll: (selector: string) => selector.includes('role="tablist"') ? tabs : [] }
  const frame = {
    hasAttribute: (key: string) => attributes.has(key),
    removeAttribute: (key: string) => { attributes.delete(key) },
    querySelector: () => header,
  }
  Object.defineProperty(globalThis, 'document', { configurable: true, value: {
    querySelector: (selector: string) => selector === '[data-mobile-nav="frame"]' ? frame : null,
    documentElement: { getAttribute: (key: string) => key === 'data-mobile-workbench-active' ? 'true' : null },
  } })
  const bridge = createHostBridge(() => ['chat', 'trajectory'], () => ({}),
    () => { attributes.add('data-sidebar-collapsed'); events.push('close') },
    () => { attributes.delete('data-sidebar-collapsed'); events.push('sessions') })
  bridge.activate('sessions')
  assert.equal(resolveDestination(bridge.evidence()), 'sessions')
  bridge.activate('trajectory')
  assert.equal(bridge.evidence().sessionsOpen, false)
  assert.deepEqual(events, ['sessions', 'close', 'trajectory'])
  let toggles = 0
  toggleDrawer({ layout: { toggleSidebar: () => { toggles++ } } } as Parameters<typeof toggleDrawer>[0])
  assert.equal(toggles, 1, 'workbench uses native immediate toggle rather than drawer-close animation')
})

test('global panels return through the public Conversation selection before native tabs remount', t => {
  const originalDocument = Object.getOwnPropertyDescriptor(globalThis, 'document')
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window')
  t.after(() => {
    if (originalDocument) Object.defineProperty(globalThis, 'document', originalDocument)
    else Reflect.deleteProperty(globalThis, 'document')
    if (originalWindow) Object.defineProperty(globalThis, 'window', originalWindow)
    else Reflect.deleteProperty(globalThis, 'window')
  })
  const calls: string[] = []
  let hasSession = true
  let headerMounted = false
  let afterMount: (() => void) | undefined
  const header = { querySelectorAll: (selector: string) => selector.includes('role="tablist"')
    ? ['chat', 'trajectory'].map(id => ({ getAttribute: () => id === 'chat' ? 'true' : 'false', click: () => { calls.push(id) } })) : [] }
  const frame = { hasAttribute: () => true, removeAttribute: () => {}, querySelector: () => headerMounted ? header : null }
  Object.defineProperty(globalThis, 'document', { configurable: true, value: {
    querySelector: (selector: string) => selector === '[data-mobile-nav="frame"]' ? frame : null,
  } })
  Object.defineProperty(globalThis, 'window', { configurable: true, value: {
    requestAnimationFrame: (callback: () => void) => { afterMount = callback; return 1 },
    cancelAnimationFrame: () => { afterMount = undefined },
  } })
  const bridge = createHostBridge(() => ['chat', 'trajectory'], () => ({}), () => {}, () => {}, {
    show: () => { calls.push('selectPanel(null)') }, hasSession: () => hasSession,
  })
  assert.equal(bridge.evidence().hasChat, true, 'plugin panel must not disable Chat')
  assert.equal(bridge.evidence().hasTrajectory, true, 'existing session retains Trace capability')
  bridge.activate('trajectory')
  assert.deepEqual(calls, ['selectPanel(null)'])
  headerMounted = true
  afterMount?.()
  assert.deepEqual(calls, ['selectPanel(null)', 'trajectory'])
  headerMounted = false
  hasSession = false
  assert.equal(bridge.evidence().hasChat, true)
  assert.equal(bridge.evidence().hasTrajectory, false)
  bridge.activate('chat')
  assert.equal(calls.at(-1), 'selectPanel(null)', 'hero returns without a session tab strip')
  hasSession = true
  bridge.activate('trajectory')
  bridge.clear()
  assert.equal(afterMount, undefined, 'dispose cancels the single remount callback')
})
