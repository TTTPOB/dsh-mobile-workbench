import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { test } from 'node:test'

const host = process.env.DSH_HOST_SOURCE
const root = resolve(import.meta.dirname, '..')

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
