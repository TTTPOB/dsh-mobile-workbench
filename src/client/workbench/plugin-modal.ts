import type { Context as ClientContext } from '@deepseek-ai/cordis'
import { resolveSlotLabel } from '@deepseek-ai/dsh-client-ui-slots'

/** Open the optional native modal before the sidebar row changes the main panel. */
export function openPluginsModal(ctx: ClientContext, event: MouseEvent): boolean {
  if (document.documentElement.getAttribute('data-mobile-workbench-active') !== 'true') return false
  const navigation = ctx.get('pluginNavigation') as { openModal?: () => void } | undefined
  if (navigation?.openModal === undefined || !(event.target instanceof Element)) return false
  const row = event.target.closest('button[class*="_panelRow"]:not([aria-haspopup="menu"])')
  if (row?.closest('[data-slot="sidebar"]') === null || row === null) return false
  if (row.querySelector('[data-slot="sidebar.panellist"]') === null) return false
  // The outlet exposes only its slot name, not the entry id. Resolve the live
  // registration's label just as SidebarRoot does, including locale changes.
  const entries = ctx.slots.entriesOfSlot('sidebar.panellist')
    .filter(entry => (resolveSlotLabel(entry.options.label) ?? entry.options.id) === row.getAttribute('aria-label'))
  if (entries.length !== 1 || entries[0]?.options.id !== 'plugins') return false
  event.preventDefault()
  event.stopImmediatePropagation()
  navigation.openModal()
  return true
}
