import { test } from 'node:test'
import assert from 'node:assert/strict'
import { BASE_CSS } from '../src/client/styles/base.css.ts'

test('native settings sheet enters fully opaque and honors reduced motion', () => {
  const keyframes = BASE_CSS.match(/@keyframes dsh-web-mobile-sheet-in \{([\s\S]*?)\n  \}/)?.[1]
  assert.ok(keyframes)
  assert.doesNotMatch(keyframes, /opacity/)
  assert.match(keyframes, /translateY\(14px\) scale\(\.98\)/)
  assert.match(BASE_CSS, /animation: dsh-web-mobile-sheet-in \.22s/)
  assert.match(BASE_CSS, /prefers-reduced-motion: reduce[^}]*animation: none !important/s)
})
