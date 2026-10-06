import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import { panelSelectorOf } from '../core/layout-compat.ts'
import { currentSessionIdOf } from '../core/sessions-compat.ts'
import { getFrame, MOBILE_QUERY, toggleDrawer } from '../effects/phone-chrome.ts'
import { WORKBENCH_CSS } from '../styles/workbench.css.ts'
import { WORKBENCH_HEADER_CSS } from '../styles/workbench-header.css.ts'
import { WORKBENCH_TRAJECTORY_CSS } from '../styles/workbench-trajectory.css.ts'
import { resolveDestination } from './navigation.ts'
import { boundaryMutation, NAVIGATION_BOUNDARY, PRESENTATION_BOUNDARY, PRESENTATION_LOCAL } from './dom-observation.ts'
import { installAgentCatalogLoader } from './agent-catalog-loader.ts'
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
  const catalogs = ctx.sessions as typeof ctx.sessions & { refreshProjections?: (id: string) => Promise<void> }
  ctx.effect(() => {
    if (catalogs.refreshProjections === undefined) return () => {}
    const loader = installAgentCatalogLoader(ctx.sessions.list, catalogs.refreshProjections.bind(catalogs), () => mq.matches)
    mq.addEventListener('change', loader.update)
    return () => { mq.removeEventListener('change', loader.update); loader.dispose() }
  }, 'mobile-workbench: reachable catalog baselines')
  const statusSource = (): AgentStatusSource | undefined =>
    (ctx.get('uiSession') as { sessionStatus?: AgentStatusSource } | undefined)?.sessionStatus
  let counts = subagentCounts(ctx.sessions.list.getSnapshot(), statusSource()?.getSnapshot()) ?? {}
  const bridge = createHostBridge(viewIds, () => counts, () => {
    const frame = getFrame()
    if (frame && !frame.hasAttribute('data-sidebar-collapsed')) toggleDrawer(ctx)
  }, () => {
    const frame = getFrame()
    if (frame?.hasAttribute('data-sidebar-collapsed')) toggleDrawer(ctx)
  }, {
    show: panelSelectorOf(ctx.layout) ?? (() => {}),
    hasSession: () => currentSessionIdOf(ctx.sessions.list.getSnapshot()) !== undefined,
  })
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
    let presentationDirty = true
    const refresh = (): void => {
      raf = undefined
      if (presentationDirty || !mq.matches) {
        const frame = mq.matches ? getFrame() : null
        if (frame) presentation.update(viewIds(), frame)
        else presentation.clear()
      }
      presentationDirty = false
      const next = mq.matches
        ? { ...bridge.evidence(), mobile: true }
        : { ...snapshot, mobile: false }
      if ([...Object.keys(snapshot), ...Object.keys(next)].some(key => next[key as keyof WorkbenchSnapshot] !== snapshot[key as keyof WorkbenchSnapshot])) {
        snapshot = next
        for (const listener of listeners) listener()
      }
      if (mq.matches && document.querySelector('[data-mobile-workbench="navigation"]') !== null) {
        document.documentElement.setAttribute('data-mobile-workbench-active', 'true')
        document.documentElement.setAttribute('data-mobile-workbench-page', resolveDestination(next))
      }
      else {
        document.documentElement.removeAttribute('data-mobile-workbench-active')
        document.documentElement.removeAttribute('data-mobile-workbench-page')
      }
    }
    const schedule = (): void => {
      if (raf === undefined) raf = window.requestAnimationFrame(refresh)
    }
    const observer = new MutationObserver(records => {
      if (!mq.matches) return
      const changedPresentation = records.some(record => boundaryMutation(record, PRESENTATION_BOUNDARY, PRESENTATION_LOCAL))
      presentationDirty ||= changedPresentation
      if (changedPresentation || records.some(record => boundaryMutation(record, NAVIGATION_BOUNDARY)
        || (record.type === 'attributes' && record.target === getFrame()))) schedule()
    })
    observer.observe(document.body, {
      childList: true, subtree: true, characterData: true, attributes: true,
      attributeFilter: ['data-sidebar-collapsed', 'aria-label', 'aria-selected', 'aria-expanded', 'data-rightbar-collapsed', 'data-sidebar-right-open', 'data-selected', 'data-trajectory-row-key'],
    })
    const refreshPresentation = (): void => { presentationDirty = true; schedule() }
    const refreshCounts = (): void => {
      counts = subagentCounts(ctx.sessions.list.getSnapshot(), statusSource()?.getSnapshot()) ?? {}
      schedule()
    }
    const stopViews = ctx.slots.subscribe('conversation.view', refreshPresentation)
    const stopSessions = ctx.sessions.list.subscribe(refreshCounts)
    const stopStatus = statusSource()?.subscribe(refreshCounts)
    mq.addEventListener('change', refreshPresentation)
    refresh()
    return () => {
      observer.disconnect()
      stopViews()
      stopSessions()
      stopStatus?.()
      bridge.clear()
      mq.removeEventListener('change', refreshPresentation)
      if (raf !== undefined) window.cancelAnimationFrame(raf)
      document.documentElement.removeAttribute('data-mobile-workbench-active')
      document.documentElement.removeAttribute('data-mobile-workbench-page')
      presentation.clear()
      listeners.clear()
    }
  }, 'mobile-workbench: host navigation evidence')
  ctx.slots.inject('conversation.session.header.actions', () => ctx.slots.register({
    name: 'conversation.session.header.actions',
    id: 'mobile-workbench-agents',
    order: 5,
    locale: WORKBENCH_NS,
    inject: () => ({ hooks: { workbench: source }, activate: bridge.activate, selectView: bridge.selectView, returnParent: bridge.returnParent }),
  }, WorkbenchAgents))
  ctx.slots.inject('shell.overlay', () => ctx.slots.register({
    name: 'shell.overlay',
    id: 'mobile-workbench-navigation',
    order: 20,
    locale: WORKBENCH_NS,
    inject: () => ({ hooks: { workbench: source }, activate: bridge.activate, selectView: bridge.selectView, returnParent: bridge.returnParent }),
  }, WorkbenchNav))
}
