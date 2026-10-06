// Released retained-main-view state with the older development snapshot fallback.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { currentSessionIdOf } from '../src/client/core/sessions-compat.ts'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const TOUCH = readFileSync(join(ROOT, 'src/client/effects/sessions-touch.ts'), 'utf8')

test('currentSessionIdOf supports the older development snapshot fallback', () => {
  assert.equal(currentSessionIdOf({ current: 's1', byId: {} }), 's1')
})

test('currentSessionIdOf reads the released retainedBy.mainView selection', () => {
  const a2 = {
    byId: {
      a: { id: 'a', retainedBy: { mainView: 0 } },
      b: { id: 'b', retainedBy: { mainView: 2 } },
    },
  }
  assert.equal(currentSessionIdOf(a2), 'b')
  assert.equal(currentSessionIdOf({ ...a2, current: 'stale-dev-field' }), 'b')
})

test('currentSessionIdOf returns undefined on empty, foreign and null shapes', () => {
  assert.equal(currentSessionIdOf({}), undefined)
  assert.equal(currentSessionIdOf({ byId: { a: { id: 'a', retainedBy: { mainView: 0 } } } }), undefined)
  assert.equal(currentSessionIdOf(null), undefined)
  assert.equal(currentSessionIdOf('nope'), undefined)
})

test('touch recovery delegates to native rows, never the legacy sessions.open', () => {
  assert.match(TOUCH, /currentSessionIdOf\(ctx\.sessions\.list\.getSnapshot\(\)\)/)
  assert.match(TOUCH, /finished\.row\.click\(\)/)
  assert.doesNotMatch(TOUCH, /ctx\.sessions\.open/)
})
