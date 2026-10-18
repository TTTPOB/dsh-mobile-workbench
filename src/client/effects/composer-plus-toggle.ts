import type { Context as ClientContext } from '@deepseek-ai/cordis'
import { installMobileEffect } from './phone-chrome.ts'
import { composerScope, composerTriggers } from '../workbench/composer-session.ts'

const ADD = '[data-composer-card] button[class*="_add"]'
const INPUT = '[data-composer-input]'

/** Native focus/track can clear the launcher before its own toggle. Close via the public controller. */
export function installComposerPlusToggle(ctx: ClientContext): void {
  installMobileEffect(ctx, 'dsh-web-mobile: composer plus toggle', () => {
    let openBeforeClick = false
    let scopeBeforeClick: ClientContext | undefined
    let subscribedScope: ClientContext | undefined
    let unsubscribeMenu: (() => void) | undefined
    let collapseTimers: number[] = []
    const cancelCollapse = (): void => {
      for (const timer of collapseTimers) window.clearTimeout(timer)
      collapseTimers = []
    }
    const sync = (): void => {
      const scope = composerScope(ctx)
      if (scope === subscribedScope) return
      unsubscribeMenu?.()
      subscribedScope = scope
      cancelCollapse()
      unsubscribeMenu = composerTriggers(ctx)?.menu.subscribe(() => {
        if (!composerTriggers(ctx)?.menu.getSnapshot().open) cancelCollapse()
      })
    }
    const dropEditorFocus = (): void => {
      const editor = document.querySelector<HTMLElement>(INPUT)
      if (editor && document.activeElement === editor) editor.blur()
    }
    const onPointer = (event: Event): void => {
      if (!(event.target instanceof Element)) return
      if (event.target.closest(INPUT)) cancelCollapse()
      else if (event.target.closest(ADD)) {
        sync()
        // Real Android IME can reopen even when programmatic focus is shadowed.
        dropEditorFocus()
      }
    }
    const capture = (event: Event): void => {
      openBeforeClick = false
      scopeBeforeClick = undefined
      if (!(event.target instanceof Element) || !event.target.closest(ADD)) return
      sync()
      scopeBeforeClick = composerScope(ctx)
      openBeforeClick = composerTriggers(ctx)?.menu.getSnapshot().open ?? false
    }
    const bubble = (event: Event): void => {
      const wasOpen = openBeforeClick
      const scope = scopeBeforeClick
      openBeforeClick = false
      scopeBeforeClick = undefined
      if (!(event.target instanceof Element) || !event.target.closest(ADD)) return
      if (scope === undefined || scope !== composerScope(ctx)) return
      const controller = composerTriggers(ctx)
      if (wasOpen && controller?.menu.getSnapshot().open) controller.dismiss()
      cancelCollapse()
      if (!composerTriggers(ctx)?.menu.getSnapshot().open) return
      for (const delay of [120, 320, 640]) collapseTimers.push(window.setTimeout(() => {
        if (scope === composerScope(ctx) && composerTriggers(ctx)?.menu.getSnapshot().open) dropEditorFocus()
      }, delay))
    }
    const unsubscribeList = ctx.sessions.list.subscribe(sync)
    sync()
    document.addEventListener('pointerdown', onPointer, true)
    document.addEventListener('click', capture, true)
    document.addEventListener('click', bubble)
    return () => {
      cancelCollapse()
      unsubscribeList()
      unsubscribeMenu?.()
      document.removeEventListener('pointerdown', onPointer, true)
      document.removeEventListener('click', capture, true)
      document.removeEventListener('click', bubble)
    }
  })
}
