import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { runInNewContext } from 'node:vm'

const source = readFileSync(new URL('../src/client/effects/phone-viewport.ts', import.meta.url), 'utf8')
const executable = stripTypeScriptTypes(source.replace(/^import .*\n/gm, '').replaceAll('export function', 'function').replaceAll('export const', 'const'))

test('mobile chrome leaves Host theme-color alone and disposes only its own viewport resources', () => {
  let dispose = () => {}
  const viewport = { content: 'width=device-width, initial-scale=1' }
  const attributes = new Map<string, string>()
  const properties = new Map<string, string>()
  const listeners = new Map<string, () => void>()
  const observers: { connected: boolean }[] = []
  runInNewContext(executable + '; installPhoneChrome({})', {
    navigator: { userAgent: 'iPhone', maxTouchPoints: 1 },
    document: {
      head: {},
      documentElement: { style: { setProperty: (key: string, value: string) => properties.set(key, value), removeProperty: (key: string) => properties.delete(key) }, setAttribute: (key: string, value: string) => attributes.set(key, value), removeAttribute: (key: string) => attributes.delete(key) },
      querySelector: (selector: string) => { assert.equal(selector, 'meta[name="viewport"]'); return viewport },
      createElement: () => { throw new Error('theme-color belongs to the Host') },
    },
    window: { innerWidth: 390, innerHeight: 844, addEventListener: (key: string, listener: () => void) => listeners.set(key, listener), removeEventListener: (key: string) => listeners.delete(key) },
    MutationObserver: class { connected = false; constructor() { observers.push(this) } observe() { this.connected = true } disconnect() { this.connected = false } },
    installMobileEffect: (_ctx: object, _label: string, install: () => () => void) => { dispose = install() },
  })
  assert.match(viewport.content, /viewport-fit=cover/)
  assert.equal(properties.get('--dsh-web-mobile-vh'), '844px')
  assert.equal(attributes.has('data-mobile-nav-ios'), true)
  dispose()
  assert.equal(viewport.content, 'width=device-width, initial-scale=1')
  assert.equal(listeners.size, 0)
  assert.equal(properties.size, 0)
  assert.equal(attributes.size, 0)
  assert.ok(observers.every(observer => !observer.connected))
  assert.doesNotMatch(source, /data-ds-dark-theme|getComputedStyle/)
})
