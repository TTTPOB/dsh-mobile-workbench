import assert from 'node:assert/strict'
import test from 'node:test'
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
