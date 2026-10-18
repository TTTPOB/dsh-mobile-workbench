import assert from 'node:assert/strict'
import { test } from 'node:test'
import type { Context } from '@deepseek-ai/cordis'
import { managementEntries } from '../src/client/workbench/management-menu.ts'

test('management rows follow live public ledger order and localized/function labels, not account state', () => {
  let rows = [
    { options: { id: 'schedules', order: 10, label: () => 'Tasks' } },
    { options: { id: 'custom', order: 20, label: 'Custom' } },
    { options: { id: 'plugins', order: 0, label: 'Plugins' } },
  ]
  const ctx = { slots: { entriesOfSlot: () => rows }, locale: { resolveText: (label: string) => 'localized:' + label } } as Context
  assert.deepEqual(managementEntries(ctx).map(({ id, label }) => [id, label]), [
    ['plugins', 'localized:Plugins'], ['schedules', 'Tasks'], ['custom', 'localized:Custom'],
  ])
  rows = rows.filter(row => row.options.id !== 'plugins')
  assert.deepEqual(managementEntries(ctx).map(row => row.id), ['schedules', 'custom'])
})
