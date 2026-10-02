import assert from 'node:assert/strict'
import test from 'node:test'
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

test('visible official panels take selection precedence', () => {
  assert.equal(resolveDestination({ ...base, agentsOpen: true }), 'agents')
  assert.equal(resolveDestination({ ...base, selectedView: 'trajectory', filesOpen: true }), 'files')
  assert.equal(resolveDestination({ ...base, agentsOpen: true, filesOpen: true }), 'files')
})

test('returning from the official child catalog restores the host view selection', () => {
  assert.equal(resolveDestination({ ...base, agentsOpen: true }), 'agents')
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
