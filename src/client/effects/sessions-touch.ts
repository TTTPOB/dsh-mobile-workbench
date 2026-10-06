import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import { currentSessionIdOf } from '../core/sessions-compat.ts'
import { detectIosWebKit, getFrame, installMobileEffect, toggleDrawer } from './phone-chrome.ts'
import { createTapFallback, isTapWithinSlop } from './session-tap-fallback.ts'
import { openPluginsModal } from '../workbench/plugin-modal.ts'

/** Native row actions remain authoritative; this effect only adapts touch input. */
export function installSessionsTouch(ctx: ClientContext): void {
  installMobileEffect(ctx, 'mobile-workbench: sessions touch', () => {
    const ios = detectIosWebKit(navigator, typeof CSS === 'undefined' ? null : CSS.supports.bind(CSS))
    const fallback = createTapFallback(run => {
      const timer = window.setTimeout(run, 350)
      return () => window.clearTimeout(timer)
    })
    let press: { row: HTMLElement; x: number; y: number; fired: boolean } | undefined
    let timer: number | undefined
    let swallow: HTMLElement | undefined
    let swallowUntil = 0
    let pendingSession: string | undefined
    let recoveredRow: HTMLElement | undefined
    let closeFrame: number | undefined
    const syntheticRenames = new WeakSet<Event>()
    const sessionsVisible = (): boolean => document.documentElement.getAttribute('data-mobile-workbench-page') === 'sessions'
    const rowOf = (target: EventTarget | null): HTMLElement | null => {
      if (!sessionsVisible() || document.querySelector('[aria-modal="true"]')) return null
      if (!(target instanceof Element) || target.closest('button, [class*="_rowActions"]')) return null
      const row = target.closest<HTMLElement>('[class*="_sessionRow"]')
      return row && getFrame()?.firstElementChild?.contains(row) ? row : null
    }
    const clearPress = (): void => {
      if (timer !== undefined) window.clearTimeout(timer)
      timer = undefined
      press = undefined
    }
    const closeSessions = (): void => {
      if (closeFrame !== undefined) window.cancelAnimationFrame(closeFrame)
      closeFrame = window.requestAnimationFrame(() => {
        closeFrame = undefined
        if (sessionsVisible() && getFrame()?.hasAttribute('data-sidebar-collapsed') === false) toggleDrawer(ctx)
      })
    }
    const sessionId = (row: HTMLElement): string | null => {
      const key = row.getAttribute('data-row-key')
      if (!key?.startsWith('session:')) return null
      const id = key.slice('session:'.length)
      return ctx.sessions.list.getSnapshot().byId[id] !== undefined ? id : null
    }
    const stopSessions = ctx.sessions.list.subscribe(() => {
      if (pendingSession && currentSessionIdOf(ctx.sessions.list.getSnapshot()) === pendingSession) {
        pendingSession = undefined
        closeSessions()
      }
    })
    const onDown = (event: PointerEvent): void => {
      fallback.cancel()
      clearPress()
      pendingSession = undefined
      recoveredRow = undefined
      if (event.pointerType !== 'touch' && event.pointerType !== 'pen') return
      const row = rowOf(event.target)
      if (!row) return
      press = { row, x: event.clientX, y: event.clientY, fired: false }
      timer = window.setTimeout(() => {
        timer = undefined
        if (!press) return
        press.fired = true
        const title = row.querySelector('[class*="_title"]')
        if (title) {
          const rename = new MouseEvent('dblclick', { bubbles: true, cancelable: true, view: window })
          syntheticRenames.add(rename)
          title.dispatchEvent(rename)
        } else row.querySelector<HTMLButtonElement>('[class*="_rowActions"] button')?.click()
      }, 500)
    }
    const onMove = (event: PointerEvent): void => {
      if (press && !isTapWithinSlop(press, { x: event.clientX, y: event.clientY }, 10)) clearPress()
    }
    const onUp = (event: PointerEvent): void => {
      const finished = press
      clearPress()
      if (!finished) return
      if (finished.fired) {
        swallow = finished.row
        swallowUntil = performance.now() + 800
        return
      }
      if (!isTapWithinSlop(finished, { x: event.clientX, y: event.clientY }, 12)) return
      // DSHA owns single-select / double-open. Never manufacture its clicks.
      if (!ios || finished.row.closest('[data-dsha-session-select]')) return
      const id = sessionId(finished.row)
      if (!id) return
      fallback.arm(() => {
        if (finished.row.isConnected && sessionsVisible()) {
          recoveredRow = finished.row
          finished.row.click()
        }
      })
    }
    const onClick = (event: MouseEvent): void => {
      const target = event.target
      // A late trusted click from the recovered tap must not activate twice.
      // The next physical pointerdown releases this guard.
      if (event.isTrusted && recoveredRow && target instanceof Element && recoveredRow.contains(target)) {
        event.preventDefault()
        event.stopPropagation()
        return
      }
      if (swallow && performance.now() <= swallowUntil && target instanceof Element && swallow.contains(target)) {
        swallow = undefined
        fallback.cancel()
        event.preventDefault()
        event.stopPropagation()
        return
      }
      if (sessionsVisible() && openPluginsModal(ctx, event)) return
      const row = rowOf(target)
      if (!row) {
        // Navigation must reach React before the sessions pane is hidden.
        if (sessionsVisible() && target instanceof Element
          && getFrame()?.firstElementChild?.contains(target)
          && target.closest('[class*="newSession"], [class*="searchResultRow"], [class*="searchResultWorkspace"], [class*="panelRow"], button[data-dsh-taskboard-entry], button[data-dsh-ssh-entry]')) closeSessions()
        return
      }
      fallback.cancel()
      if (row.closest('[data-dsha-session-select]')) return
      const id = sessionId(row)
      if (!id) return
      if (currentSessionIdOf(ctx.sessions.list.getSnapshot()) === id) closeSessions()
      else pendingSession = id
    }
    const onDoubleClick = (event: MouseEvent): void => {
      if (syntheticRenames.has(event) || !rowOf(event.target)) return
      if (!(event.target instanceof Element) || !event.target.closest('[class*="_title"]')) return
      event.preventDefault()
      event.stopPropagation()
    }
    const onCancel = (): void => { clearPress(); fallback.cancel() }
    document.addEventListener('pointerdown', onDown, true)
    document.addEventListener('pointermove', onMove, true)
    document.addEventListener('pointerup', onUp, true)
    document.addEventListener('pointercancel', onCancel, true)
    document.addEventListener('click', onClick, true)
    document.addEventListener('dblclick', onDoubleClick, true)
    document.addEventListener('dsha-session-open', closeSessions)
    return () => {
      onCancel()
      stopSessions()
      if (closeFrame !== undefined) window.cancelAnimationFrame(closeFrame)
      document.removeEventListener('pointerdown', onDown, true)
      document.removeEventListener('pointermove', onMove, true)
      document.removeEventListener('pointerup', onUp, true)
      document.removeEventListener('pointercancel', onCancel, true)
      document.removeEventListener('click', onClick, true)
      document.removeEventListener('dblclick', onDoubleClick, true)
      document.removeEventListener('dsha-session-open', closeSessions)
    }
  })
}
