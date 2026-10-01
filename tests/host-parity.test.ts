import { test } from 'node:test'
import assert from 'node:assert/strict'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { apply, MANIFEST, name, type HostContext } from '../src/index.ts'

function routes() {
  const registered: { path: string; handler(req: IncomingMessage, res: ServerResponse): void }[] = []
  const disposers: (() => void)[] = []
  const ctx: HostContext = {
    effect(install) { disposers.push(install()) },
    inject(_services, install) {
      install({ ...ctx, webServer: { register(route) {
        registered.push(route)
        return () => { registered.splice(registered.indexOf(route), 1) }
      } } })
    },
  }
  apply(ctx)
  return { registered, dispose: () => disposers.forEach(fn => fn()) }
}

test('workbench serves standalone metadata and PNG icons, not session mutations', () => {
  const fixture = routes()
  assert.equal(name, 'dsh-web-mobile')
  assert.deepEqual(fixture.registered.map(route => route.path), [
    '/manifest.webmanifest', '/mobile-workbench/icon-192.png', '/mobile-workbench/icon-512.png',
  ])
  assert.equal(MANIFEST.display, 'standalone')
  assert.deepEqual(MANIFEST.icons.map(icon => icon.sizes), ['192x192', '512x512'])
  let status = 0
  let data: Buffer | undefined
  fixture.registered[0]!.handler({ method: 'GET' } as IncomingMessage, {
    writeHead(code: number) { status = code },
    end(body: Buffer) { data = body },
  } as ServerResponse)
  assert.equal(status, 200)
  assert.deepEqual(JSON.parse(data!.toString()), MANIFEST)
  fixture.dispose()
  assert.equal(fixture.registered.length, 0)
})

test('metadata routes support HEAD and reject mutations', () => {
  const fixture = routes()
  for (const method of ['HEAD', 'POST']) {
    let status = 0
    let data: Buffer | undefined
    fixture.registered[0]!.handler({ method } as IncomingMessage, {
      writeHead(code: number) { status = code },
      end(body?: Buffer) { data = body },
    } as ServerResponse)
    assert.equal(status, method === 'HEAD' ? 200 : 405)
    assert.equal(data, undefined)
  }
  fixture.dispose()
})
