import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createUpdateNoticeState } from '../src/client/workbench/update-notice-state.ts'

// Initial start stays idle; the first explicit sync failure already needs recovery.
test('recovery notice ignores boot failures, hides during sync and respects dismissal until recovery', () => {
  const notice = createUpdateNoticeState()
  const healthy = { syncing: false, failures: [] }
  const failed = { syncing: false, failures: [{ id: 'example-ui', message: 'canary failure' }] }
  assert.equal(notice.update(healthy), false)
  assert.equal(notice.update(failed), false)
  assert.equal(notice.update({ ...healthy, syncing: true }), false)
  assert.equal(notice.update(failed), true)
  assert.equal(notice.update(healthy), false)
  assert.equal(notice.update({ ...healthy, syncing: true }), false)
  assert.equal(notice.update(healthy), false)
  assert.equal(notice.update(failed), true)
  notice.dismiss()
  assert.equal(notice.update(failed), false)
  assert.equal(notice.update({ ...failed, syncing: true }), false)
  assert.equal(notice.update(failed), false)
  assert.equal(notice.update(healthy), false)
  assert.equal(notice.update(failed), true)
  assert.equal(notice.update({ ...failed, syncing: true }), false)
  assert.equal(notice.update(healthy), false)
})
