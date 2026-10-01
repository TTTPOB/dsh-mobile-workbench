import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import { MOBILE_QUERY } from '../effects/phone-chrome.ts'
import { WORKBENCH_CSS } from '../styles/workbench.css.ts'
import { WORKBENCH_HEADER_CSS } from '../styles/workbench-header.css.ts'
import { WORKBENCH_TRAJECTORY_CSS } from '../styles/workbench-trajectory.css.ts'
import { createWorkbenchPresentation } from './presentation.ts'
import { createHostBridge } from './host-bridge.ts'
import { WorkbenchNav, type WorkbenchSnapshot } from './WorkbenchNav.tsx'
import { WORKBENCH_NS, en, zh } from './locales.ts'

/** Install reversible mobile navigation using the official shell overlay slot. */
export function installWorkbench(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(WORKBENCH_NS, { zh, en }), 'mobile-workbench: dictionaries')
  ctx.effect(() => {
    const tag = document.createElement('style')
    tag.dataset.pluginCss = 'dsh-web-mobile/workbench.css'
    tag.textContent = WORKBENCH_CSS + WORKBENCH_HEADER_CSS + WORKBENCH_TRAJECTORY_CSS
    document.head.appendChild(tag)
    return () => { tag.remove() }
  }, 'mobile-workbench: styles')

  const mq = window.matchMedia(MOBILE_QUERY)
  const viewIds = (): string[] => ctx.slots.entriesOfSlot('conversation.view')
    .filter(entry => entry.options.label !== undefined)
    .map(entry => entry.options.id ?? '')
  const bridge = createHostBridge(viewIds)
  const presentation = createWorkbenchPresentation()
  let snapshot: WorkbenchSnapshot = { ...bridge.evidence(), mobile: mq.matches }
  const listeners = new Set<() => void>()
  const source = {
    getSnapshot: (): WorkbenchSnapshot => snapshot,
    subscribe: (listener: () => void): (() => void) => {
      listeners.add(listener)
      return () => { listeners.delete(listener) }
    },
  }
  ctx.effect(() => {
    let raf: number | undefined
    const refresh = (): void => {
      raf = undefined
      if (mq.matches) presentation.update(viewIds())
      else presentation.clear()
      const next = mq.matches
        ? { ...bridge.evidence(), mobile: true }
        : { ...snapshot, mobile: false }
      if (JSON.stringify(next) !== JSON.stringify(snapshot)) {
        snapshot = next
        for (const listener of listeners) listener()
      }
      if (mq.matches && document.querySelector('[data-mobile-workbench="navigation"]') !== null) {
        document.documentElement.setAttribute('data-mobile-workbench-active', 'true')
      }
      else document.documentElement.removeAttribute('data-mobile-workbench-active')
    }
    const schedule = (): void => {
      if (raf === undefined) raf = window.requestAnimationFrame(refresh)
    }
    const observer = new MutationObserver(records => {
      // React updates in our own nav must not feed back into the observer.
      if (records.some(record => !(record.target instanceof Element)
        || record.target.closest('[data-mobile-workbench="navigation"]') === null)) schedule()
    })
    observer.observe(document.documentElement, {
      childList: true, subtree: true, characterData: true, attributes: true,
      attributeFilter: ['aria-label', 'aria-selected', 'aria-expanded', 'data-aionui-explorer-open', 'data-aionui-preview-open', 'data-rightbar-collapsed', 'data-sidebar-right-open'],
    })
    const stopViews = ctx.slots.subscribe('conversation.view', schedule)
    mq.addEventListener('change', schedule)
    refresh()
    return () => {
      observer.disconnect()
      stopViews()
      mq.removeEventListener('change', schedule)
      if (raf !== undefined) window.cancelAnimationFrame(raf)
      document.documentElement.removeAttribute('data-mobile-workbench-active')
      presentation.clear()
      listeners.clear()
    }
  }, 'mobile-workbench: host navigation evidence')
  ctx.slots.inject('shell.overlay', () => ctx.slots.register({
    name: 'shell.overlay',
    id: 'mobile-workbench-navigation',
    order: 20,
    locale: WORKBENCH_NS,
    inject: () => ({ hooks: { workbench: source }, activate: bridge.activate }),
  }, WorkbenchNav))
}
