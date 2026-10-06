import { test } from 'node:test'
import assert from 'node:assert/strict'
import { LAYOUT_CSS } from '../src/client/styles/layout.css.ts'
import { WORKBENCH_HEADER_CSS } from '../src/client/styles/workbench-header.css.ts'

test('rc.2 header uses the workbench marker, not historical generation branches', () => {
  assert.match(WORKBENCH_HEADER_CSS, /header\[data-mobile-workbench-header\]/)
  assert.doesNotMatch(LAYOUT_CSS, /headerLeading|headerHidden|ZKlsPq|QsffPG/)
  assert.match(LAYOUT_CSS, /data-phase="hero"\] header\[class\*="headerBlank"\][^}]*display: none !important/s)
})

test('title and native utilities retain 44px targets with readable context', () => {
  assert.match(WORKBENCH_HEADER_CSS, /min-height: 44px !important/)
  assert.match(WORKBENCH_HEADER_CSS, /flex-wrap: wrap !important/)
  assert.match(WORKBENCH_HEADER_CSS, /data-workbench-title-info/)
  assert.match(WORKBENCH_HEADER_CSS, /data-mobile-workbench="parent"/)
})
