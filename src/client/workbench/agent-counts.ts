import { currentSessionIdOf } from '../core/sessions-compat.ts'

/** Public rc.2 catalog/status fields, independent of the older development typings. */
interface CatalogList {
  byId?: Record<string, { running?: boolean }>
  projectionsBySession?: Readonly<Record<string, { state?: string; values: { subagentCatalog?: readonly { id: string }[] } }>>
}
export interface AgentStatusSource {
  getSnapshot: () => ReadonlyMap<string, { running?: boolean }>
  subscribe: (listener: () => void) => () => void
}
interface Counts {
  agentActiveCount?: number
  agentTotalCount?: number
  agentCountsState: 'ready' | 'loading' | 'unavailable'
}

/** Discover only missing baselines reachable from the current session's own catalog. */
export function missingDescendantCatalogs(snapshot: unknown): string[] {
  const root = currentSessionIdOf(snapshot)
  if (root === undefined) return []
  const list = snapshot as CatalogList
  const missing: string[] = []
  const visit = (id: string): void => {
    const projection = list.projectionsBySession?.[id]
    if (projection?.state === 'error') return
    const catalog = projection?.values.subagentCatalog
    if (catalog === undefined) {
      if (projection?.state === undefined || projection.state === 'idle') missing.push(id)
      return
    }
    for (const child of catalog) visit(child.id)
  }
  visit(root)
  return missing
}

/** Count only this session's descendants, never substituting a parent's sibling catalog. */
export function subagentCounts(snapshot: unknown, statuses?: ReadonlyMap<string, { running?: boolean }>): Counts | undefined {
  const root = currentSessionIdOf(snapshot)
  if (root === undefined) return undefined
  const list = snapshot as CatalogList
  const visit = (id: string): Counts => {
    const projection = list.projectionsBySession?.[id]
    if (projection?.state === 'error') return { agentCountsState: 'unavailable' }
    const catalog = projection?.values.subagentCatalog
    if (projection?.state === 'loading' || catalog === undefined) {
      return { agentCountsState: projection?.state === 'ready' ? 'unavailable' : 'loading' }
    }
    let active = 0
    let total = 0
    for (const child of catalog) {
      const descendants = visit(child.id)
      if (descendants.agentCountsState !== 'ready') return descendants
      total += 1 + (descendants.agentTotalCount ?? 0)
      active += (statuses?.get(child.id)?.running ?? list.byId?.[child.id]?.running) === true ? 1 : 0
      active += descendants.agentActiveCount ?? 0
    }
    return { agentActiveCount: active, agentTotalCount: total, agentCountsState: 'ready' }
  }
  return visit(root)
}
