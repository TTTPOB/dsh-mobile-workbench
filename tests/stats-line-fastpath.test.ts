import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createStatsDecoration } from '../src/client/effects/stats-line.ts'

test('native metrics are decorated in place, rebound and cleared on disposal', t => {
  class Node {
    attributes = new Map<string, string>()
    parentElement: Node | null = null
    children: Node[] = []
    textContent = ''
    contains(node: Node | null): boolean { return this === node || this.children.some(child => child.contains(node)) }
    getAttribute(key: string): string | null { return this.attributes.get(key) ?? null }
    setAttribute(key: string, value: string): void { this.attributes.set(key, value) }
    removeAttribute(key: string): void { this.attributes.delete(key) }
  }
  const dock = new Node(), holder = new Node(), stats = new Node(), ring = new Node()
  holder.parentElement = dock
  stats.parentElement = holder
  ring.parentElement = dock
  holder.children = [stats]
  dock.children = [holder, ring]
  ring.textContent = '12%'
  let current: Node | null = stats
  const original = Object.getOwnPropertyDescriptor(globalThis, 'document')
  Object.defineProperty(globalThis, 'document', { configurable: true, value: { querySelector: () => current } })
  t.after(() => { if (original) Object.defineProperty(globalThis, 'document', original); else Reflect.deleteProperty(globalThis, 'document') })
  const decoration = createStatsDecoration()
  decoration.ensure()
  decoration.ensure()
  assert.equal(stats.getAttribute('data-mobile-nav'), 'stats')
  assert.equal(ring.getAttribute('data-mobile-nav'), 'stats-ring')
  assert.equal(ring.parentElement, dock)
  assert.deepEqual(dock.children, [holder, ring])
  current = null
  decoration.ensure()
  assert.equal(stats.attributes.size, 0)
  assert.equal(ring.attributes.size, 0)
  current = stats
  decoration.ensure()
  decoration.dispose()
  assert.equal(stats.attributes.size, 0)
  assert.equal(ring.attributes.size, 0)
})
