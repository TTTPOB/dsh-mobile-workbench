import type { Context as ClientContext } from '@deepseek-ai/cordis'
import { findFrame, installMobileEffect } from './phone-chrome.ts'
import { createPanelBack } from './panel-back.ts'
import { createSidebarPage } from '../workbench/sidebar-page.ts'

/** Mark the native frame without observing its streamed content. */
export function installWorkbenchDecoration(ctx: ClientContext): void {
  installMobileEffect(ctx, 'mobile-workbench: frame decoration and panel Back', () => {
    const panelBack = createPanelBack(ctx.layout)
    let frame: HTMLElement | null = null
    let page: ReturnType<typeof createSidebarPage> | undefined
    const refresh = (): void => {
      const next = findFrame()
      if (next === frame) return
      page?.dispose()
      frame?.removeAttribute('data-mobile-nav')
      frame = next
      frame?.setAttribute('data-mobile-nav', 'frame')
      page = frame ? createSidebarPage(frame, () => { ctx.layout.toggleSidebar() }) : undefined
      mounts.disconnect()
      if (frame?.parentElement) mounts.observe(frame.parentElement, { childList: true })
      else mounts.observe(document.body, { childList: true, subtree: true })
    }
    const mounts = new MutationObserver(refresh)
    mounts.observe(document.body, { childList: true, subtree: true })
    refresh()
    return () => {
      mounts.disconnect()
      page?.dispose()
      panelBack.dispose()
      frame?.removeAttribute('data-mobile-nav')
    }
  })
}
