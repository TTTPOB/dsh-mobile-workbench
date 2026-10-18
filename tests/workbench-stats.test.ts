import assert from 'node:assert/strict'
import { test } from 'node:test'
import { averageTtftMs, cacheHitLabel, contextPercent, decodeTokensPerSecond, pressureLabel, statDuration, statNumber, statRate, totalTokens, type StatsValues } from '../src/client/workbench/stats.ts'
import { statsEn, statsZh, type StatsTranslate } from '../src/client/workbench/stats-locales.ts'

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

const activity = (values: Partial<NonNullable<StatsValues['sessionStats']>> = {}): NonNullable<StatsValues['sessionStats']> => ({
  turns: 2, steps: 2, llmMs: 100_000, toolMs: 80_000, ttftMs: 6000, ttftSteps: 3, decodeMs: 3000, decodeTokens: 600, ...values,
})
const translate = (dict: typeof statsEn): StatsTranslate => (key, params) => dict[key].replace(/\{(\w+)\}/g, (_, name: string) => String(params?.[name] ?? ''))

test('whole-session throughput uses only matched decode tokens and decode time, never total wall time or usage', () => {
  assert.equal(decodeTokensPerSecond(activity()), 200)
  assert.equal(decodeTokensPerSecond(activity({ llmMs: 9_000_000, toolMs: 8_000_000, ttftMs: 7_000_000 })), 200)
  // Steps of 100 tokens / 1s and 900 tokens / 3s combine as 1000 / 4, not (100 + 300) / 2.
  assert.equal(decodeTokensPerSecond(activity({ decodeTokens: 100 + 900, decodeMs: 1000 + 3000 })), 250)
})

test('missing or untimed throughput and first-token samples stay unknown while real zero survives', () => {
  assert.equal(decodeTokensPerSecond(undefined), undefined)
  assert.equal(decodeTokensPerSecond(activity({ decodeMs: 0 })), undefined)
  assert.equal(decodeTokensPerSecond(activity({ decodeTokens: 0 })), 0)
  assert.equal(averageTtftMs(undefined), undefined)
  assert.equal(averageTtftMs(activity({ ttftSteps: 0 })), undefined)
  assert.equal(averageTtftMs(activity()), 2000)
  assert.equal(averageTtftMs(activity({ ttftMs: 0 })), 0)
  assert.equal(statRate(decodeTokensPerSecond(activity())), '200')
  assert.equal(statRate(decodeTokensPerSecond(undefined)), '—', 'a new session cannot inherit the previous reading')
})

test('throughput and time formatting match native precision and use the current dictionary', () => {
  assert.equal(statRate(undefined), '—')
  assert.equal(statRate(0), '0')
  assert.equal(statRate(9.34), '9.3')
  assert.equal(statRate(10.6), '11')
  for (const dict of [statsEn, statsZh]) assert.equal(statDuration(undefined, translate(dict)), '—')
  assert.equal(statDuration(0, translate(statsEn)), '0s')
  assert.equal(statDuration(1234, translate(statsEn)), '1.2s')
  assert.equal(statDuration(162_000, translate(statsEn)), '2m42s')
  assert.equal(statDuration(162_000, translate(statsZh)), '2分42秒')
})

test('total token count sums disjoint billing buckets and cache hit excludes output', () => {
  const usage = { uncachedInputTokens: 100, cacheReadTokens: 600, cacheWriteTokens: 100, outputTokens: 200 }
  assert.equal(totalTokens(usage), 1000)
  assert.equal(cacheHitLabel(usage), '75%')
  assert.equal(cacheHitLabel({ ...usage, outputTokens: 10_000_000 }), '75%')
  assert.equal(totalTokens(undefined), undefined)
  assert.equal(cacheHitLabel(undefined), '—')
  const zero = { uncachedInputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0, outputTokens: 0 }
  assert.equal(totalTokens(zero), 0)
  assert.equal(cacheHitLabel(zero), '—')
  assert.equal(cacheHitLabel({ ...zero, outputTokens: 100 }), '—')
  assert.equal(cacheHitLabel({ ...zero, uncachedInputTokens: 100 }), '0%')
  assert.equal(cacheHitLabel({ ...zero, cacheReadTokens: 100 }), '100%')
  assert.equal(cacheHitLabel({ ...zero, cacheReadTokens: 9999, uncachedInputTokens: 1 }), '99.99%')
  assert.equal(cacheHitLabel({ ...zero, cacheReadTokens: 999_999_999, uncachedInputTokens: 1 }), '99.9999999%')
})

test('context references and heuristic composition are labelled without claiming they sum to occupancy', () => {
  assert.match(statsEn.usedTokens, /reference/)
  assert.match(statsZh.usedTokens, /参考/)
  for (const key of ['system', 'tools', 'messages'] as const) {
    assert.match(statsEn[key], /estimate/)
    assert.match(statsZh[key], /估算/)
  }
  assert.equal(contextPercent({ projectedTokens: 1000, contextWindow: 2000 }), 50)
})
