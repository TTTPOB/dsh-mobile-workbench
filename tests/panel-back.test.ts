import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createPanelBack } from '../src/client/effects/panel-back.ts'

function fixture(delayedCommit = false) {
  const originals = Object.fromEntries(['window', 'history'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]))
  let activePanelId: string | null = 'plugins'
  let state: Record<string, unknown> | null = { mobileWorkbenchPage: 'sessions' }
  let pushes = 0, backs = 0, exits = 0
  const listeners = new Set<(event: { state: unknown }) => void>()
  const subscribers = new Set<() => void>()
  const timers = new Map<number, () => void>()
  let timerId = 0
  const publish = (): void => { for (const listener of subscribers) listener() }
  Object.assign(globalThis, {
    window: {
      addEventListener: (_: string, listener: (event: { state: unknown }) => void) => listeners.add(listener),
      removeEventListener: (_: string, listener: (event: { state: unknown }) => void) => listeners.delete(listener),
      setTimeout: (listener: () => void, delay: number) => { assert.equal(delay, 1200); timers.set(++timerId, listener); return timerId },
      clearTimeout: (id: number) => timers.delete(id),
    },
    history: { get state() { return state }, pushState: (next: Record<string, unknown>) => { state = next; pushes++ }, back: () => { backs++ } },
  })
  return {
    layout: {
      panelInfo: { getSnapshot: () => ({ activePanelId }), subscribe: (listener: () => void) => { subscribers.add(listener); return () => { subscribers.delete(listener) } } },
      selectPanel: () => { exits++; if (!delayedCommit) { activePanelId = null; publish() } },
    },
    close: () => { activePanelId = null; publish() },
    reopen: () => { activePanelId = 'settings'; publish() },
    pop: (next: Record<string, unknown> | null = { mobileWorkbenchPage: 'sessions' }) => { state = next; for (const listener of listeners) listener({ state }) },
    expire: () => { for (const timer of [...timers.values()]) timer() },
    state: () => state,
    counts: () => ({ pushes, backs, exits, listeners: listeners.size, timers: timers.size, subscribers: subscribers.size }),
    restore: () => { for (const [key, descriptor] of Object.entries(originals)) { if (descriptor) Object.defineProperty(globalThis, key, descriptor); else Reflect.deleteProperty(globalThis, key) } },
  }
}

test('public panelInfo owns one entry above a page entry and Back closes only the panel', () => {
  const f = fixture()
  try {
    const back = createPanelBack(f.layout)
    back.update()
    assert.equal(f.counts().pushes, 1)
    assert.deepEqual(f.state(), { mobileWorkbenchPage: 'sessions', mobilePanelExit: true })
    f.pop({ mobilePanelExit: true })
    assert.equal(f.counts().exits, 0, 'arriving at our entry has not consumed it')
    f.pop()
    assert.equal(f.counts().exits, 1)
    assert.equal(f.counts().backs, 0, 'Back must not consume the underlying page entry')
    back.dispose()
    assert.equal(f.counts().subscribers, 0)
  } finally { f.restore() }
})

test('native navigation consumes its panel entry once and ignores the history echo', () => {
  const f = fixture()
  try {
    const back = createPanelBack(f.layout)
    f.close()
    assert.equal(f.counts().backs, 1)
    f.pop()
    assert.equal(f.counts().exits, 0)
    f.pop(null)
    assert.equal(f.counts().exits, 0, 'unrelated page Back is not ours')
    back.dispose()
    assert.deepEqual(f.counts(), { pushes: 1, backs: 1, exits: 0, listeners: 0, timers: 0, subscribers: 0 })
  } finally { f.restore() }
})

test('the 1200ms echo expires before the next panel opens', () => {
  const f = fixture()
  try {
    const back = createPanelBack(f.layout)
    f.close()
    f.expire()
    f.reopen()
    assert.equal(f.counts().pushes, 2)
    back.dispose()
    assert.equal(f.counts().backs, 2)
  } finally { f.restore() }
})

test('Back cannot rearm while the panel exit is still committing', () => {
  const f = fixture(true)
  try {
    const back = createPanelBack(f.layout)
    f.pop()
    back.update(); back.update()
    assert.equal(f.counts().pushes, 1)
    assert.equal(f.counts().exits, 1)
    f.close()
    back.dispose()
    assert.equal(f.counts().backs, 0)
  } finally { f.restore() }
})
