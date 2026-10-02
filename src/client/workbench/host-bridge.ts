import { getFrame } from '../effects/phone-chrome.ts'
import { HOST_FILES_CLOSER, HOST_FILES_OPENER, openFilesPanel } from '../components/open-files-panel.ts'
import { viewIndex, type NavigationEvidence, type WorkbenchDestination, type WorkbenchView } from './navigation.ts'

/** All rc.2 DOM access stays here; host nodes remain in their React-owned parents. */
export function createHostBridge(
  viewIds: () => readonly string[],
  agentCounts: () => Pick<NavigationEvidence, 'agentActiveCount' | 'agentTotalCount' | 'agentCountsState'> = () => ({}),
  closeDrawer: () => void = () => {},
  openSessions: () => void = () => {},
  conversation: { show: () => void; hasSession: () => boolean } = { show: () => {}, hasSession: () => true },
) {
  let pendingFrame: number | undefined
  const clear = (): void => {
    if (pendingFrame !== undefined) window.cancelAnimationFrame(pendingFrame)
    pendingFrame = undefined
  }
  const header = (): HTMLElement | null => getFrame()?.querySelector('header:has([role="tablist"]), header:has(button[aria-haspopup="tree"])') ?? null
  const tabs = (): HTMLButtonElement[] => Array.from(header()?.querySelectorAll<HTMLButtonElement>('[role="tablist"] > button[role="tab"]') ?? [])
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
  const filesOpen = (): boolean => officialFilesOpen()
    || getFrame()?.hasAttribute('data-aionui-explorer-open') === true
    || getFrame()?.hasAttribute('data-aionui-preview-open') === true
  const evidence = (): NavigationEvidence => {
    const ids = viewIds()
    const buttons = tabs()
    const selected = buttons.findIndex(button => button.getAttribute('aria-selected') === 'true')
    const trigger = agentTrigger()
    return {
      sessionsOpen: getFrame() !== null && getFrame()?.hasAttribute('data-sidebar-collapsed') === false,
      hasSessions: getFrame() !== null,
      hasSessionPage: getFrame() !== null,
      hasParent: header()?.querySelector('[data-workbench-parent]') != null,
      selectedView: ids.length === buttons.length ? ids[selected] : undefined,
      filesOpen: filesOpen(),
      agentsOpen: trigger?.getAttribute('aria-expanded') === 'true',
      hasChat: ids.includes('chat') || !conversation.hasSession(),
      hasTrajectory: conversation.hasSession() && ids.includes('trajectory'),
      ...agentCounts(),
      hasAgents: trigger !== null,
      hasFiles: document.querySelector(`${HOST_FILES_OPENER}, ${HOST_FILES_CLOSER}, [data-aionui-explorer-col]`) !== null,
    }
  }
  const closeFiles = (): void => {
    if (officialFilesOpen()) document.querySelector<HTMLButtonElement>(HOST_FILES_CLOSER)?.click()
    getFrame()?.removeAttribute('data-aionui-explorer-open')
    getFrame()?.removeAttribute('data-aionui-preview-open')
  }
  const closeAgents = (): void => {
    if (agentTrigger()?.getAttribute('aria-expanded') !== 'true') return
    // Official catalog Escape handling owns close and focus restoration.
    document.querySelector('[role="tree"][class*="_menuBody"]')?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
  }
  const selectView = (view: WorkbenchView): void => {
    const buttons = tabs()
    buttons[viewIndex(viewIds(), view, buttons.length)]?.click()
  }
  const returnParent = (): void => {
    header()?.querySelector<HTMLButtonElement>('[data-workbench-parent]')?.click()
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
      else trigger?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
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
  return { evidence, activate, selectView, returnParent, clear }
}
