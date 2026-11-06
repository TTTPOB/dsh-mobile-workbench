/** Native column identity remains stable when AppFrame inserts a drawer mask. */
export const SIDEBAR_COLUMN = ':scope > [class*="_sidebarCol"]'
export const SESSIONS_PAGE = 'data-mobile-workbench-sessions'

/** Read only the workbench page selection, not the native drawer state. */
export function sessionsPageOpen(frame: Element | null): boolean {
  return frame?.hasAttribute(SESSIONS_PAGE) === true
}

/** Toggle the retained sidebar page without opening the native modal drawer. */
export function toggleSessionsPage(frame: Element | null): void {
  frame?.toggleAttribute(SESSIONS_PAGE)
}

/** Keep the native drawer closed and reapply page focusability after React commits. */
export function createSidebarPage(frame: HTMLElement, toggleNative: () => void, panelOpen: () => boolean): { sync: () => void; dispose: () => void } {
  const wasOpen = !frame.hasAttribute('data-sidebar-collapsed')
  frame.toggleAttribute(SESSIONS_PAGE, wasOpen)
  let observedColumn: HTMLElement | null | undefined
  const background = new Map<HTMLElement, boolean>()
  let previousPage: boolean | undefined
  const observer = new MutationObserver(() => { sync() })
  const sync = (): void => {
    if (!frame.hasAttribute('data-sidebar-collapsed')) toggleNative()
    const column = frame.querySelector<HTMLElement>(SIDEBAR_COLUMN)
    if (column !== observedColumn) {
      observer.disconnect()
      observer.observe(frame, { childList: true, attributes: true,
        attributeFilter: ['data-sidebar-collapsed', 'data-sidebar-drawer', SESSIONS_PAGE] })
      if (column) observer.observe(column, { attributes: true, attributeFilter: ['inert'] })
      observedColumn = column
    }
    const open = sessionsPageOpen(frame)
    for (const element of frame.querySelectorAll<HTMLElement>(':scope > [class*="_centerCol"], :scope > [data-rightbar-col], :scope > [data-shell-bottom], :scope > [data-shell-leading]')) {
      if (!background.has(element)) background.set(element, element.inert)
      if (previousPage !== open || open) element.inert = open && !(panelOpen() && element.matches('[class*="_centerCol"]'))
    }
    previousPage = open
    if (column) {
      const inert = !open
      if (column.inert !== inert) column.inert = inert
    }
  }
  sync()
  return {
    sync,
    dispose: () => {
      observer.disconnect()
      for (const [element, inert] of background) element.inert = inert
      background.clear()
      frame.removeAttribute(SESSIONS_PAGE)
      const column = frame.querySelector<HTMLElement>(SIDEBAR_COLUMN)
      if (column) column.inert = frame.hasAttribute('data-sidebar-drawer') && frame.hasAttribute('data-sidebar-collapsed')
      if (wasOpen && frame.hasAttribute('data-sidebar-collapsed')) toggleNative()
    },
  }
}
