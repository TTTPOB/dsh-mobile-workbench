import { test } from 'node:test'
import assert from 'node:assert/strict'
import { BASE_CSS } from '../src/client/styles/base.css.ts'

test('settings inherits native opacity motion and both cards use the panel radius', () => {
  assert.doesNotMatch(BASE_CSS, /dsh-web-mobile-sheet-in|translateY|scale\(/)
  assert.match(BASE_CSS, /from \{ opacity: 0; \}\s+to \{ opacity: 1; \}/)
  assert.match(BASE_CSS, /animation: dsh-web-mobile-modal-enter var\(--ds-transition-duration, \.2s\)/)
  assert.equal((BASE_CSS.match(/border-radius: var\(--dsw-radius-panel\) !important/g) ?? []).length, 2)
  assert.match(BASE_CSS, /prefers-reduced-motion: reduce[^}]*animation: none !important/s)
})
