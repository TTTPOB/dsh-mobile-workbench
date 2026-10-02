import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import { panelSelectorOf } from '../core/layout-compat.ts'
import { currentSessionIdOf } from '../core/sessions-compat.ts'
import { getFrame, MOBILE_QUERY, toggleDrawer } from '../effects/phone-chrome.ts'
import { WORKBENCH_CSS } from '../styles/workbench.css.ts'
import { WORKBENCH_HEADER_CSS } from '../styles/workbench-header.css.ts'
import { WORKBENCH_TRAJECTORY_CSS } from '../styles/workbench-trajectory.css.ts'
import { createWorkbenchPresentation } from './presentation.ts'
import { createHostBridge } from './host-bridge.ts'
import { subagentCounts, type AgentStatusSource } from './agent-counts.ts'
import { WorkbenchAgents, WorkbenchNav, type WorkbenchSnapshot } from './WorkbenchNav.tsx'
import { WORKBENCH_NS, en, zh } from './locales.ts'
import { installWorkbenchSessionMenu } from './session-menu.ts'
import { installWorkbenchUpdateNotice } from './update-notice.tsx'

/** Install reversible mobile navigation using the official shell overlay slot. */
export function installWorkbench(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(WORKBENCH_NS, { zh, en }), 'mobile-workbench: dictionaries')
  installWorkbenchSessionMenu(ctx)
  installWorkbenchUpdateNotice(ctx)
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
  const statusSource = (): AgentStatusSource | undefined =>
    (ctx.get('uiSession') as { sessionStatus?: AgentStatusSource } | undefined)?.sessionStatus
  const bridge = createHostBridge(viewIds, () => subagentCounts(
    ctx.sessions.list.getSnapshot(), statusSource()?.getSnapshot(),
  ) ?? {}, () => {
    const frame = getFrame()
    if (frame && !frame.hasAttribute('data-sidebar-collapsed')) toggleDrawer(ctx)
  }, () => {
    const frame = getFrame()
    if (frame?.hasAttribute('data-sidebar-collapsed')) toggleDrawer(ctx)
  }, {
    show: panelSelectorOf(ctx.layout) ?? (() => {}),
    hasSession: () => currentSessionIdOf(ctx.sessions.list.getSnapshot()) !== undefined,
  })
  const presentation = createWorkbenchPresentation(pointerStartedOpen => {
    if (!bridge.evidence().hasAgents) return false
    bridge.activate('agents', pointerStartedOpen)
    return true
  })
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
      attributeFilter: ['data-sidebar-collapsed', 'aria-label', 'aria-selected', 'aria-expanded', 'data-aionui-explorer-open', 'data-aionui-preview-open', 'data-rightbar-collapsed', 'data-sidebar-right-open'],
    })
    const stopViews = ctx.slots.subscribe('conversation.view', schedule)
    const stopSessions = ctx.sessions.list.subscribe(schedule)
    const stopStatus = statusSource()?.subscribe(schedule)
    mq.addEventListener('change', schedule)
    refresh()
    return () => {
      observer.disconnect()
      stopViews()
      stopSessions()
      stopStatus?.()
      bridge.clear()
      mq.removeEventListener('change', schedule)
      if (raf !== undefined) window.cancelAnimationFrame(raf)
      document.documentElement.removeAttribute('data-mobile-workbench-active')
      presentation.clear()
      listeners.clear()
    }
  }, 'mobile-workbench: host navigation evidence')
  ctx.slots.inject('conversation.session.header.actions', () => ctx.slots.register({
    name: 'conversation.session.header.actions',
    id: 'mobile-workbench-agents',
    order: 5,
    locale: WORKBENCH_NS,
    inject: () => ({ hooks: { workbench: source }, activate: bridge.activate, openInfo: presentation.openInfo }),
  }, WorkbenchAgents))
  ctx.slots.inject('shell.overlay', () => ctx.slots.register({
    name: 'shell.overlay',
    id: 'mobile-workbench-navigation',
    order: 20,
    locale: WORKBENCH_NS,
    inject: () => ({ hooks: { workbench: source }, activate: bridge.activate, openInfo: presentation.openInfo }),
  }, WorkbenchNav))
}
