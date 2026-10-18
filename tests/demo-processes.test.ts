import test from 'node:test'
import assert from 'node:assert/strict'
import { EventEmitter } from 'node:events'
import { PassThrough } from 'node:stream'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import { startDemoProcesses } from '../scripts/demo-processes.mjs'

function fixture(t, tunnel = true) {
  const root = fileURLToPath(new URL('../', import.meta.url))
  const scratch = join(root, '.validation')
  mkdirSync(scratch, { recursive: true })
  const home = mkdtempSync(join(scratch, 'demo-processes-'))
  t.after(() => rmSync(home, { recursive: true, force: true }))
  const calls = []
  const spawn = (command, args) => {
    const child = new EventEmitter()
    child.stdout = new PassThrough()
    child.stderr = new PassThrough()
    child.signals = []
    child.kill = signal => { child.signals.push(signal); queueMicrotask(() => child.emit('close', null, signal)); return true }
    calls.push({ command, args, child })
    return child
  }
  writeFileSync(join(home, 'public-url.txt'), 'stale', { mode: 0o644 })
  const runtime = startDemoProcesses({ root, home, workspace: root, env: {}, port: '54080',
    trustedHosts: ['phone.example', 'other.example'], tunnel }, spawn)
  return { calls, home, runtime }
}

test('quick tunnel URL precedes Host trust and preserves authentication path/query with private files', async t => {
  const { calls, home, runtime } = fixture(t)
  assert.equal(calls.length, 1)
  assert.equal(calls[0].command, '/usr/local/bin/cloudflared')
  assert.ok(calls[0].args.includes('http2'))
  calls[0].child.stderr.write('https://phone-demo.trycloud')
  assert.equal(calls.length, 1)
  calls[0].child.stderr.write('flare.com\n')
  assert.equal(calls.length, 2)
  assert.deepEqual(calls[1].args.slice(-6), ['--trusted-host', 'phone.example', '--trusted-host', 'other.example',
    '--trusted-host', 'phone-demo.trycloudflare.com'])
  calls[1].child.stdout.write('dsh web: http://127.0.0.1:54080/')
  calls[1].child.stdout.write('?token=fixture-token\n')
  assert.equal(readFileSync(join(home, 'public-url.txt'), 'utf8'), 'https://phone-demo.trycloudflare.com/?token=fixture-token\n')
  assert.equal(statSync(join(home, 'public-url.txt')).mode & 0o777, 0o600)
  runtime.stop(143)
  assert.equal(await runtime.done, 143)
  for (const { child } of calls) assert.deepEqual(child.signals, ['SIGTERM'])
})

test('cloudflared failure before URL stops without launching Host', async t => {
  const { calls, home, runtime } = fixture(t)
  calls[0].child.emit('close', 1, null)
  assert.equal(await runtime.done, 1)
  assert.equal(calls.length, 1)
  assert.equal(readFileSync(join(home, 'public-url.txt'), 'utf8'), '')
})

test('tunnel exit after startup closes Host', async t => {
  const { calls, runtime } = fixture(t)
  calls[0].child.stderr.write('https://phone-demo.trycloudflare.com\n')
  calls[0].child.emit('close', 1, null)
  assert.equal(await runtime.done, 1)
  assert.deepEqual(calls[1].child.signals, ['SIGTERM'])
})

test('Host exit closes the tunnel and no-tunnel mode forwards repeated trusted hosts', async t => {
  const { calls, runtime } = fixture(t)
  calls[0].child.stderr.write('https://phone-demo.trycloudflare.com\n')
  calls[1].child.emit('close', 2, null)
  assert.equal(await runtime.done, 2)
  assert.deepEqual(calls[0].child.signals, ['SIGTERM'])
  const local = fixture(t, false)
  assert.equal(local.calls.length, 1)
  assert.equal(local.calls[0].command, 'dsh')
  assert.deepEqual(local.calls[0].args.slice(-4), ['--trusted-host', 'phone.example', '--trusted-host', 'other.example'])
  local.runtime.stop(130, 'SIGINT')
  assert.equal(await local.runtime.done, 130)
  assert.deepEqual(local.calls[0].child.signals, ['SIGINT'])
})
