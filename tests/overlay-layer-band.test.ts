import { test } from 'node:test'
import assert from 'node:assert/strict'
import { MOBILE_CSS } from '../src/client/styles/index.ts'
import { COMPAT_CSS } from '../src/client/styles/compat.css.ts'
import { WORKBENCH_CSS } from '../src/client/styles/workbench.css.ts'

test('workspace portals clear the native dock, without a drawer stacking band', () => {
  const rule = COMPAT_CSS.match(/body:has\([^}]*_overlayLayer[^}]*\}/)?.[0]
  assert.ok(rule)
  assert.match(rule, /data-sidebar-right-open/)
  assert.match(rule, /z-index: 50 !important/)
  assert.doesNotMatch(MOBILE_CSS + WORKBENCH_CSS, /z-index: (?:1250|1300|1400)|data-mobile-nav="(?:backdrop|fab)"/)
})

test('workspace clears navigation once and retains safe-area inset', () => {
  assert.match(WORKBENCH_CSS, /data-sidebar-right-panel="fullscreen"[^}]*bottom: var\(--mobile-workbench-nav-height\)/s)
  assert.match(WORKBENCH_CSS, /padding-top: env\(safe-area-inset-top, 0px\)/)
})
