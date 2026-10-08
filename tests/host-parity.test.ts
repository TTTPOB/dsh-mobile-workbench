import { test } from 'node:test'
import assert from 'node:assert/strict'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { apply, Config, MANIFEST, name, type HostContext } from '../src/index.ts'

function routes(config = Config({})) {
  const registered: { path: string; handler(req: IncomingMessage, res: ServerResponse): void }[] = []
  const disposers: (() => void)[] = []
  const taps: ((html: string) => string)[] = []
  const ctx: HostContext = {
    effect(install) { disposers.push(install()) },
    inject(_services, install) {
      install({ ...ctx, webServer: { register(route) {
        registered.push(route)
        return () => { registered.splice(registered.indexOf(route), 1) }
      }, tapIndex(transform) {
        taps.push(transform)
        return () => { taps.splice(taps.indexOf(transform), 1) }
      } } })
    },
  }
  apply(ctx, config)
  return { registered, taps, dispose: () => disposers.forEach(fn => fn()) }
}

test('workbench serves standalone metadata and PNG icons, not session mutations', () => {
  const fixture = routes()
  assert.equal(name, 'dsh-web-mobile')
  assert.deepEqual(fixture.registered.map(route => route.path), [
    '/manifest.webmanifest', '/mobile-workbench/icon.svg', '/mobile-workbench/icon-180.png',
    '/mobile-workbench/icon-192.png', '/mobile-workbench/icon-512.png',
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

test('index hook sends manifest credentials without changing URLs and disposes', () => {
  const fixture = routes()
  const transform = fixture.taps[0]!
  assert.equal(fixture.taps.length, 1)
  for (const attribute of ['', ' crossorigin="anonymous"', ' crossorigin']) {
    const icon = '<link rel="icon" href="/favicon.svg">'
    const output = transform('<head><link rel="manifest" href="/manifest.webmanifest"' + attribute + ' />' + icon + '</head>')
    assert.ok(output.includes('href="/manifest.webmanifest"'))
    assert.ok(output.includes('crossorigin="use-credentials"'))
    assert.equal((output.match(/crossorigin/g) ?? []).length, 1)
    assert.ok(output.includes(icon))
  }
  fixture.dispose()
  assert.equal(fixture.taps.length, 0)
})

test('PNG assets have the declared dimensions and image content type', () => {
  const fixture = routes()
  for (const size of [180, 192, 512]) {
    let data: Buffer | undefined
    let type: string | undefined
    fixture.registered.find(route => route.path.endsWith('icon-' + size + '.png'))!.handler({ method: 'GET' } as IncomingMessage, {
      writeHead(_code: number, headers: Record<string, string>) { type = headers['Content-Type'] },
      end(body: Buffer) { data = body },
    } as ServerResponse)
    assert.equal(type, 'image/png')
    assert.equal(data!.subarray(0, 8).toString('hex'), '89504e470d0a1a0a')
    assert.equal(data!.readUInt32BE(16), size)
    assert.equal(data!.readUInt32BE(20), size)
  }
  fixture.dispose()
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

test('instance config changes served labels without changing install identity or other instances', () => {
  assert.deepEqual(Config['~standard'].validate({}), {
    value: { name: MANIFEST.name, shortName: MANIFEST.short_name },
  })
  assert.throws(() => Config({ name: '  ' }))
  assert.throws(() => Config({ shortName: 42 }))
  const workstation = routes(Config({ name: 'DSH 工作站', shortName: '工作站' }))
  const server = routes(Config({ name: 'DSH 服务器', shortName: '服务器' }))
  for (const [fixture, expected] of [[workstation, '工作站'], [server, '服务器']] as const) {
    let data: Buffer | undefined
    fixture.registered[0]!.handler({ method: 'GET' } as IncomingMessage, {
      writeHead() {}, end(body: Buffer) { data = body },
    } as ServerResponse)
    const manifest = JSON.parse(data!.toString())
    assert.equal(manifest.name, 'DSH ' + expected)
    assert.equal(manifest.short_name, expected)
    assert.equal(manifest.id, '/')
    assert.equal(manifest.start_url, '/')
    assert.equal(manifest.scope, '/')
    assert.equal(MANIFEST.name, 'DSH Mobile Workbench')
    fixture.dispose()
  }
})

test('index hook supplies Apple icon and escaped instance title without duplicates', () => {
  const fixture = routes(Config({ shortName: 'Work "A" & <B>' }))
  const transform = fixture.taps[0]!
  const html = '<head><link rel="apple-touch-icon" href="/old.png">'
    + '<meta content="Old" name="apple-mobile-web-app-title"><title>DSH</title></head>'
  const result = transform(html)
  assert.ok(result.includes('sizes="180x180" href="/mobile-workbench/icon-180.png"'))
  assert.ok(result.includes('content="Work &quot;A&quot; &amp; &lt;B&gt;"'))
  assert.ok(result.includes('<title>DSH</title>'))
  assert.equal(transform(result), result)
  assert.ok(!result.includes('/old.png'))
  fixture.dispose()
})

test('SVG source is served as an image and PNG icons declare any and maskable use', () => {
  const fixture = routes()
  let data: Buffer | undefined
  let type: string | undefined
  fixture.registered.find(route => route.path.endsWith('.svg'))!.handler({ method: 'GET' } as IncomingMessage, {
    writeHead(_code: number, headers: Record<string, string>) { type = headers['Content-Type'] },
    end(body: Buffer) { data = body },
  } as ServerResponse)
  assert.equal(type, 'image/svg+xml')
  assert.ok(data!.toString().includes('viewBox="0 0 512 512"'))
  assert.ok(MANIFEST.icons.every(icon => icon.purpose === 'any maskable'))
  fixture.dispose()
})
