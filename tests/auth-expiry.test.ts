import { test } from 'node:test'
import assert from 'node:assert/strict'
import { isAuthExpired, watchAuthExpiry } from '../src/client/effects/auth-expiry-probe.ts'

const flush = async () => { await Promise.resolve(); await Promise.resolve() }

function fixture(initial: 'connected' | 'connecting' | 'disconnected' | undefined) {
  let state = initial
  const listeners = new Set<() => void>()
  const mediaListeners = new Set<() => void>()
  const media = {
    matches: true,
    addEventListener(_event: string, listener: () => void) { mediaListeners.add(listener) },
    removeEventListener(_event: string, listener: () => void) { mediaListeners.delete(listener) },
  }
  const calls: { url: string; init: RequestInit; resolve(response: Response): void; reject(error: Error): void }[] = []
  let notices = 0
  const stop = watchAuthExpiry({
    state: { getSnapshot: () => state, subscribe(listener) { listeners.add(listener); return () => { listeners.delete(listener) } } },
    mobile: media as MediaQueryList,
    cloudflareAccess: true,
    fetch: ((url: string, init: RequestInit) => new Promise<Response>((resolve, reject) => {
      calls.push({ url, init, resolve, reject })
      init.signal!.addEventListener('abort', () => reject(new Error('aborted')), { once: true })
    })) as typeof fetch,
    notify() { notices++ },
  })
  return {
    calls, stop, listeners, mediaListeners,
    get notices() { return notices },
    setState(next: typeof state) { state = next; for (const listener of listeners) listener() },
    setMobile(next: boolean) { media.matches = next; for (const listener of mediaListeners) listener() },
  }
}

test('only 401 and identified Access redirects expire authentication', () => {
  assert.equal(isAuthExpired(new Response(null, { status: 401 }), false), true)
  for (const status of [200, 403, 404, 500, 503]) {
    assert.equal(isAuthExpired(new Response('<html>Login</html>', { status }), true), false)
  }
  const redirect = (location: string) => new Response(null, { status: 302, headers: { location } })
  assert.equal(isAuthExpired(redirect('https://team.cloudflareaccess.com/cdn-cgi/access/login/app'), false), true)
  assert.equal(isAuthExpired(redirect('/ordinary-login'), true), false)
  assert.equal(isAuthExpired(redirect('/cdn-cgi/access/login-unrelated'), true), false)
  assert.equal(isAuthExpired(new Response(null, { status: 302 }), true), false)
  const opaque = { status: 0, type: 'opaqueredirect' } as Response
  assert.equal(isAuthExpired(opaque, true), true)
  assert.equal(isAuthExpired(opaque, false), false)
})

test('offline failure retries without state transitions and never prompts', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] })
  const f = fixture('connecting')
  t.after(f.stop)
  assert.equal(f.calls[0]!.url, '/api')
  assert.deepEqual({ ...f.calls[0]!.init, signal: undefined }, {
    method: 'GET', credentials: 'same-origin', redirect: 'manual', cache: 'no-store', signal: undefined,
  })
  f.setState('disconnected')
  assert.equal(f.calls.length, 1)
  f.calls[0]!.reject(new Error('offline'))
  await flush()
  t.mock.timers.tick(15_000)
  assert.equal(f.calls.length, 2)
  f.calls[1]!.resolve(new Response('forbidden', { status: 403 }))
  await flush()
  t.mock.timers.tick(15_000)
  assert.equal(f.calls.length, 3)
  assert.equal(f.notices, 0)
})

test('one notice per continuous outage, reset only after connected', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] })
  const f = fixture('connecting')
  t.after(f.stop)
  f.calls[0]!.resolve(new Response(null, { status: 401 }))
  await flush()
  assert.equal(f.notices, 1)
  f.setState('disconnected')
  f.setMobile(false)
  f.setMobile(true)
  t.mock.timers.tick(60_000)
  assert.equal(f.calls.length, 1)
  f.setState('connected')
  t.mock.timers.tick(60_000)
  assert.equal(f.calls.length, 1)
  f.setState('connecting')
  f.calls[1]!.resolve(new Response(null, { status: 401 }))
  await flush()
  assert.equal(f.notices, 2)
})

test('no probes while connected or before first outcome; media exit and recovery abort stale work', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] })
  const f = fixture(undefined)
  t.after(f.stop)
  assert.equal(f.calls.length, 0)
  f.setState('connected')
  assert.equal(f.calls.length, 0)
  f.setMobile(false)
  f.setState('connecting')
  assert.equal(f.calls.length, 0)
  f.setMobile(true)
  f.setState('connected')
  assert.equal(f.calls[0]!.init.signal!.aborted, true)
  f.calls[0]!.resolve(new Response(null, { status: 401 }))
  await flush()
  assert.equal(f.notices, 0)
  f.setState('connecting')
  f.setMobile(false)
  assert.equal(f.calls[1]!.init.signal!.aborted, true)
  await flush()
  t.mock.timers.tick(60_000)
  assert.equal(f.calls.length, 2)
})

test('requests time out singly and disposal cancels work and subscriptions', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] })
  const f = fixture('connecting')
  t.mock.timers.tick(10_000)
  assert.equal(f.calls[0]!.init.signal!.aborted, true)
  await flush()
  t.mock.timers.tick(15_000)
  assert.equal(f.calls.length, 2)
  f.stop()
  assert.equal(f.calls[1]!.init.signal!.aborted, true)
  assert.equal(f.listeners.size, 0)
  assert.equal(f.mediaListeners.size, 0)
  await flush()
  t.mock.timers.tick(60_000)
  assert.equal(f.calls.length, 2)
  assert.equal(f.notices, 0)
})
