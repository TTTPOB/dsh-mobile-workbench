import assert from 'node:assert/strict'
import { test } from 'node:test'
import { boundaryMutation, COMPOSER_BOUNDARY, NAVIGATION_BOUNDARY, PRESENTATION_BOUNDARY, PRESENTATION_LOCAL } from '../src/client/workbench/dom-observation.ts'

class ElementFixture {
  parentElement: ElementFixture | null = null
  boundary: string | null = null
  owned = false
  scans = 0
  closest(selector: string): ElementFixture | null {
    if (selector.includes('data-workbench-context-control')) return this.owned ? this : null
    return this.boundary === selector ? this : this.parentElement?.closest(selector) ?? null
  }
  matches(selector: string): boolean { return this.boundary === selector }
  querySelector(): null { this.scans++; return null }
}

function fixture(t: { after: (fn: () => void) => void }) {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'Element')
  Object.defineProperty(globalThis, 'Element', { configurable: true, value: ElementFixture })
  t.after(() => {
    if (previous) Object.defineProperty(globalThis, 'Element', previous)
    else Reflect.deleteProperty(globalThis, 'Element')
  })
  return (target: object, type: string, addedNodes: object[] = [], removedNodes: object[] = []) =>
    ({ target, type, addedNodes, removedNodes }) as unknown as MutationRecord
}

test('streamed text never scans conversation ancestors or schedules presentation/composer work', t => {
  const record = fixture(t)
  const flow = new ElementFixture()
  const text = { parentElement: flow }
  for (const selector of [COMPOSER_BOUNDARY, NAVIGATION_BOUNDARY, PRESENTATION_BOUNDARY]) {
    assert.equal(boundaryMutation(record(text, 'characterData'), selector), false)
    assert.equal(boundaryMutation(record(flow, 'childList', [text]), selector), false)
  }
  assert.equal(flow.scans, 0)
})

test('boundary mount/removal and local labels/selection remain observable', t => {
  const record = fixture(t)
  const shell = new ElementFixture()
  for (const selector of [COMPOSER_BOUNDARY, NAVIGATION_BOUNDARY, PRESENTATION_BOUNDARY]) {
    const boundary = new ElementFixture()
    boundary.boundary = selector
    const label = new ElementFixture()
    label.parentElement = boundary
    assert.equal(boundaryMutation(record(shell, 'childList', [boundary]), selector), true)
    assert.equal(boundaryMutation(record(shell, 'childList', [], [boundary]), selector), true)
    assert.equal(boundaryMutation(record(label, 'attributes'), selector), true)
    assert.equal(boundaryMutation(record({ parentElement: label }, 'characterData'), selector), true)
  }
})

test('trajectory stream content is ignored while selection and inspector mounts remain visible', t => {
  const record = fixture(t)
  const trajectory = new ElementFixture()
  trajectory.boundary = PRESENTATION_BOUNDARY
  const text = { parentElement: trajectory }
  assert.equal(boundaryMutation(record(text, 'characterData'), PRESENTATION_BOUNDARY, PRESENTATION_LOCAL), false)
  assert.equal(boundaryMutation(record(trajectory, 'childList', [text]), PRESENTATION_BOUNDARY, PRESENTATION_LOCAL), false)
  assert.equal(boundaryMutation(record(trajectory, 'attributes'), PRESENTATION_BOUNDARY, PRESENTATION_LOCAL), true)
  assert.equal(boundaryMutation(record(new ElementFixture(), 'childList', [trajectory]), PRESENTATION_BOUNDARY, PRESENTATION_LOCAL), true)
})

test('owned controls do not create observer feedback', t => {
  const record = fixture(t)
  const control = new ElementFixture()
  control.boundary = PRESENTATION_BOUNDARY
  control.owned = true
  assert.equal(boundaryMutation(record(control, 'attributes'), PRESENTATION_BOUNDARY), false)
  assert.equal(boundaryMutation(record(control, 'childList', [new ElementFixture()]), PRESENTATION_BOUNDARY), false)
  assert.equal(control.scans, 0)
})
