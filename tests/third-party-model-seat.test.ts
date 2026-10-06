import { test } from 'node:test'
import assert from 'node:assert/strict'
import { WORKBENCH_COMPOSER_CSS } from '../src/client/styles/workbench-composer.css.ts'

test('the native model slot gets available width without a historical seat shim', () => {
  assert.match(WORKBENCH_COMPOSER_CSS, /data-slot="conversation.input.model"\] \{[^}]*flex: 1 1 0 !important;[^}]*min-width: 24px;/s)
  assert.doesNotMatch(WORKBENCH_COMPOSER_CSS, /data-seat-root|data-seat-panel/)
  assert.match(WORKBENCH_COMPOSER_CSS, /_modelName/)
  assert.match(WORKBENCH_COMPOSER_CSS, /overflow-wrap: anywhere/)
})
