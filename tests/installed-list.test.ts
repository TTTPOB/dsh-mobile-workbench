import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { COMPAT_CSS } from '../src/client/styles/compat.css.ts'

const source = readFileSync(new URL('../src/client/effects/installed-list.ts', import.meta.url), 'utf8')

test('installed-list styling excludes nested action rows in CSS and inline overrides', () => {
  const outerRow = /\[class\*="irow"\]:not\(\[class\*="irowActions"\]\):not\(\[class\*="irowTrailing"\]\)/
  assert.match(COMPAT_CSS, outerRow)
  assert.match(source, outerRow)
})
