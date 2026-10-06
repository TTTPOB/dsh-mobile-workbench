import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile, stat } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (path: string) => readFile(join(root, path), 'utf8')

test('current guides link to existing local files', async () => {
  for (const file of ['README.md', 'WORKBENCH.md', 'AGENTS.md']) {
    const text = await read(file)
    for (const match of text.matchAll(/\]\(([^)]+)\)/g)) {
      const target = match[1]!.replace(/^<|>$/g, '').split('#')[0]!
      if (!target || /^https?:\/\//.test(target)) continue
      await stat(join(root, target))
    }
  }
})

test('installation and usage guides name the package version', async () => {
  const manifest = JSON.parse(await read('package.json')) as { name: string; version: string }
  assert.equal(manifest.name, 'dsh-web-mobile')
  for (const file of ['README.md', 'WORKBENCH.md']) {
    assert.ok((await read(file)).includes(manifest.version), file + ' has a stale version')
  }
})
