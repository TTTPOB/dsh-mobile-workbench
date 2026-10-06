import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createTapFallback } from '../src/client/effects/session-tap-fallback.ts'
import { isTapWithinSlop } from '../src/client/effects/session-tap-fallback.ts'

function clock() {
  const pending = new Set<() => void>()
  return {
    later: (run: () => void): (() => void) => { pending.add(run); return () => { pending.delete(run) } },
    fire: (): void => { for (const run of [...pending]) { pending.delete(run); run() } },
    size: (): number => pending.size,
  }
}

test('a real click cancels missing-click recovery and cannot navigate twice', () => {
  const timer = clock()
  const fallback = createTapFallback(timer.later)
  let opens = 0
  fallback.arm(() => { opens++ })
  fallback.cancel()
  opens++ // The native row handler owns the real click.
  timer.fire()
  assert.equal(opens, 1)
  assert.equal(timer.size(), 0)
})

test('a missing click gets one native recovery, and later ticks cannot replay it', () => {
  const timer = clock()
  const fallback = createTapFallback(timer.later)
  let opens = 0
  fallback.arm(() => { opens++ })
  timer.fire()
  timer.fire()
  assert.equal(opens, 1)
})

test('a replacement tap and disposal cancel the previous recovery', () => {
  const timer = clock()
  const fallback = createTapFallback(timer.later)
  const opened: string[] = []
  fallback.arm(() => { opened.push('old') })
  fallback.arm(() => { opened.push('new') })
  timer.fire()
  assert.deepEqual(opened, ['new'])
  fallback.arm(() => { opened.push('disposed') })
  fallback.cancel()
  timer.fire()
  assert.deepEqual(opened, ['new'])
})

test('scrolling is not a row tap', () => {
  assert.equal(isTapWithinSlop({ x: 5, y: 5 }, { x: 8, y: 65 }, 12), false)
})

const source = readFileSync(new URL('../src/client/effects/sessions-touch.ts', import.meta.url), 'utf8')
test('DSHA selection and native business state are not replaced by recovery', () => {
  assert.match(source, /if \(!ios \|\| finished\.row\.closest\('\[data-dsha-session-select\]'\)\) return/)
  assert.match(source, /if \(row\.closest\('\[data-dsha-session-select\]'\)\) return/)
  assert.match(source, /finished\.row\.click\(\)/)
  assert.doesNotMatch(source, /sessions\.open\(|armNav|MutationObserver|gesture-guard|closeDrawerAnimated/)
})

test('long press replays the native rename and swallows only its own row click', () => {
  assert.match(source, /syntheticRenames\.add\(rename\)/)
  assert.match(source, /title\.dispatchEvent\(rename\)/)
  assert.match(source, /swallow\.contains\(target\)/)
  assert.match(source, /document\.removeEventListener\('pointercancel', onCancel, true\)/)
})
