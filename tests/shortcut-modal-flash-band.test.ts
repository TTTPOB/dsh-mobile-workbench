import { test } from 'node:test'
import assert from 'node:assert/strict'
import { BASE_CSS } from '../src/client/styles/base.css.ts'
import { LAYOUT_CSS } from '../src/client/styles/layout.css.ts'

test('sessions never animate a drawer over native modal portals', () => {
  const column = LAYOUT_CSS.match(/\[data-mobile-nav="frame"\] > :first-child \{([^}]*)\}/)?.[1]
  assert.ok(column)
  assert.match(column, /transform: none !important/)
  assert.match(column, /transition: none !important/)
  assert.match(column, /z-index: 10 !important/)
  assert.doesNotMatch(BASE_CSS, /data-sidebar-collapsed|data-mobile-nav="backdrop"|z-index: 1400/)
})

test('shortcut modal does not add a second animated mask', () => {
  assert.match(BASE_CSS, /_mask"\]::after \{\s*animation: none !important;\s*background: transparent !important;/)
})
