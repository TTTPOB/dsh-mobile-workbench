// Files navigation delegates exclusively to native rc.2 controls.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { openFilesPanel, HOST_FILES_CLOSER, HOST_FILES_OPENER } from '../src/client/components/open-files-panel.ts'

const openerDoc = (found: unknown) => ({ querySelector: (selector: string) => (selector === HOST_FILES_OPENER ? found : null) })
const bothDoc = (opener: unknown, closer: unknown) => ({ querySelector: (selector: string) => (selector === HOST_FILES_OPENER ? opener : selector === HOST_FILES_CLOSER ? closer : null) })

test('openFilesPanel: clicks the host right-sidebar opener when it exists', () => {
  let clicks = 0
  const opened = openFilesPanel(openerDoc({ click: () => { clicks += 1 } }))
  assert.equal(opened, true)
  assert.equal(clicks, 1)
})

test('openFilesPanel: returns false when native controls are absent', () => {
  const calls: string[] = []
  const opened = openFilesPanel(openerDoc(null))
  assert.equal(opened, false)
  assert.deepEqual(calls, [])
})

test('openFilesPanel: no frame and no host opener is a no-op', () => {
  assert.equal(openFilesPanel(openerDoc(null)), false)
})

test('openFilesPanel: a non-clickable match is unavailable instead of throwing', () => {
  const calls: string[] = []
  // A non-clickable match does not invent workspace state.
  assert.equal(openFilesPanel(openerDoc({})), false)
  assert.deepEqual(calls, [])
})

// The host unmounts the opener while the panel is open, so a control keyed on
// the opener alone went dead exactly when the user had the panel already up.
test('openFilesPanel: uses the collapse control when the panel is already open', () => {
  let collapses = 0
  let opens = 0
  const opened = openFilesPanel(bothDoc(null, { click: () => { collapses += 1 } }))
  assert.equal(opened, true)
  assert.equal(collapses, 1)
  assert.equal(opens, 0)
})

test('openFilesPanel: prefers the opener when both controls are present', () => {
  let collapses = 0
  let opens = 0
  const opened = openFilesPanel(bothDoc({ click: () => { opens += 1 } }, { click: () => { collapses += 1 } }))
  assert.equal(opened, true)
  assert.equal(opens, 1)
  assert.equal(collapses, 0)
})
