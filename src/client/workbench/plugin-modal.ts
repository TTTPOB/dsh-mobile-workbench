import type { Context as ClientContext } from '@deepseek-ai/cordis'

/** Use the optional public modal command before the original panel-row click changes pages. */
export function openPluginsModal(ctx: ClientContext, event: MouseEvent): boolean {
  if (document.documentElement.getAttribute('data-mobile-workbench-active') !== 'true') return false
  const navigation = ctx.get('pluginNavigation') as { openModal?: () => void } | undefined
  if (navigation?.openModal === undefined || !(event.target instanceof Element)) return false
  const row = event.target.closest('button[class*="_panelRow"]')
  const panelList = document.querySelector('[data-mobile-nav="frame"] > :first-child [class*="_panelList"]')
  if (row === null || panelList === null || !panelList.contains(row)) return false
  const rows = Array.from(panelList.querySelectorAll(':scope > button[class*="_panelRow"]'))
  // SidebarRoot maps this public ledger in order; never identify a row by localized copy.
  const ids = ctx.slots.entriesOfSlot('sidebar.panellist')
    .map(entry => ({ id: entry.options.id, order: entry.options.order ?? 0 }))
    .sort((a, b) => a.order - b.order).map(entry => entry.id)
  if (rows.length !== ids.length || ids[rows.indexOf(row)] !== 'plugins') return false
  event.preventDefault()
  event.stopImmediatePropagation()
  navigation.openModal()
  return true
}
