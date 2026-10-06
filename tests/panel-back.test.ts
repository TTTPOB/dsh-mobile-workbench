import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createPanelBack } from '../src/client/effects/panel-back.ts'

function fixture(delayedCommit = false) {
  const originals = Object.fromEntries(['window', 'document', 'history'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]))
  let panel = true
  let pushes = 0
  let backs = 0
  let exits = 0
  const listeners = new Set<() => void>()
  const timers = new Set<() => void>()
  Object.assign(globalThis, {
    window: {
      addEventListener: (_: string, listener: () => void) => listeners.add(listener),
      removeEventListener: (_: string, listener: () => void) => listeners.delete(listener),
      setTimeout: (listener: () => void) => { timers.add(listener); return listener },
      clearTimeout: (listener: () => void) => timers.delete(listener),
    },
    document: { querySelector: () => panel ? {} : null },
    history: { pushState: () => { pushes++ }, back: () => { backs++ } },
  })
  return {
    layout: { selectPanel: () => { exits++; if (!delayedCommit) panel = false } },
    close: () => { panel = false },
    pop: () => { for (const listener of listeners) listener() },
    counts: () => ({ pushes, backs, exits, listeners: listeners.size, timers: timers.size }),
    restore: () => {
      for (const [key, descriptor] of Object.entries(originals)) {
        if (descriptor) Object.defineProperty(globalThis, key, descriptor)
        else Reflect.deleteProperty(globalThis, key)
      }
    },
  }
}

test('native panel gets one history entry and system Back returns to the conversation', () => {
  const f = fixture()
  try {
    const back = createPanelBack(f.layout)
    back.update()
    back.update()
    assert.equal(f.counts().pushes, 1)
    f.pop()
    assert.equal(f.counts().exits, 1)
    back.update()
    assert.equal(f.counts().pushes, 1)
    back.dispose()
    assert.equal(f.counts().listeners, 0)
  } finally { f.restore() }
})

test('leaving through navigation consumes its entry without a second panel exit', () => {
  const f = fixture()
  try {
    const back = createPanelBack(f.layout)
    back.update()
    f.close()
    back.update()
    assert.equal(f.counts().backs, 1)
    f.pop()
    assert.equal(f.counts().exits, 0)
    back.dispose()
    assert.equal(f.counts().timers, 0)
    assert.equal(f.counts().listeners, 0)
  } finally { f.restore() }
})

test('disposal releases an armed panel entry and listeners', () => {
  const f = fixture()
  try {
    const back = createPanelBack(f.layout)
    back.update()
    back.dispose()
    assert.equal(f.counts().backs, 1)
    assert.equal(f.counts().listeners, 0)
    assert.equal(f.counts().timers, 0)
  } finally { f.restore() }
})

test('Back does not rearm history before React commits the panel exit', () => {
  const f = fixture(true)
  try {
    const back = createPanelBack(f.layout)
    back.update()
    f.pop()
    back.update()
    back.update()
    assert.equal(f.counts().pushes, 1)
    assert.equal(f.counts().exits, 1)
    f.close()
    back.update()
    back.dispose()
  } finally { f.restore() }
})
