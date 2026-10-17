import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { test } from 'node:test'

const host = process.env.DSH_HOST_SOURCE
const root = resolve(import.meta.dirname, '..')
const read = (path: string) => readFile(join(host!, path), 'utf8')

async function sources(dir: string, suffix: RegExp): Promise<string[]> {
  const result: string[] = []
  for (const item of await readdir(dir, { withFileTypes: true })) {
    if (/agy|claude/i.test(item.name)) continue
    const path = join(dir, item.name)
    if (item.isDirectory()) result.push(...await sources(path, suffix))
    else if (suffix.test(item.name)) result.push(await readFile(path, 'utf8'))
  }
  return result
}

test('rc.1 owns split pills, context dock and accessible model portal identity', { skip: !host }, async () => {
  const pills = await read('packages/client/ui-chat/src/client/chat/StatsPills.tsx')
  assert.match(pills, /type StatId = 'activity' \| 'usage'/)
  assert.match(pills, /data-composer-stat={stat}/)
  assert.doesNotMatch(pills, /data-composer-stats/)
  const input = await read('packages/client/ui-conversation/src/client/skeleton/InputBar.tsx')
  assert.match(input, /data-composer-dock/)
  assert.match(input, /<ContextMeter/)
  const model = await read('packages/client/ui-model-selection/src/client/ModelSelect.tsx')
  assert.match(model, /aria-controls={open ? /)
  assert.match(model, /id={.*-menu/)
  assert.match(model, /createPortal/)
})

test('remaining host CSS-module fragments exist in rc.1; third-party market adapters stay separate', { skip: !host }, async () => {
  const local = (await sources(join(root, 'src/client'), /\.tsx?$/)).join('\n')
  const css = [...await sources(join(host!, 'packages/client'), /\.css$/),
    ...await sources(join(host!, 'packages/session-query/session-log-export'), /\.css$/)].join('\n')
  const external = new Set(['irow', 'irowActions', 'irowTrailing', 'owner', 'spec', 'nm', 'opPanel', 'cardShots', 'cardShot', '…'])
  const fragments = new Set([...local.matchAll(/class\*=["']([^"']+)/g)].map(match => match[1]!.replace(/^_/, '')))
  for (const fragment of fragments) {
    if (external.has(fragment)) continue
    assert.match(css, new RegExp('\\.' + fragment + '(?![\\w-])'), fragment + ' is absent from rc.1 CSS modules')
  }
  assert.doesNotMatch(local, /dsh-client-runtime|data-composer-stats|_7KE1Ra_(?:menu|trigger)/)
})

test('rc.1 retains the consumed slots and observable service APIs', { skip: !host }, async () => {
  const contracts = (await sources(join(host!, 'packages/client'), /(?:slots|index|service|sessions|entries)\.ts$/)).join('\n')
  for (const slot of ['conversation.input.left', 'conversation.input.model', 'conversation.input.permission',
    'conversation.session.header.actions', 'conversation.session.header.lineage', 'conversation.session.header.utilities',
    'conversation.view', 'shell.overlay', 'sidebar.panellist']) assert.ok(contracts.includes("'" + slot + "'"), slot)
  const session = await read('packages/api/session-controller/src/client/contract/sessions.ts')
  assert.match(session, /refreshProjections\(sessionId: SessionId\): Promise<void>/)
  assert.match(session, /retainedBy/)
  const connection = await read('packages/client/connection/src/client/index.ts')
  assert.match(connection, /readonly state: ConnectionStateSource/)
  const entries = await read('packages/client/modules/src/client/entries.ts')
  assert.match(entries, /readonly state: ObservableSnapshot<ClientEntryState>/)
  const layout = await read('packages/client/ui-layout/src/client/service.ts')
  assert.match(layout, /selectPanel\(panelId: MainPanelId \| null\): void/)
  assert.match(layout, /toggleSidebar\(\): void/)
})
