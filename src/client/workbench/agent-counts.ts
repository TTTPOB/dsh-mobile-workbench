import { currentSessionIdOf } from '../core/sessions-compat.ts'

/** Public rc.2 catalog/status fields, independent of the older development typings. */
interface CatalogList {
  byId?: Record<string, { parentId?: string; running?: boolean }>
  projectionsBySession?: Readonly<Record<string, { state?: string; values: { subagentCatalog?: readonly { id: string }[] } }>>
}
export interface AgentStatusSource {
  getSnapshot: () => ReadonlyMap<string, { running?: boolean }>
  subscribe: (listener: () => void) => () => void
}

/** Count the catalog represented by the native header, not its changing aria label. */
export function subagentCounts(snapshot: unknown, statuses?: ReadonlyMap<string, { running?: boolean }>):
  { agentActiveCount: number; agentTotalCount: number } | undefined {
  const id = currentSessionIdOf(snapshot)
  if (id === undefined) return undefined
  const list = snapshot as CatalogList
  const projection = list.projectionsBySession?.[id]
  const own = projection?.values.subagentCatalog
  const parentId = list.byId?.[id]?.parentId
  // The native own-count trigger also remains visible for a failed catalog read.
  const catalog = own?.length || projection?.state === 'error' ? own
    : parentId ? list.projectionsBySession?.[parentId]?.values.subagentCatalog : own
  if (catalog === undefined) return undefined
  return {
    agentTotalCount: catalog.length,
    agentActiveCount: catalog.filter(entry =>
      (statuses?.get(entry.id)?.running ?? list.byId?.[entry.id]?.running) === true).length,
  }
}
