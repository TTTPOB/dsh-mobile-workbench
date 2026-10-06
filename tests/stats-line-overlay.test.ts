import { test } from 'node:test'
import assert from 'node:assert/strict'
import { WORKBENCH_COMPOSER_CSS } from '../src/client/styles/workbench-composer.css.ts'
import { WORKBENCH_CSS } from '../src/client/styles/workbench.css.ts'

test('context meter stays in its native footer with visible percentage', () => {
  assert.match(WORKBENCH_COMPOSER_CSS, /data-mobile-nav="stats-ring"\] \{\s*position: static !important/)
  assert.match(WORKBENCH_COMPOSER_CSS, /data-mobile-nav="stats-ring"\] > button > span \{\s*display: inline !important;\s*font-size: 11px !important/)
  assert.match(WORKBENCH_CSS, /content: attr\(data-workbench-stat-label\)/)
})
