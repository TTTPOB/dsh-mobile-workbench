import { test } from 'node:test'
import assert from 'node:assert/strict'
import { installSessionsTouch } from '../src/client/effects/sessions-touch.ts'

function fixture(dsha = false, initialSession = 'old', rowKey = 'session:new') {
  const keys = ['window', 'document', 'navigator', 'Element', 'CSS']
  const originals = new Map(keys.map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]))
  const listeners = new Map<string, Set<(event: any) => void>>()
  const storeListeners = new Set<() => void>()
  const timers = new Map<number, { run: () => void; delay: number }>()
  const frames = new Map<number, () => void>()
  let nextId = 1
  let opens = 0
  let closed = false
  let current = initialSession
  let dispose: (() => void) | undefined
  class Row {
    isConnected = true
    getAttribute(name: string): string | null { return name === 'data-row-key' ? rowKey : null }
    closest(selector: string): Row | null {
      if (selector === '[class*="_sessionRow"]') return this
      if (selector === '[data-dsha-session-select]') return dsha ? this : null
      return null
    }
    querySelector(): null { return null }
    contains(target: unknown): boolean { return target === this }
    click(): void { click() }
  }
  const row = new Row()
  const frame = {
    firstElementChild: { contains: (target: unknown) => target === row },
    querySelector: () => null,
    hasAttribute: () => closed,
  }
  const dispatch = (type: string, properties: Record<string, unknown> = {}): boolean => {
    let blocked = false
    const event = { target: row, pointerType: 'touch', clientX: 20, clientY: 20, preventDefault() { blocked = true }, stopPropagation() { blocked = true }, ...properties }
    for (const listener of listeners.get(type) ?? []) listener(event)
    return blocked
  }
  function click(trusted = false): void {
    if (dispatch('click', { isTrusted: trusted })) return
    opens++
    current = 'new'
    for (const listener of storeListeners) listener()
  }
  const globals = {
    Element: Row,
    CSS: undefined,
    navigator: { userAgent: 'iPhone', maxTouchPoints: 1 },
    document: {
      documentElement: { getAttribute: (key: string) => key === 'data-mobile-workbench-page' ? 'sessions' : 'true' },
      querySelector: (selector: string) => selector.includes('frame') ? frame : null,
      addEventListener: (type: string, listener: (event: any) => void) => {
        if (!listeners.has(type)) listeners.set(type, new Set())
        listeners.get(type)!.add(listener)
      },
      removeEventListener: (type: string, listener: (event: any) => void) => listeners.get(type)?.delete(listener),
    },
    window: {
      matchMedia: () => ({ matches: true, addEventListener() {}, removeEventListener() {} }),
      setTimeout: (run: () => void, delay: number) => { const id = nextId++; timers.set(id, { run, delay }); return id },
      clearTimeout: (id: number) => timers.delete(id),
      requestAnimationFrame: (run: () => void) => { const id = nextId++; frames.set(id, run); return id },
      cancelAnimationFrame: (id: number) => frames.delete(id),
    },
  }
  for (const [key, value] of Object.entries(globals)) Object.defineProperty(globalThis, key, { value, configurable: true, writable: true })
  installSessionsTouch({
    effect: (install: () => () => void) => { dispose = install() },
    get: () => undefined,
    layout: { toggleSidebar: () => { closed = !closed } },
    sessions: { list: {
      getSnapshot: () => ({ current, byId: { old: { id: 'old' }, new: { id: 'new' } } }),
      subscribe: (listener: () => void) => { storeListeners.add(listener); return () => { storeListeners.delete(listener) } },
    } },
  } as any)
  return {
    dispatch, click,
    flush: () => {
      for (const [id, timer] of [...timers]) if (timer.delay === 350) { timers.delete(id); timer.run() }
      for (const [id, run] of [...frames]) { frames.delete(id); run() }
    },
    counts: () => ({ opens, closed, timers: timers.size, subscriptions: storeListeners.size }),
    dispose: () => dispose?.(),
    restore: () => {
      dispose?.()
      for (const key of keys) {
        const original = originals.get(key)
        if (original) Object.defineProperty(globalThis, key, original)
        else Reflect.deleteProperty(globalThis, key)
      }
    },
  }
}

test('iOS native click cancels recovery, opens once and then closes sessions', () => {
  const f = fixture()
  try {
    f.dispatch('pointerdown')
    f.dispatch('pointerup')
    f.click()
    f.flush()
    assert.equal(f.counts().opens, 1)
    assert.equal(f.counts().closed, true)
  } finally { f.restore() }
})

test('iOS dropped click recovers through the native row once', () => {
  const f = fixture()
  try {
    f.dispatch('pointerdown')
    f.dispatch('pointerup')
    f.flush()
    f.flush()
    f.click(true) // A delayed browser click from the same physical tap.
    assert.equal(f.counts().opens, 1)
    assert.equal(f.counts().closed, true)
  } finally { f.restore() }
})

test('vertical scrolling and pointer cancellation never open a row', () => {
  const f = fixture()
  try {
    f.dispatch('pointerdown')
    f.dispatch('pointermove', { clientY: 80 })
    f.dispatch('pointerup', { clientY: 80 })
    f.flush()
    assert.equal(f.counts().opens, 0)
    f.dispatch('pointerdown')
    f.dispatch('pointercancel')
    f.dispatch('pointerup')
    f.flush()
    assert.equal(f.counts().opens, 0)
  } finally { f.restore() }
})

test('DSHA single selection is never turned into a synthesized open', () => {
  const f = fixture(true)
  try {
    f.dispatch('pointerdown')
    f.dispatch('pointerup')
    f.flush()
    assert.equal(f.counts().opens, 0)
    f.dispatch('click')
    f.flush()
    assert.equal(f.counts().closed, false)
    f.dispatch('dsha-session-open')
    f.flush()
    assert.equal(f.counts().closed, true)
  } finally { f.restore() }
})

test('disposal cancels a pending recovery and unsubscribes the official store', () => {
  const f = fixture()
  try {
    f.dispatch('pointerdown')
    f.dispatch('pointerup')
    f.dispose()
    f.flush()
    assert.deepEqual(f.counts(), { opens: 0, closed: false, timers: 0, subscriptions: 0 })
  } finally { f.restore() }
})

test('rc.2 current-session row click returns to session without a store change', () => {
  const f = fixture(false, 'new')
  try {
    f.click(true)
    f.flush()
    assert.equal(f.counts().opens, 1)
    assert.equal(f.counts().closed, true)
  } finally { f.restore() }
})

test('unknown and non-session public row keys never trigger recovery', () => {
  for (const key of ['session:unknown', 'workspace:new']) {
    const f = fixture(false, 'old', key)
    try {
      f.dispatch('pointerdown')
      f.dispatch('pointerup')
      f.flush()
      assert.equal(f.counts().opens, 0)
      assert.equal(f.counts().closed, false)
    } finally { f.restore() }
  }
})
