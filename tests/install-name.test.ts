import { test } from 'node:test'
import assert from 'node:assert/strict'
import type { IncomingMessage, ServerResponse } from 'node:http'
import {
  Config, INSTALL_NAME_LIMIT as HOST_INSTALL_NAME_LIMIT, MANIFEST, apply, installNameFromQuery, manifestLabels,
  type HostContext,
} from '../src/index.ts'
import {
  INSTALL_NAME_LIMIT as CLIENT_INSTALL_NAME_LIMIT, INSTALL_NAME_STORAGE_KEY, createInstallNameController,
  manifestHrefWithName, normalizeInstallName, type InstallNameAttribute, type InstallNameDocument,
  type InstallNameStorage,
} from '../src/client/workbench/install-name.ts'

type Route = { path: string; handler(req: IncomingMessage, res: ServerResponse): void }

function fixture(config = Config({})): { routes: Route[]; taps: ((html: string) => string)[] } {
  const routes: Route[] = []
  const taps: ((html: string) => string)[] = []
  const ctx: HostContext = {
    effect(install) { install() },
    inject(_services, install) {
      install({ ...ctx, webServer: {
        register(route) { routes.push(route); return () => { routes.splice(routes.indexOf(route), 1) } },
        tapIndex(transform) { taps.push(transform); return () => { taps.splice(taps.indexOf(transform), 1) } },
      } })
    },
  }
  apply(ctx, config)
  return { routes, taps }
}

function request(route: Route, url: string, method = 'GET'): { status: number; headers: Record<string, string>; body: Buffer | undefined } {
  let status = 0
  let headers: Record<string, string> = {}
  let body: Buffer | undefined
  route.handler({ method, url } as IncomingMessage, {
    writeHead(code: number, values: Record<string, string>) { status = code; headers = values },
    end(value?: Buffer) { body = value },
  } as ServerResponse)
  return { status, headers, body }
}

test('manifest query names are trimmed, bounded and optional', () => {
  assert.equal(HOST_INSTALL_NAME_LIMIT, CLIENT_INSTALL_NAME_LIMIT)
  assert.equal(installNameFromQuery(undefined), undefined)
  assert.equal(installNameFromQuery('/manifest.webmanifest'), undefined)
  assert.equal(installNameFromQuery('/manifest.webmanifest?name='), undefined)
  assert.equal(installNameFromQuery('/manifest.webmanifest?name=+%20+'), undefined)
  assert.equal(installNameFromQuery('/manifest.webmanifest?name=%20My+App%20'), 'My App')
  const long = '名'.repeat(HOST_INSTALL_NAME_LIMIT + 5)
  assert.equal(installNameFromQuery('/manifest.webmanifest?name=' + encodeURIComponent(long)), '名'.repeat(HOST_INSTALL_NAME_LIMIT))
  const emoji = '😀'.repeat(HOST_INSTALL_NAME_LIMIT + 2)
  assert.equal(Array.from(installNameFromQuery('/manifest.webmanifest?name=' + encodeURIComponent(emoji)) ?? '').length, HOST_INSTALL_NAME_LIMIT)
})

test('manifest labels replace both configured names only when the page supplies one', () => {
  assert.deepEqual(manifestLabels('Full', 'Short'), { name: 'Full', short_name: 'Short' })
  assert.deepEqual(manifestLabels('Full', 'Short', 'Page'), { name: 'Page', short_name: 'Page' })
})

test('manifest route serves the page-supplied name without changing install identity', () => {
  const { routes } = fixture(Config({ name: 'DSH 工作站', shortName: '工作站' }))
  const route = routes.find(entry => entry.path === '/manifest.webmanifest')!
  const override = request(route, '/manifest.webmanifest?name=' + encodeURIComponent('DSH 手机'))
  assert.equal(override.status, 200)
  assert.equal(override.headers['Content-Type'], 'application/manifest+json')
  const manifest = JSON.parse(override.body!.toString())
  assert.equal(manifest.name, 'DSH 手机')
  assert.equal(manifest.short_name, 'DSH 手机')
  assert.deepEqual({ ...manifest, name: MANIFEST.name, short_name: MANIFEST.short_name }, MANIFEST)
  const fallback = JSON.parse(request(route, '/manifest.webmanifest').body!.toString())
  assert.equal(fallback.name, 'DSH 工作站')
  assert.equal(fallback.short_name, '工作站')
  const blank = JSON.parse(request(route, '/manifest.webmanifest?name=%20').body!.toString())
  assert.equal(blank.name, 'DSH 工作站')
  assert.equal(request(route, '/manifest.webmanifest?name=X', 'HEAD').body, undefined)
  assert.equal(request(route, '/manifest.webmanifest', 'POST').status, 405)
})

test('index carries the configured full name for the page-side editor', () => {
  const { taps } = fixture(Config({ name: 'Work "A" & <B>', shortName: 'Work' }))
  assert.equal(taps.length, 1)
  const html = taps[0]!('<head></head>')
  assert.ok(html.includes('<meta name="dsh-mobile-install-name" content="Work &quot;A&quot; &amp; &lt;B&gt;" />'))
  assert.equal(taps[0]!(html), html)
})

test('client manifest href updates only the name query', () => {
  assert.equal(manifestHrefWithName('/manifest.webmanifest', 'DSH 工作站'), '/manifest.webmanifest?name=DSH+%E5%B7%A5%E4%BD%9C%E7%AB%99')
  assert.equal(manifestHrefWithName('/manifest.webmanifest?name=Old&v=2', 'New'), '/manifest.webmanifest?v=2&name=New')
  assert.equal(manifestHrefWithName('/manifest.webmanifest?name=Old', ''), '/manifest.webmanifest')
  assert.equal(manifestHrefWithName('https://example.test/manifest.webmanifest', 'A B'), 'https://example.test/manifest.webmanifest?name=A+B')
  assert.equal(normalizeInstallName('  A  '), 'A')
  assert.equal(Array.from(normalizeInstallName('😀'.repeat(CLIENT_INSTALL_NAME_LIMIT + 1))).length, CLIENT_INSTALL_NAME_LIMIT)
})

function fakeDoc(initialHref = '/manifest.webmanifest', configured = 'DSH Mobile Workbench', title = 'DSH Workbench'): {
  doc: InstallNameDocument
  manifest: InstallNameAttribute
  appleTitle: InstallNameAttribute
} {
  const attribute = (values: Record<string, string>): InstallNameAttribute => ({
    getAttribute: name => values[name] ?? null,
    setAttribute: (name, value) => { values[name] = value },
  })
  const manifest = attribute({ href: initialHref })
  const appleTitle = attribute({ content: title })
  const configuredMeta = attribute({ content: configured })
  return {
    doc: {
      querySelector: selector => {
        if (selector.startsWith('link')) return manifest
        if (selector.includes('apple-mobile-web-app-title')) return appleTitle
        if (selector.includes('dsh-mobile-install-name')) return configuredMeta
        return null
      },
    },
    manifest,
    appleTitle,
  }
}

function fakeStorage(): InstallNameStorage & { items: Map<string, string> } {
  const items = new Map<string, string>()
  return {
    items,
    getItem: key => items.get(key) ?? null,
    setItem: (key, value) => { items.set(key, value) },
    removeItem: key => { items.delete(key) },
  }
}

test('client install name applies the saved value and restores the configured default', () => {
  const { doc, manifest, appleTitle } = fakeDoc()
  const storage = fakeStorage()
  storage.setItem(INSTALL_NAME_STORAGE_KEY, '  工作站  ')
  const controller = createInstallNameController(doc, storage)
  controller.install()
  assert.equal(manifest.getAttribute('href'), '/manifest.webmanifest?name=%E5%B7%A5%E4%BD%9C%E7%AB%99')
  assert.equal(appleTitle.getAttribute('content'), '工作站')
  assert.deepEqual(controller.getSnapshot(), { open: false, value: '工作站' })
  controller.open()
  assert.equal(controller.getSnapshot().open, true)
  controller.save('新 名字')
  assert.equal(storage.getItem(INSTALL_NAME_STORAGE_KEY), '新 名字')
  assert.equal(manifest.getAttribute('href'), '/manifest.webmanifest?name=%E6%96%B0+%E5%90%8D%E5%AD%97')
  assert.equal(appleTitle.getAttribute('content'), '新 名字')
  controller.restore()
  assert.equal(storage.getItem(INSTALL_NAME_STORAGE_KEY), null)
  assert.equal(manifest.getAttribute('href'), '/manifest.webmanifest')
  assert.equal(appleTitle.getAttribute('content'), 'DSH Workbench')
  assert.deepEqual(controller.getSnapshot(), { open: true, value: 'DSH Mobile Workbench' })
  controller.close()
  assert.equal(controller.getSnapshot().open, false)
  controller.dispose()
})

test('uninstalling the editor restores the served metadata', () => {
  const { doc, manifest, appleTitle } = fakeDoc('/manifest.webmanifest?name=Old', 'Configured', 'Short')
  const controller = createInstallNameController(doc, undefined)
  controller.install()
  controller.save('Saved')
  assert.equal(appleTitle.getAttribute('content'), 'Saved')
  controller.dispose()
  assert.equal(manifest.getAttribute('href'), '/manifest.webmanifest?name=Old')
  assert.equal(appleTitle.getAttribute('content'), 'Short')
})
