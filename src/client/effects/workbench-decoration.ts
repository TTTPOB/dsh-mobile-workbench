import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import { findFrame, installMobileEffect } from './phone-chrome.ts'
import { createStatsDecoration } from './stats-line.ts'
import { createPanelBack } from './panel-back.ts'

/** Presentation only: frame discovery plus composer-local decoration. */
export function installWorkbenchDecoration(ctx: ClientContext): void {
  installMobileEffect(ctx, 'mobile-workbench: frame and stats decoration', () => {
    const stats = createStatsDecoration()
    const panelBack = createPanelBack(ctx.layout)
    let frame: HTMLElement | null = null
    let composer: Element | null = null
    let sidebar: Element | null = null
    let raf: number | undefined
    const schedule = (): void => {
      if (raf === undefined) raf = window.requestAnimationFrame(refresh)
    }
    const composerObserver = new MutationObserver(schedule)
    const sidebarObserver = new MutationObserver(schedule)
    const refresh = (): void => {
      raf = undefined
      const next = findFrame()
      if (next !== frame) {
        frame?.removeAttribute('data-mobile-nav')
        frame = next
        frame?.setAttribute('data-mobile-nav', 'frame')
        mounts.disconnect()
        if (frame?.parentElement) {
          mounts.observe(frame.parentElement, { childList: true })
          mounts.observe(frame, { childList: true, subtree: true })
        } else mounts.observe(document.body, { childList: true, subtree: true })
      }
      const nextSidebar = frame?.firstElementChild ?? null
      if (nextSidebar !== sidebar) {
        sidebarObserver.disconnect()
        sidebar = nextSidebar
        if (sidebar) sidebarObserver.observe(sidebar, {
          subtree: true, attributes: true, attributeFilter: ['aria-current'],
        })
      }
      const nextComposer = frame?.querySelector('[class*="_composerStack"]') ?? null
      if (nextComposer !== composer) {
        composerObserver.disconnect()
        stats.dispose()
        composer = nextComposer
        if (composer) composerObserver.observe(composer, { childList: true, subtree: true, characterData: true })
      }
      if (composer) stats.ensure()
      panelBack.update()
    }
    // Discover mount/replacement only; token text and style changes are ignored.
    const mounts = new MutationObserver(records => {
      if (records.some(record => !(record.target instanceof Element)
        || record.target.closest('[class*="_composerStack"], [data-mobile-workbench="navigation"], [class*="_messageList"]') === null)) schedule()
    })
    mounts.observe(document.body, { childList: true, subtree: true })
    refresh()
    return () => {
      mounts.disconnect()
      composerObserver.disconnect()
      sidebarObserver.disconnect()
      if (raf !== undefined) window.cancelAnimationFrame(raf)
      stats.dispose()
      panelBack.dispose()
      frame?.removeAttribute('data-mobile-nav')
    }
  })
}
