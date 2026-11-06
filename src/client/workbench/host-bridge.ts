import { sessionsPageOpen } from '../workbench/sidebar-page.ts'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import { getFrame } from '../effects/phone-chrome.ts'
import { HOST_FILES_CLOSER, HOST_FILES_OPENER, openFilesPanel } from '../components/open-files-panel.ts'
import type { NavigationEvidence, WorkbenchDestination, WorkbenchView } from './navigation.ts'

export interface HostView { id: string; label: string }

/** Native navigation actions and evidence; host nodes stay in their React-owned parents. */
export function createHostBridge(
  viewTabs: () => readonly HostView[],
  agentCounts: () => Pick<NavigationEvidence, 'agentActiveCount' | 'agentTotalCount' | 'agentCountsState'> = () => ({}),
  closeDrawer: () => void = () => {},
  openSessions: () => void = () => {},
  conversation: { show: () => void; hasSession: () => boolean; parentId?: () => SessionId | undefined; openSession?: (id: SessionId) => void } = { show: () => {}, hasSession: () => true },
) {
  let pendingFrame: number | undefined
  let focusObserver: MutationObserver | undefined
  let viewObserver: MutationObserver | undefined
  const ownedTrigger = (): HTMLButtonElement | null => document.querySelector('[data-mobile-workbench="agents"]')
  const focusAgents = (): void => {
    focusObserver?.disconnect()
    const focus = (): boolean => {
      const item = document.querySelector<HTMLElement>('[role="tree"][class*="_menuBody"] [role="treeitem"]:not([aria-disabled="true"])')
      if (!item) return false
      item.focus({ preventScroll: true })
      focusObserver?.disconnect()
      return true
    }
    if (focus()) return
    focusObserver = new MutationObserver(() => { focus() })
    focusObserver.observe(document.body, { childList: true, subtree: true })
  }
  const clear = (): void => {
    if (pendingFrame !== undefined) window.cancelAnimationFrame(pendingFrame)
    pendingFrame = undefined
    focusObserver?.disconnect()
    viewObserver?.disconnect()
  }
  const header = (): HTMLElement | null => getFrame()?.querySelector('header:has([role="tablist"]), header:has(button[aria-haspopup="tree"])') ?? null
  const tabs = (): HTMLButtonElement[] => Array.from(header()?.querySelectorAll<HTMLButtonElement>('[data-conversation-tabs] > button[role="tab"]') ?? [])
  const agentTrigger = (): HTMLButtonElement | null => {
    const buttons = Array.from(header()?.querySelectorAll<HTMLButtonElement>('button[aria-haspopup="tree"]:not([class*="_switcherTrigger"]):not([data-mobile-workbench="agents"])') ?? [])
    // Own count only; switchers are rooted at the parent and include siblings.
    return buttons.at(-1) ?? null
  }
  const officialFilesOpen = (): boolean => {
    // Fullscreen panels keep the grid track collapsed even while visibly open.
    // The panel's own open marker is authoritative; its closer stays mounted.
    return document.querySelector('[data-sidebar-right-panel][data-sidebar-right-open]:not([data-sidebar-right-open="false"])') !== null
  }
  const filesOpen = officialFilesOpen
  const evidence = (): NavigationEvidence => {
    const views = viewTabs()
    const ids = views.map(view => view.id)
    const buttons = tabs()
    const selected = buttons.find(button => button.getAttribute('aria-selected') === 'true')
    const selectedViews = views.filter(view => view.label === selected?.textContent?.trim())
    const folded = views.filter(view => !buttons.some(button => button.textContent?.trim() === view.label))
    const selectedView = selectedViews.length === 1 ? selectedViews[0]?.id
      : header()?.querySelector('[class*="_viewsMoreActive"]') && folded.length === 1 ? folded[0]?.id : undefined
    const trigger = agentTrigger()
    return {
      sessionsOpen: getFrame() !== null && sessionsPageOpen(getFrame()),
      hasSessions: getFrame() !== null,
      hasSessionPage: getFrame() !== null,
      hasParent: conversation.parentId?.() !== undefined,
      selectedView,
      filesOpen: filesOpen(),
      agentsOpen: trigger?.getAttribute('aria-expanded') === 'true',
      hasChat: ids.includes('chat') || !conversation.hasSession(),
      hasTrajectory: conversation.hasSession() && ids.includes('trajectory'),
      ...agentCounts(),
      hasAgents: trigger !== null,
      hasFiles: getFrame()?.querySelector(`${HOST_FILES_OPENER}, ${HOST_FILES_CLOSER}`) != null,
    }
  }
  const closeFiles = (): void => {
    if (officialFilesOpen()) document.querySelector<HTMLButtonElement>(HOST_FILES_CLOSER)?.click()
  }
  const closeAgents = (restoreFocus = true): void => {
    focusObserver?.disconnect()
    if (agentTrigger()?.getAttribute('aria-expanded') !== 'true') return
    const previous = document.activeElement
    document.querySelector('[role="tree"][class*="_menuBody"]')?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    if (restoreFocus) ownedTrigger()?.focus({ preventScroll: true })
    else if (previous instanceof HTMLElement) previous.focus({ preventScroll: true })
  }
  const selectView = (view: WorkbenchView): void => {
    viewObserver?.disconnect()
    const target = viewTabs().find(entry => entry.id === view)
    if (!target || viewTabs().filter(entry => entry.label === target.label).length !== 1) return
    const direct = tabs().filter(button => button.textContent?.trim() === target.label)
    if (direct.length === 1) { direct[0]?.click(); return }
    const more = header()?.querySelector<HTMLButtonElement>('[class*="_tabs"]:has(> [data-conversation-tabs]) button[aria-haspopup="menu"]')
    if (!more) return
    const choose = (): boolean => {
      const rows = Array.from(document.querySelectorAll<HTMLElement>('[role="menu"] [role="menuitem"]'))
        .filter(row => row.textContent?.trim() === target.label)
      if (rows.length !== 1) return false
      viewObserver?.disconnect()
      rows[0]?.click()
      return true
    }
    if (more.getAttribute('aria-expanded') !== 'true') more.click()
    if (choose()) return
    viewObserver = new MutationObserver(() => {
      if (!choose() && more.getAttribute('aria-expanded') !== 'true') viewObserver?.disconnect()
    })
    viewObserver.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-expanded'] })
  }
  const returnParent = (): void => {
    const id = conversation.parentId?.()
    if (id) conversation.openSession?.(id)
  }
  const activate = (destination: WorkbenchDestination, pointerStartedOpen = false): void => {
    clear()
    if (destination === 'sessions') {
      closeAgents()
      closeFiles()
      openSessions()
      return
    }
    closeDrawer()
    if (destination === 'agents') {
      const trigger = agentTrigger()
      if (pointerStartedOpen || trigger?.getAttribute('aria-expanded') === 'true') closeAgents()
      // The rc.2 own-count click pins the catalog and cancels hover-close timers.
      else trigger?.click()
      return
    }
    conversation.show()
    const enter = (): void => {
      if (destination === 'files') {
        closeAgents()
        if (!filesOpen()) openFilesPanel()
        return
      }
      closeFiles()
      closeAgents()
      // The session page preserves the native chat/trajectory view.
    }
    // A global panel unmounts the header; let the native Conversation remount once.
    if (destination === 'session' || header()) enter()
    else pendingFrame = window.requestAnimationFrame(() => { pendingFrame = undefined; enter() })
  }
  return { evidence, activate, selectView, returnParent, closeAgents, focusAgents, clear }
}
