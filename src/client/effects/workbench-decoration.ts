import type { Context as ClientContext } from '@deepseek-ai/cordis'
import { findFrame, installMobileEffect } from './phone-chrome.ts'
import { createPanelBack } from './panel-back.ts'

/** Mark the native frame without observing its streamed content. */
export function installWorkbenchDecoration(ctx: ClientContext): void {
  installMobileEffect(ctx, 'mobile-workbench: frame decoration and panel Back', () => {
    const panelBack = createPanelBack(ctx.layout)
    let frame: HTMLElement | null = null
    const refresh = (): void => {
      const next = findFrame()
      if (next === frame) return
      frame?.removeAttribute('data-mobile-nav')
      frame = next
      frame?.setAttribute('data-mobile-nav', 'frame')
      mounts.disconnect()
      if (frame?.parentElement) mounts.observe(frame.parentElement, { childList: true })
      else mounts.observe(document.body, { childList: true, subtree: true })
    }
    const mounts = new MutationObserver(refresh)
    mounts.observe(document.body, { childList: true, subtree: true })
    refresh()
    return () => {
      mounts.disconnect()
      panelBack.dispose()
      frame?.removeAttribute('data-mobile-nav')
    }
  })
}
