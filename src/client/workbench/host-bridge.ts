import { getFrame } from '../effects/phone-chrome.ts'
import { HOST_FILES_CLOSER, HOST_FILES_OPENER, openFilesPanel } from '../components/open-files-panel.ts'
import { viewIndex, type NavigationEvidence, type WorkbenchDestination } from './navigation.ts'

/** All rc.2 DOM access stays here; host nodes remain in their React-owned parents. */
export function createHostBridge(viewIds: () => readonly string[]) {
  const header = (): HTMLElement | null => getFrame()?.querySelector('header:has([role="tablist"]), header:has(button[aria-haspopup="tree"])') ?? null
  const tabs = (): HTMLButtonElement[] => Array.from(header()?.querySelectorAll<HTMLButtonElement>('[role="tablist"] > button[role="tab"]') ?? [])
  const agentTrigger = (): HTMLButtonElement | null => {
    const buttons = Array.from(header()?.querySelectorAll<HTMLButtonElement>('button[aria-haspopup="tree"]') ?? [])
    // Prefer the current-session count/switcher over an ancestor's return title.
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
      selectedView: ids.length === buttons.length ? ids[selected] : undefined,
      filesOpen: filesOpen(),
      agentsOpen: trigger?.getAttribute('aria-expanded') === 'true',
      hasChat: viewIndex(ids, 'chat', buttons.length) >= 0,
      hasTrajectory: viewIndex(ids, 'trajectory', buttons.length) >= 0,
      agentCount: Number(trigger?.getAttribute('aria-label')?.match(/^(\d+)\s+(?:个子智能体|subagents?)/i)?.[1] ?? 0),
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
  const activate = (destination: WorkbenchDestination): void => {
    if (destination === 'files') {
      closeAgents()
      if (!filesOpen()) openFilesPanel()
      return
    }
    closeFiles()
    if (destination === 'agents') {
      const trigger = agentTrigger()
      if (trigger?.getAttribute('aria-expanded') === 'true') closeAgents()
      else trigger?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
      return
    }
    closeAgents()
    const buttons = tabs()
    buttons[viewIndex(viewIds(), destination, buttons.length)]?.click()
  }
  return { evidence, activate }
}
