/** Condense secondary metrics; the native button still opens every detail. */
export function workbenchStatLabel(label: string): string | null {
  const turn = label.match(/^(\d+)\s*轮\s*(\d+)\s*步/)
  if (turn) return turn[1] + ' 轮 · ' + turn[2] + ' 步'
  const tokens = label.match(/^([\d.,]+[KMB]?)\s+tok(?:\s|$)/i)
  return tokens ? tokens[1] + ' tok' : null
}

/** Mark presentation boundaries without moving React-owned elements. */
export function createWorkbenchPresentation(openCatalog: (pointerStartedOpen: boolean) => boolean = () => false): { update: (viewIds: readonly string[]) => void; clear: () => void; openInfo: (pointerStartedOpen?: boolean) => void } {
  let openInfo: (pointerStartedOpen?: boolean) => void = () => {}
  let marked = new Map<Element, Set<string>>()
  const menuHeadings = new Map<Element, { element: HTMLElement; name: HTMLElement; mode: HTMLElement }>()
  let selectedPane: HTMLElement | null = null
  let selectedRowKey: string | null = null
  let title: HTMLElement | null = null
  let releaseTitle: (() => void) | undefined
  const bindTitle = (next: HTMLElement | null): void => {
    if (next === title) return
    releaseTitle?.()
    title = next
    releaseTitle = undefined
    openInfo = () => {}
    if (!next) return
    const original = ['role', 'tabindex', 'aria-label'].map(key => [key, next.getAttribute(key)] as const)
    next.setAttribute('role', 'button')
    next.setAttribute('tabindex', '0')
    next.setAttribute('aria-label', '查看会话信息')
    let dialog: HTMLDialogElement | null = null
    const close = (): void => { dialog?.remove(); dialog = null }
    const open = (pointerStartedOpen = false): void => {
      if (openCatalog(pointerStartedOpen)) return
      close()
      dialog = document.createElement('dialog')
      dialog.setAttribute('data-workbench-title-dialog', '')
      dialog.setAttribute('aria-modal', 'true')
      dialog.setAttribute('aria-label', '会话信息')
      const heading = document.createElement('h2')
      heading.textContent = '会话信息'
      const name = document.createElement('p')
      name.textContent = next.textContent
      const mode = document.createElement('p')
      mode.setAttribute('data-workbench-title-mode', '')
      mode.textContent = next.closest('header')?.querySelector('[data-slot="conversation.session.header.actions"] > span[title]')?.textContent ?? ''
      const done = document.createElement('button')
      done.type = 'button'
      done.textContent = '关闭'
      done.addEventListener('click', close)
      dialog.addEventListener('close', close)
      dialog.addEventListener('click', event => { if (event.target === dialog) close() })
      dialog.append(heading, name, mode, done)
      document.body.append(dialog)
      dialog.showModal()
    }
    const keydown = (event: KeyboardEvent): void => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open() }
    }
    openInfo = open
    const click = (event: Event): void => { event.stopPropagation(); open() }
    next.addEventListener('click', click)
    next.addEventListener('keydown', keydown)
    releaseTitle = () => {
      close()
      next.removeEventListener('click', click)
      next.removeEventListener('keydown', keydown)
      for (const [key, value] of original) {
        if (value === null) next.removeAttribute(key)
        else next.setAttribute(key, value)
      }
    }
  }
  const clear = (): void => {
    for (const [element, attributes] of marked) {
      for (const attribute of attributes) element.removeAttribute(attribute)
    }
    marked.clear()
    for (const heading of menuHeadings.values()) heading.element.remove()
    menuHeadings.clear()
    selectedPane = null
    selectedRowKey = null
    bindTitle(null)
  }
  const update = (viewIds: readonly string[]): void => {
    const next = new Map<Element, Set<string>>()
    const mark = (element: Element | null, attribute: string): void => {
      if (!element) return
      if (!element.hasAttribute(attribute)) element.setAttribute(attribute, '')
      const attributes = next.get(element) ?? new Set<string>()
      attributes.add(attribute)
      next.set(element, attributes)
    }
    const header = document.querySelector('header:has([data-conversation-tabs])')
    mark(header, 'data-mobile-workbench-header')
    bindTitle(header?.querySelector<HTMLElement>('span[class*="_crumbCurrent"], [class*="_crumbSeg"]:last-child span[class*="_switcherTitle"]') ?? null)
    // Extra third-party views keep their native tab strip available.
    if (viewIds.length === 2 && viewIds.includes('chat') && viewIds.includes('trajectory')) {
      mark(header, 'data-workbench-tabs-owned')
    }
    const ancestors = Array.from(header?.querySelectorAll('nav button:not([aria-haspopup])') ?? [])
    const parent = ancestors.at(-1)
    if (parent) {
      mark(header, 'data-workbench-child')
      mark(parent, 'data-workbench-parent')
      for (const ancestor of ancestors.slice(0, -1)) mark(ancestor.closest('[class*="_crumbSeg"]'), 'data-workbench-ancestor')
    }
    const trajectory = document.querySelector<HTMLElement>('[data-trajectory-scroll]')
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
    for (const button of document.querySelectorAll('[data-composer-stats] button[aria-label]')) {
      const summary = workbenchStatLabel(button.getAttribute('aria-label') ?? '')
      const label = button.querySelector('[class*="_label"]')
      if (summary && label) {
        mark(label, 'data-workbench-stat-label')
        if (label.getAttribute('data-workbench-stat-label') !== summary) label.setAttribute('data-workbench-stat-label', summary)
      }
    }
    const count = header?.querySelector('[data-slot="conversation.session.header.actions"] button[aria-haspopup="tree"]:not([data-mobile-workbench="agents"])')
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
      const name = title?.textContent ?? ''
      const mode = header?.querySelector('[data-slot="conversation.session.header.actions"] > span[title]')?.textContent ?? ''
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
  return { update, clear, openInfo: pointerStartedOpen => { openInfo(pointerStartedOpen) } }
}
