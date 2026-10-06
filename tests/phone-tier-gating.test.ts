import { test } from 'node:test'
import assert from 'node:assert/strict'
import { BASE_CSS } from '../src/client/styles/base.css.ts'
import { WORKBENCH_HEADER_CSS } from '../src/client/styles/workbench-header.css.ts'

test('phone and tablet share wrapping header geometry, not device-specific offsets', () => {
  assert.match(WORKBENCH_HEADER_CSS, /^@media \(max-width: 1023px\) and \(pointer: coarse\)/)
  assert.match(WORKBENCH_HEADER_CSS, /flex-wrap: wrap !important/)
  assert.doesNotMatch(WORKBENCH_HEADER_CSS, /top: 42px|margin-top: -4px|min-height: 26px/)
})

test('only phones hide shortcut search; wider touch screens center native cards', () => {
  assert.match(BASE_CSS, /@media \(max-width: 767px\)\s*\{\s*\[aria-modal="true"\]\[data-shortcut-modal="shortcuts"\] \[class\*="_searchRow"\] \{ display: none !important;/)
  assert.match(BASE_CSS, /@media \(min-width: 768px\) and \(max-width: 1023px\) and \(pointer: coarse\)/)
  assert.match(BASE_CSS, /720px/)
})
