// Session focus guard: entering a session must not raise the soft keyboard.
//
// The host InputBar focuses the Lexical editor from a passive effect keyed on
// [locked, sessionId, editor] (dsh-client-ui-conversation 0.1.7-rc.2), so every
// session switch programmatically focuses the editing surface. The guard opens
// a short shadow-focus window per snapshot-observed current-session change and
// swallows that autofocus; real taps never route through the JS method.
//
// The DOM half (snapshot subscription, MutationObserver timing, own-property
// shadow) is browser-only; these tests audit the source invariants the fix
// depends on, mirroring composer-keyboard-guard.test.ts.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { stripTypeScriptTypes } from 'node:module'
import { runInNewContext } from 'node:vm'

const SOURCE = readFileSync(
  fileURLToPath(new URL('../src/client/effects/session-focus-guard.ts', import.meta.url)),
  'utf8',
)

test('the guard is mobile-only via installMobileEffect', () => {
  assert.match(SOURCE, /installMobileEffect\(ctx, 'dsh-web-mobile: session focus guard'/)
})

test('arming keys off a current-session CHANGE, not list churn', () => {
  // Any list invalidation (titles, ordering, refresh) re-reads the snapshot;
  // only an actual change of the current session id opens the window.
  assert.match(SOURCE, /currentSessionIdOf\(list\.getSnapshot\(\)\)/)
  assert.match(SOURCE, /if \(current === lastSessionId\) return/)
  assert.match(SOURCE, /list\.subscribe\(/)
})

test('the shadow targets only the Lexical editing surface', () => {
  assert.match(SOURCE, /COMPOSER_INPUT_SELECTOR = '\[data-composer-input\]'/)
  // The shadow recipe and its marker are the shared composer-keyboard-guard
  // slot — one marker, one own-property recipe, interoperable restores.
  assert.match(SOURCE, /import \{ SHADOW_MARKER \} from '\.\/composer-keyboard-guard\.ts'/)
  assert.match(SOURCE, /Object\.defineProperty\(el, 'focus',/)
  assert.match(SOURCE, /configurable: true,/)
})

test('the observer re-shadows a freshly mounted editor inside the window', () => {
  // Session switches remount the InputBar; the window must shadow the NEW
  // element before the host's passive effect runs.
  assert.match(SOURCE, /new MutationObserver\(/)
  assert.match(SOURCE, /if \(!windowOpen\) return/)
  assert.match(SOURCE, /observer\.observe\(document\.documentElement, \{ childList: true, subtree: true \}\)/)
})

test('the window is finite and restore closes it completely', () => {
  assert.match(SOURCE, /FOCUS_GUARD_WINDOW_MS = 800/)
  assert.match(SOURCE, /window\.setTimeout\(restore, FOCUS_GUARD_WINDOW_MS\)/)
  // Regression pin (composer-keyboard-guard 2026-09-23 lesson): restore() must
  // zero the timer and the window flag together, never leave either live.
  assert.match(SOURCE, /window\.clearTimeout\(windowTimer\)\s*\n\s*windowTimer = 0\s*\n\s*windowOpen = false/)
})

test('a tap on the editing surface closes the window early', () => {
  // The user tapping the editor is "I want to type": no residual shadow may
  // outlive that intent.
  assert.match(SOURCE, /if \(!windowOpen\) return\s*\n\s*const target = event\.target/)
  assert.match(SOURCE, /target\.closest\(COMPOSER_INPUT_SELECTOR\) !== null\) restore\(\)/)
})

test('the window keeps a focusin fallback that blurs synchronously', () => {
  // 2026-09-29 headless correction: the host focuses the remounted editor
  // from the commit's synchronous phase, before the observer microtask can
  // shadow it — the window must therefore blur any focus that still lands
  // on the editing surface while it is open (composer-keyboard-guard's
  // real-device-proven recipe). Capture phase, gated on the window flag.
  assert.match(SOURCE, /const onFocusIn = \(event: Event\): void => \{\s*\n\s*if \(!windowOpen\) return\s*\n\s*const target = event\.target\s*\n\s*if \(target instanceof HTMLElement && target\.closest\(COMPOSER_INPUT_SELECTOR\) !== null\) target\.blur\(\)/)
  assert.match(SOURCE, /document\.addEventListener\('focusin', onFocusIn, true\)/)
  assert.match(SOURCE, /document\.removeEventListener\('focusin', onFocusIn, true\)/)
})

test('disposal unsubscribes, disconnects and restores', () => {
  assert.match(SOURCE, /unsubscribe\(\)\s*\n\s*observer\.disconnect\(\)/)
  assert.match(SOURCE, /document\.removeEventListener\('pointerdown', onPointerDown, true\)\s*\n\s*document\.removeEventListener\('focusin', onFocusIn, true\)\s*\n\s*restore\(\)/)
})

test('observer connects only during a session-change guard window and stops on tap, timeout and dispose', () => {
  const executable = stripTypeScriptTypes(SOURCE.replace(/^import .*\n/gm, '').replaceAll('export function', 'function'))
  let current = 'A'
  let changed = () => {}
  let dispose = () => {}
  let timer = () => {}
  let observed = false
  const listeners = new Map<string, (event: object) => void>()
  class Element {
    attributes = new Set<string>()
    focus?: () => void
    closest() { return this }
    hasAttribute(key: string) { return this.attributes.has(key) }
    setAttribute(key: string) { this.attributes.add(key) }
    removeAttribute(key: string) { this.attributes.delete(key) }
  }
  const editor = new Element()
  runInNewContext(executable + '; installSessionFocusGuard(ctx)', {
    ctx: { sessions: { list: { getSnapshot: () => current, subscribe: (listener: () => void) => { changed = listener; return () => { changed = () => {} } } } } },
    currentSessionIdOf: (snapshot: string) => snapshot,
    SHADOW_MARKER: 'data-mobile-nav-focus-shadow',
    Element, HTMLElement: Element,
    document: { documentElement: {}, querySelector: () => editor, addEventListener: (key: string, listener: (event: object) => void) => listeners.set(key, listener), removeEventListener: (key: string) => listeners.delete(key) },
    window: { clearTimeout() {}, setTimeout: (fn: () => void) => { timer = fn; return 1 } },
    MutationObserver: class { observe() { observed = true } disconnect() { observed = false } },
    installMobileEffect: (_ctx: object, _label: string, install: () => () => void) => { dispose = install() },
  })
  assert.equal(observed, false)
  changed()
  assert.equal(observed, false, 'list churn does not connect an observer')
  current = 'B'; changed()
  assert.equal(observed, true)
  listeners.get('pointerdown')!({ target: editor })
  assert.equal(observed, false)
  assert.equal(Object.hasOwn(editor, 'focus'), false)
  current = 'C'; changed(); timer()
  assert.equal(observed, false, 'timeout disconnects')
  current = 'D'; changed(); dispose()
  assert.equal(observed, false)
  assert.equal(listeners.size, 0)
})

test('the effect is wired into the client entry', () => {
  const entry = readFileSync(
    fileURLToPath(new URL('../src/client/index.tsx', import.meta.url)),
    'utf8',
  )
  assert.match(entry, /installSessionFocusGuard\(ctx\)/)
})
