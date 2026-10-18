import type { Context } from '@deepseek-ai/cordis'
import type { MainPanelId } from '@deepseek-ai/dsh-client-ui-layout/client'

/** Public panel registrations supply menu labels; account rows remain native. */
export function managementEntries(ctx: Context): { id: MainPanelId; label: string }[] {
  return ctx.slots.entriesOfSlot('sidebar.panellist')
    .map(entry => ({ id: entry.options.id as MainPanelId, label: entry.options.label === undefined ? entry.options.id ?? '' : typeof entry.options.label === 'function' ? entry.options.label() : ctx.locale.resolveText(entry.options.label), order: entry.options.order ?? 0 }))
    .filter(entry => Boolean(entry.id)).sort((a, b) => a.order - b.order)
}

/** Append only owned rows to this account menu; never clone native nodes or account state. */
export function decorateManagementMenu(menu: HTMLElement, entries: readonly { id: string; label: string }[], activate: (id: string) => void): () => void {
  const viewport = menu.querySelector<HTMLElement>('[role="presentation"][class*="_viewport"]')
  const native = viewport?.querySelector<HTMLButtonElement>('button[role="menuitem"]')
  if (!viewport || !native) return () => {}
  const nodes: HTMLElement[] = []
  for (const entry of entries) {
    const wrap = document.createElement('div')
    wrap.className = native.parentElement?.className ?? ''
    const button = document.createElement('button')
    button.type = 'button'
    button.className = native.className
    button.setAttribute('role', 'menuitem')
    button.dataset.mobileManagementEntry = entry.id
    const icon = document.createElement('span')
    icon.className = native.querySelector('[class*="_itemIcon"]')?.className ?? ''
    icon.setAttribute('aria-hidden', 'true')
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    for (const [key, value] of Object.entries({ viewBox: '0 0 16 16', width: '16', height: '16', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.2' })) svg.setAttribute(key, value)
    const path = document.createElementNS(svg.namespaceURI, 'path')
    path.setAttribute('d', entry.id === 'schedules' ? 'M8 2a6 6 0 1 0 0 12A6 6 0 0 0 8 2Zm0 2v4l3 2' : 'M2 2h5v5H2Zm7 0h5v5H9ZM2 9h5v5H2Zm7 0h5v5H9Z')
    svg.append(path)
    icon.append(svg)
    const label = document.createElement('span')
    label.className = native.querySelector('[class*="_itemLabel"]')?.className ?? ''
    label.textContent = entry.label
    button.append(icon, label)
    button.addEventListener('click', () => { activate(entry.id) })
    wrap.append(button)
    nodes.push(wrap)
  }
  viewport.prepend(...nodes)
  menu.setAttribute('data-mobile-management-menu', '')
  return () => { for (const node of nodes) node.remove(); menu.removeAttribute('data-mobile-management-menu') }
}
