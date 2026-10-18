import { test } from 'node:test'
import assert from 'node:assert/strict'
import { panelSelectorOf } from '../src/client/core/layout-compat.ts'

test('rc.1 panel command selects the Conversation and preserves its receiver', () => {
  const layout = {
    seen: 'unset' as unknown,
    selectPanel(panelId: null): void { this.seen = panelId },
  }
  panelSelectorOf(layout)()
  assert.equal(layout.seen, null)
})
