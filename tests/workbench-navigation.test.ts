import assert from 'node:assert/strict'
import test from 'node:test'
import { setImmediate as nextTurn } from 'node:timers/promises'
import { openPluginsModal } from '../src/client/workbench/plugin-modal.ts'
import { createHostBridge } from '../src/client/workbench/host-bridge.ts'
import { toggleDrawer } from '../src/client/effects/phone-chrome.ts'
import { subagentCounts, missingDescendantCatalogs } from '../src/client/workbench/agent-counts.ts'
import { installAgentCatalogLoader } from '../src/client/workbench/agent-catalog-loader.ts'
import { destinationAvailable, resolveDestination, viewIndex, type NavigationEvidence } from '../src/client/workbench/navigation.ts'

const base: NavigationEvidence = {
  selectedView: 'chat', filesOpen: false, agentsOpen: false,
  hasChat: true, hasTrajectory: true, hasSessionPage: true, hasAgents: false, hasFiles: true,
}
const ready = (ids: string[] = []) => ({ state: 'ready', values: { subagentCatalog: ids.map(id => ({ id })) } })

function replaceGlobal(t: { after: (fn: () => void) => void }, key: string, value: object) {
  const previous = Object.getOwnPropertyDescriptor(globalThis, key)
  Object.defineProperty(globalThis, key, { configurable: true, value })
  t.after(() => { if (previous) Object.defineProperty(globalThis, key, previous); else Reflect.deleteProperty(globalThis, key) })
}

test('bottom session is independent of native chat/trajectory views and catalog overlays', () => {
  for (const selectedView of ['chat', 'trajectory', undefined]) {
    assert.equal(resolveDestination({ ...base, selectedView }), 'session')
    assert.equal(resolveDestination({ ...base, selectedView, agentsOpen: true }), 'session')
  }
  assert.equal(resolveDestination({ ...base, filesOpen: true }), 'files')
  assert.equal(resolveDestination({ ...base, filesOpen: true, sessionsOpen: true }), 'sessions')
})

test('page capabilities remain explicit and Workspace controls do not imply an open page', () => {
  for (const destination of ['session', 'files'] as const) assert.equal(destinationAvailable(destination, base), true)
  assert.equal(destinationAvailable('session', { ...base, hasSessionPage: false }), false)
  assert.equal(destinationAvailable('agents', base), false)
  assert.equal(destinationAvailable('sessions', { ...base, hasSessions: true }), true)
  assert.equal(destinationAvailable('sessions', { ...base, hasSessions: false }), false)
  assert.equal(resolveDestination(base), 'session')
})

test('official view indices never click a different view when ledger and DOM disagree', () => {
  assert.equal(viewIndex(['chat', 'trajectory'], 'trajectory', 2), 1)
  assert.equal(viewIndex(['custom', 'chat', 'trajectory'], 'chat', 3), 1)
  assert.equal(viewIndex(['chat', 'trajectory'], 'chat', 1), -1)
  assert.equal(viewIndex([], 'chat', 0), -1)
})

test('A -> B,C and B -> D counts all and only the selected root descendants', () => {
  const snapshot = { current: 'A', byId: {}, projectionsBySession: { A: ready(['B', 'C']), B: ready(['D']), C: ready(), D: ready(), unrelated: ready(['other']) } }
  const statuses = new Map(['A', 'B', 'D', 'unrelated'].map(id => [id, { running: true }]))
  assert.deepEqual(subagentCounts(snapshot, statuses), { agentCountsState: 'ready', agentActiveCount: 2, agentTotalCount: 3 })
  snapshot.current = 'B'
  assert.deepEqual(subagentCounts(snapshot, statuses), { agentCountsState: 'ready', agentActiveCount: 1, agentTotalCount: 1 })
  for (const id of ['C', 'D']) {
    snapshot.current = id
    assert.deepEqual(subagentCounts(snapshot, statuses), { agentCountsState: 'ready', agentActiveCount: 0, agentTotalCount: 0 })
  }
})

test('live running status changes do not change a fully loaded descendant total', () => {
  const entries = Array.from({ length: 9 }, (_, i) => 'child-' + i)
  const snapshot = { current: 'root', byId: { 'child-0': { running: true } }, projectionsBySession: { root: ready(entries), ...Object.fromEntries(entries.map(id => [id, ready()])) } }
  assert.equal(subagentCounts(snapshot)?.agentActiveCount, 1)
  const statuses = new Map(entries.map(id => [id, { running: false }]))
  assert.equal(subagentCounts(snapshot, statuses)?.agentTotalCount, 9)
  assert.equal(subagentCounts(snapshot, statuses)?.agentActiveCount, 0)
  for (const id of entries.slice(0, 3)) statuses.set(id, { running: true })
  assert.equal(subagentCounts(snapshot, statuses)?.agentActiveCount, 3)
})

test('missing or failed catalogs are not leaves and never fall back to parent/sibling totals', () => {
  assert.equal(subagentCounts({ byId: {} }), undefined)
  assert.deepEqual(subagentCounts({ current: 'child', byId: { child: { parentId: 'parent' } }, projectionsBySession: { parent: ready(['child', 'sibling']) } }), { agentCountsState: 'loading' })
  assert.deepEqual(subagentCounts({ current: 'child', projectionsBySession: { child: { state: 'ready', values: {} } } }), { agentCountsState: 'unavailable' })
  assert.deepEqual(subagentCounts({ current: 'child', projectionsBySession: { child: { state: 'error', values: { subagentCatalog: [] } } } }), { agentCountsState: 'unavailable' })
  assert.deepEqual(subagentCounts({ current: 'child', projectionsBySession: { child: ready() } }), { agentCountsState: 'ready', agentActiveCount: 0, agentTotalCount: 0 })
  assert.deepEqual(subagentCounts({ current: 'A', projectionsBySession: { A: ready(['B']) } }), { agentCountsState: 'loading' })
})

test('missing discovery follows only current reachable branches and leaves loading/failure to the owner', () => {
  assert.deepEqual(missingDescendantCatalogs({ current: 'A', projectionsBySession: { A: ready(['B', 'C']), C: { state: 'loading', values: {} }, X: ready(['Y']) } }), ['B'])
  assert.deepEqual(missingDescendantCatalogs({ current: 'A', projectionsBySession: { A: { state: 'error', values: {} } } }), [])
})

test('session page returns through formal default panel without forcing chat; top views do not change pages', t => {
  const events: string[] = []
  const attributes = new Set(['data-sidebar-collapsed'])
  const tabs = ['chat', 'trajectory'].map(id => ({ getAttribute: () => id === 'trajectory' ? 'true' : 'false', click: () => { events.push(id) } }))
  const parent = { click: () => { events.push('direct-parent') } }
  const header = { querySelector: () => parent, querySelectorAll: (s: string) => s.includes('role="tablist"') ? tabs : [] }
  const frame = { hasAttribute: (key: string) => attributes.has(key), removeAttribute: () => {}, querySelector: () => header }
  replaceGlobal(t, 'document', { querySelector: (s: string) => s === '[data-mobile-nav="frame"]' ? frame : null, documentElement: { getAttribute: () => 'true' } })
  const bridge = createHostBridge(() => ['chat', 'trajectory'], () => ({}),
    () => { attributes.add('data-sidebar-collapsed'); events.push('close') },
    () => { attributes.delete('data-sidebar-collapsed'); events.push('sessions') },
    { show: () => { events.push('default-panel') }, hasSession: () => true })
  bridge.activate('sessions')
  bridge.activate('session')
  assert.deepEqual(events, ['sessions', 'close', 'default-panel'])
  assert.equal(bridge.evidence().selectedView, 'trajectory')
  const page = resolveDestination(bridge.evidence())
  bridge.selectView('chat')
  assert.equal(resolveDestination(bridge.evidence()), page)
  assert.equal(events.at(-1), 'chat')
  bridge.returnParent()
  assert.equal(events.at(-1), 'direct-parent')
  let toggles = 0
  toggleDrawer({ layout: { toggleSidebar: () => { toggles++ } } } as Parameters<typeof toggleDrawer>[0])
  assert.equal(toggles, 1)
})

test('global plugin panel and hero both return to default session without waiting for a header', t => {
  const calls: string[] = []
  let hasSession = true
  const frame = { hasAttribute: () => true, removeAttribute: () => {}, querySelector: () => null }
  replaceGlobal(t, 'document', { querySelector: (s: string) => s === '[data-mobile-nav="frame"]' ? frame : null })
  const bridge = createHostBridge(() => ['chat', 'trajectory'], () => ({}), () => {}, () => {}, {
    show: () => { calls.push('selectPanel(null)') }, hasSession: () => hasSession,
  })
  bridge.activate('session')
  hasSession = false
  bridge.activate('session')
  assert.deepEqual(calls, ['selectPanel(null)', 'selectPanel(null)'])
  assert.equal(bridge.evidence().hasSessionPage, true)
})

test('native sibling switchers are excluded when the current descendant catalog is absent', t => {
  let queried = ''
  const header = { querySelector: () => null, querySelectorAll: (s: string) => { queried = s; return [] } }
  const frame = { hasAttribute: () => true, querySelector: () => header }
  replaceGlobal(t, 'document', { querySelector: (s: string) => s === '[data-mobile-nav="frame"]' ? frame : null })
  const bridge = createHostBridge(() => ['chat', 'trajectory'])
  assert.equal(bridge.evidence().hasAgents, false)
  assert.match(queried, /:not\(\[class\*="_switcherTrigger"\]\)/)
})

function loaderFixture(t: { after: (fn: () => void) => void }) {
  const snapshot: { current: string; projectionsBySession: Record<string, { state: string; values: { subagentCatalog?: { id: string }[] } }> } = { current: 'A', projectionsBySession: { A: ready(['B', 'C', 'E']) } }
  const listeners = new Set<() => void>()
  const calls: string[] = []
  const resolve = new Map<string, (ids: string[] | Error) => void>()
  const publish = () => { for (const listener of [...listeners]) listener() }
  const source = { getSnapshot: () => snapshot, subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener) } } }
  const refresh = (id: string) => {
    calls.push(id)
    snapshot.projectionsBySession[id] = { state: 'loading', values: {} }
    return new Promise<void>((done, fail) => { resolve.set(id, ids => {
      snapshot.projectionsBySession[id] = ids instanceof Error ? { state: 'error', values: {} } : ready(ids)
      publish()
      if (ids instanceof Error) fail(ids); else done()
    }) })
  }
  const loader = installAgentCatalogLoader(source, refresh, () => true)
  t.after(loader.dispose)
  return { snapshot, listeners, calls, resolve, publish, loader }
}

test('owner baseline reads have two concurrency slots; source/status updates do not repeat in-flight reads', async t => {
  const f = loaderFixture(t)
  assert.deepEqual(f.calls, ['B', 'C'])
  f.publish(); f.publish(); f.loader.update()
  assert.deepEqual(f.calls, ['B', 'C'])
  f.resolve.get('B')?.([])
  await nextTurn()
  assert.deepEqual(f.calls, ['B', 'C', 'E'])
  f.resolve.get('C')?.([]); f.resolve.get('E')?.([])
  await nextTurn()
  assert.equal(subagentCounts(f.snapshot)?.agentTotalCount, 3)
  f.publish()
  assert.equal(f.calls.length, 3)
})

test('switching roots drops old queued branches and old completion cannot change the new root count', async t => {
  const f = loaderFixture(t)
  f.snapshot.current = 'X'; f.snapshot.projectionsBySession.X = ready(['Y']); f.publish()
  f.resolve.get('B')?.(['D'])
  await nextTurn()
  assert.deepEqual(f.calls, ['B', 'C', 'Y'])
  f.resolve.get('Y')?.([]); f.resolve.get('C')?.([])
  await nextTurn()
  assert.equal(subagentCounts(f.snapshot)?.agentTotalCount, 1)
  assert.equal(f.calls.includes('D'), false)
  assert.equal(f.calls.includes('E'), false)
})

test('new grandchild projections drive incremental loads; failure is quiet until a new public baseline', async t => {
  const f = loaderFixture(t)
  f.resolve.get('B')?.([]); f.resolve.get('C')?.([])
  await nextTurn()
  f.resolve.get('E')?.([])
  await nextTurn()
  f.snapshot.projectionsBySession.B = ready(['D']); f.publish()
  assert.equal(f.calls.at(-1), 'D')
  assert.equal(subagentCounts(f.snapshot)?.agentCountsState, 'loading')
  f.resolve.get('D')?.(new Error('network failed'))
  await nextTurn()
  assert.equal(subagentCounts(f.snapshot)?.agentCountsState, 'unavailable')
  f.publish(); f.publish()
  assert.equal(f.calls.filter(id => id === 'D').length, 1)
  // The connection owner clears projection stores on recovery, while summaries remain.
  delete f.snapshot.projectionsBySession.D; f.publish()
  assert.equal(f.calls.filter(id => id === 'D').length, 2)
  f.resolve.get('D')?.([])
  await nextTurn()
  assert.equal(subagentCounts(f.snapshot)?.agentTotalCount, 4)
})

test('disposing catalog discovery removes its subscription and launches no queued reads after settlement', async t => {
  const f = loaderFixture(t)
  f.loader.dispose()
  assert.equal(f.listeners.size, 0)
  f.resolve.get('B')?.(['D']); f.resolve.get('C')?.([])
  await nextTurn()
  assert.deepEqual(f.calls, ['B', 'C'])
})

test('optional native Plugins modal stops panel selection before sidebar close without matching translated labels', t => {
  class PanelElement { closest() { return this } }
  const plugins = new PanelElement(), other = new PanelElement()
  let rows = [plugins, other]
  let mobile = true, modalCalls = 0, intercepted = 0, available = true
  const panelList = { contains: (row: object) => rows.includes(row as PanelElement), querySelectorAll: () => rows }
  replaceGlobal(t, 'Element', PanelElement)
  replaceGlobal(t, 'document', { documentElement: { getAttribute: () => mobile ? 'true' : null }, querySelector: () => panelList })
  const ctx = {
    get: () => available ? { openModal: () => { modalCalls++ } } : {},
    slots: { entriesOfSlot: () => [{ options: { id: 'other', order: 10 } }, { options: { id: 'plugins', order: 0 } }] },
  } as Parameters<typeof openPluginsModal>[0]
  const event = { target: plugins, preventDefault: () => { intercepted++ }, stopImmediatePropagation: () => { intercepted++ } } as MouseEvent
  assert.equal(openPluginsModal(ctx, event), true)
  assert.equal(modalCalls, 1)
  assert.equal(intercepted, 2)
  assert.equal(openPluginsModal(ctx, { ...event, target: other } as MouseEvent), false)
  available = false
  assert.equal(openPluginsModal(ctx, event), false, 'missing official seam leaves the original native behavior')
  available = true; mobile = false
  assert.equal(openPluginsModal(ctx, event), false)
  mobile = true; rows = [plugins]
  assert.equal(openPluginsModal(ctx, event), false, 'ledger/DOM mismatch never intercepts another panel')
  assert.equal(modalCalls, 1)
})

test('own descendant catalog opens by the native pinned click, while second activation still closes with Escape', t => {
  let open = false
  const events: string[] = []
  const trigger = {
    getAttribute: (key: string) => key === 'aria-expanded' ? String(open) : null,
    click: () => { events.push('own-count-click'); open = true },
    dispatchEvent: () => { assert.fail('keyboard open does not carry the rc2 own-count pinned-click semantics') },
  }
  const tree = { dispatchEvent: (event: KeyboardEvent) => { assert.equal(event.key, 'Escape'); events.push('native-Escape'); open = false } }
  const header = { querySelector: () => null, querySelectorAll: (selector: string) => selector.includes('role="tablist"') ? [] : [trigger] }
  const frame = { hasAttribute: () => true, querySelector: () => header }
  class KeyEvent extends Event {
    key: string
    constructor(type: string, init: KeyboardEventInit) { super(type, init); this.key = init.key ?? '' }
  }
  replaceGlobal(t, 'KeyboardEvent', KeyEvent)
  replaceGlobal(t, 'document', { querySelector: (selector: string) => selector === '[data-mobile-nav="frame"]' ? frame : selector.startsWith('[role="tree"]') ? tree : null })
  const bridge = createHostBridge(() => ['chat', 'trajectory'])
  bridge.activate('agents')
  assert.equal(bridge.evidence().agentsOpen, true)
  assert.deepEqual(events, ['own-count-click'])
  bridge.activate('agents')
  assert.equal(bridge.evidence().agentsOpen, false)
  assert.deepEqual(events, ['own-count-click', 'native-Escape'])
  // Native outside dismissal may finish between pointerdown and the owned click.
  bridge.activate('agents', true)
  assert.equal(open, false)
  assert.equal(events.length, 2, 'the second touch must not reopen the already dismissed catalog')
})
