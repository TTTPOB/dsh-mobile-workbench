import { test } from 'node:test'
import assert from 'node:assert/strict'
import { LAYOUT_CSS } from '../src/client/styles/layout.css.ts'

test('native sessions tree skips off-screen rendering inside the mobile page', () => {
  assert.match(LAYOUT_CSS, /^@media \(max-width: 1023px\) and \(pointer: coarse\)/)
  assert.match(LAYOUT_CSS, /\[data-mobile-nav="frame"\] > :first-child \[role="tree"\] \{\s*content-visibility: auto;\s*contain-intrinsic-size: auto 600px;/)
  assert.doesNotMatch(LAYOUT_CSS, /translateX/)
})
