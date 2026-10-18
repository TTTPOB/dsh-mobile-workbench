/** Mark presentation boundaries without moving React-owned elements. */
export function createWorkbenchPresentation(): { update: (viewIds: readonly string[], scope?: ParentNode) => void; clear: () => void } {
  let marked = new Map<Element, Set<string>>()
  const menuHeadings = new Map<Element, { element: HTMLElement; name: HTMLElement; mode: HTMLElement }>()
  let selectedPane: HTMLElement | null = null
  let selectedRowKey: string | null = null
  const clear = (): void => {
    for (const [element, attributes] of marked) {
      for (const attribute of attributes) element.removeAttribute(attribute)
    }
    marked.clear()
    for (const heading of menuHeadings.values()) heading.element.remove()
    menuHeadings.clear()
    selectedPane = null
    selectedRowKey = null
  }
  const update = (viewIds: readonly string[], scope: ParentNode = document): void => {
    const next = new Map<Element, Set<string>>()
    const mark = (element: Element | null, attribute: string): void => {
      if (!element) return
      if (!element.hasAttribute(attribute)) element.setAttribute(attribute, '')
      const attributes = next.get(element) ?? new Set<string>()
      attributes.add(attribute)
      next.set(element, attributes)
    }
    const header = scope.querySelector('header:has([data-conversation-tabs])')
    mark(header, 'data-mobile-workbench-header')
    // Extra third-party views keep their native tab strip available.
    if (viewIds.length === 2 && viewIds.includes('chat') && viewIds.includes('trajectory')) {
      mark(header, 'data-workbench-tabs-owned')
    }
    const trajectory = scope.querySelector<HTMLElement>('[data-trajectory-scroll]')
    mark(trajectory?.parentElement?.parentElement ?? null, 'data-workbench-trajectory')
    const inspecting = trajectory?.parentElement?.querySelector('aside[class*="_details"]')
    if (!trajectory || !inspecting) {
      selectedPane = null
      selectedRowKey = null
    } else {
      const row = trajectory.querySelector<HTMLElement>('tr[data-selected="true"][data-trajectory-row-key]')
      const key = row?.getAttribute('data-trajectory-row-key') ?? null
      if (row && key !== null && (selectedPane !== trajectory || selectedRowKey !== key)) {
        selectedPane = trajectory
        selectedRowKey = key
        // Only selection changes reveal the row; later stream updates and user scrolls win.
        const paneRect = trajectory.getBoundingClientRect()
        const rowRect = row.getBoundingClientRect()
        const headHeight = trajectory.querySelector('thead')?.getBoundingClientRect().height ?? 0
        const top = paneRect.top + trajectory.clientTop + headHeight
        const bottom = paneRect.top + trajectory.clientTop + trajectory.clientHeight
        const delta = rowRect.top < top ? rowRect.top - top
          : rowRect.bottom > bottom ? rowRect.bottom - bottom : 0
        if (delta !== 0) trajectory.scrollTop += delta
      }
    }
    const count = header?.querySelector('[data-slot="conversation.session.header.actions"] button[aria-haspopup="tree"]:not([class*="_switcherTrigger"]):not([data-mobile-workbench="agents"])')
    mark(count?.parentElement ?? null, 'data-workbench-agent-count')
    const menus = new Set<Element>()
    for (const tree of document.querySelectorAll('[role="tree"][class*="_menuBody"]')) {
      const menu = tree.parentElement
      if (!menu) continue
      menus.add(menu)
      mark(menu, 'data-workbench-agent-menu')
      if (!menuHeadings.has(menu)) {
        const element = document.createElement('div')
        element.setAttribute('data-workbench-agent-heading', '')
        const name = document.createElement('h2')
        const mode = document.createElement('p')
        element.append(name, mode)
        menu.prepend(element)
        menuHeadings.set(menu, { element, name, mode })
      }
      const heading = menuHeadings.get(menu)!
      const name = header?.querySelector('[data-workbench-title-info]')?.textContent ?? ''
      const mode = header?.querySelector('[data-workbench-mode]')?.textContent ?? ''
      if (heading.name.textContent !== name) heading.name.textContent = name
      if (heading.mode.textContent !== mode) heading.mode.textContent = mode
    }
    for (const [menu, heading] of menuHeadings) {
      if (!menus.has(menu)) { heading.element.remove(); menuHeadings.delete(menu) }
    }
    for (const [element, attributes] of marked) {
      for (const attribute of attributes) {
        if (!next.get(element)?.has(attribute)) element.removeAttribute(attribute)
      }
    }
    marked = next
  }
  return { update, clear }
}
