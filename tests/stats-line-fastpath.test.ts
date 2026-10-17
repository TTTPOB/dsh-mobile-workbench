import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createStatsDecoration } from '../src/client/effects/stats-line.ts'

class Node {
  attributes = new Map<string, string>()
  parentElement: Node | null = null
  children: Node[] = []
  textContent = ''
  matches(selector: string): boolean { return selector === '[data-composer-stat]' && this.attributes.has('data-composer-stat') }
  querySelector(selector: string): Node | null { return this.children.find(child => child.matches(selector)) ?? null }
  getAttribute(key: string): string | null { return this.attributes.get(key) ?? null }
  setAttribute(key: string, value: string): void { this.attributes.set(key, value) }
  removeAttribute(key: string): void { this.attributes.delete(key) }
}

test('independent activity and usage pills stay native, rebind, and clear on disposal', t => {
  const dock = new Node(), activity = new Node(), usage = new Node(), ring = new Node()
  activity.setAttribute('data-composer-stat', 'activity')
  usage.setAttribute('data-composer-stat', 'usage')
  usage.textContent = '1.7K tok · 30%'
  ring.textContent = '12%'
  let current = [activity, usage]
  dock.children = [...current, ring]
  for (const child of dock.children) child.parentElement = dock
  const original = Object.getOwnPropertyDescriptor(globalThis, 'document')
  Object.defineProperty(globalThis, 'document', { configurable: true, value: {
    querySelector: (selector: string) => { assert.equal(selector, '[data-composer-dock]'); return dock },
    querySelectorAll: (selector: string) => { assert.equal(selector, '[data-composer-stat]'); return current },
  } })
  t.after(() => { if (original) Object.defineProperty(globalThis, 'document', original); else Reflect.deleteProperty(globalThis, 'document') })
  const decoration = createStatsDecoration()
  decoration.ensure()
  decoration.ensure()
  for (const stat of current) assert.equal(stat.getAttribute('data-mobile-nav'), 'stats')
  assert.equal(ring.getAttribute('data-mobile-nav'), 'stats-ring')
  assert.deepEqual(dock.children, [activity, usage, ring])
  current = []
  dock.children = [ring]
  decoration.ensure()
  assert.equal(activity.getAttribute('data-mobile-nav'), null)
  assert.equal(usage.getAttribute('data-mobile-nav'), null)
  assert.equal(ring.getAttribute('data-mobile-nav'), 'stats-ring', 'context stays decorated with no stats')
  current = [usage]
  dock.children = [usage, ring]
  decoration.ensure()
  decoration.dispose()
  assert.equal(usage.getAttribute('data-mobile-nav'), null)
  assert.equal(ring.getAttribute('data-mobile-nav'), null)
  assert.equal(usage.getAttribute('data-composer-stat'), 'usage')
  assert.equal(usage.parentElement, dock)
})
