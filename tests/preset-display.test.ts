import assert from 'node:assert/strict'
import { test } from 'node:test'
import type { Context } from '@deepseek-ai/cordis'
import { presetDisplayName, createPresetDisplayResolver } from '../src/client/workbench/preset-display.ts'

const builtIn = [{ id: 'standard', isDefault: true }]
test('public display utility localizes shipped presets but preserves custom and overridden names', () => {
  assert.equal(presetDisplayName('standard', builtIn, () => 'Standard mode', 'Unavailable'), 'Standard mode')
  assert.equal(presetDisplayName('standard', builtIn, () => '标准模式', '不可用'), '标准模式')
  assert.equal(presetDisplayName('review-internal-id', [{ id: 'review-internal-id', isDefault: false, name: 'My Review / 我的审查' }], () => 'never', 'Unavailable'), 'My Review / 我的审查')
  assert.equal(presetDisplayName('standard', [{ id: 'standard', isDefault: true, name: 'My Standard' }], () => 'never', 'Unavailable'), 'My Standard')
})
test('deleted, broken and nameless declarations never masquerade as display names', () => {
  assert.equal(presetDisplayName('standard', [], () => 'Standard mode', 'Unavailable'), 'Unavailable')
  assert.equal(presetDisplayName('internal', [{ id: 'internal', isDefault: false }], () => 'never', 'Unavailable'), 'Unavailable')
  assert.equal(presetDisplayName('standard', [{ ...builtIn[0]!, broken: 'missing provider' }], () => 'Standard mode', 'Unavailable'), 'Unavailable')
})
test('each opening reads the public roster again; locale and deletion never reuse old display text', async () => {
  let rows = builtIn
  let language = 'en'
  let calls = 0
  let fail = false
  const ctx = {
    locale: { bind: (ns: string) => () => ns === 'mobileWorkbench' ? (language === 'en' ? 'Unavailable' : '不可用') : (language === 'en' ? 'Standard mode' : '标准模式') },
    get: (key: string) => { assert.equal(key, 'remote.agentPresets'); return { list: async () => { calls++; if (fail) throw new Error('offline'); return { ok: true, value: { presets: rows } } } } },
  } as Context
  const resolve = createPresetDisplayResolver(ctx)
  assert.equal(await resolve('standard'), 'Standard mode')
  language = 'zh'
  assert.equal(await resolve('standard'), '标准模式')
  rows = []
  assert.equal(await resolve('standard'), '不可用')
  fail = true
  assert.equal(await resolve('standard'), '不可用')
  assert.equal(calls, 4)
  assert.equal(await resolve(undefined), '不可用')
  assert.equal(calls, 4)
})
