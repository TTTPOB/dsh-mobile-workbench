import assert from 'node:assert/strict'
import { test } from 'node:test'
import { contextPercent, pressureLabel, statNumber } from '../src/client/workbench/stats.ts'

test('missing projections never masquerade as zero occupancy', () => {
  for (const pressure of [undefined, {}, { pressureTokens: 0 }, { contextWindow: 100 }]) {
    assert.equal(contextPercent(pressure), undefined)
    assert.equal(pressureLabel(pressure), '—')
  }
  assert.equal(statNumber(undefined), '—')
  assert.equal(statNumber(0), '0')
})

test('real zero, projected prompt, provider fallback and full occupancy map directly', () => {
  assert.equal(pressureLabel({ pressureTokens: 0, contextWindow: 100 }), '0%')
  assert.equal(contextPercent({ projectedTokens: 50, pressureTokens: 30, contextWindow: 100 }), 50)
  assert.equal(contextPercent({ pressureTokens: 30, contextWindow: 100 }), 30)
  assert.equal(pressureLabel({ projectedTokens: 100, contextWindow: 100 }), '100%')
  assert.equal(contextPercent({ projectedTokens: 110, contextWindow: 100 }), 110)
})

test('switching to a session without measurements has no retained old value', () => {
  assert.equal(pressureLabel({ pressureTokens: 60, contextWindow: 100 }), '60%')
  assert.equal(pressureLabel(undefined), '—')
})
