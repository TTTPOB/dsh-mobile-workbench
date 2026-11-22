import type { SessionListState } from '@deepseek-ai/dsh-api-session-controller/client'
import { currentSessionIdOf } from '../core/sessions-compat.ts'

/** Public catalog and status fields needed for descendant counts. */
interface CatalogList {
  byId?: Record<string, { running?: boolean }>
  projectionsBySession?: Readonly<Record<string, { state?: string; values: { subagentCatalog?: readonly { id: string; mode?: string; activity?: string }[] } }>>
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
  const root = currentSessionIdOf(snapshot as SessionListState)
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
    for (const child of catalog) if (child.mode !== 'external') visit(child.id)
  }
  visit(root)
  return missing
}

/** Count only this session's descendants, never substituting a parent's sibling catalog. */
export function subagentCounts(snapshot: unknown, statuses?: ReadonlyMap<string, { running?: boolean }>): Counts | undefined {
  const root = currentSessionIdOf(snapshot as SessionListState)
  if (root === undefined) return undefined
  const list = snapshot as CatalogList
  const visit = (id: string): Counts => {
    const projection = list.projectionsBySession?.[id]
    if (projection?.state === 'error') return { agentCountsState: 'unavailable' }
    const catalog = projection?.values.subagentCatalog
    if (catalog === undefined && id === root) {
      return { agentCountsState: projection?.state === 'ready' ? 'unavailable' : 'loading' }
    }
    // A known child is counted as soon as its parent publishes it. Its own
    // directory can add descendants later; it must not reset the known count.
    let active = 0
    let total = 0
    for (const child of catalog ?? []) {
      if (child.mode === 'external') continue
      total++
      active += (statuses?.get(child.id)?.running ?? list.byId?.[child.id]?.running ?? child.activity === 'running') ? 1 : 0
      const descendants = visit(child.id)
      if (descendants.agentCountsState === 'unavailable') return descendants
      total += descendants.agentTotalCount ?? 0
      active += descendants.agentActiveCount ?? 0
    }
    return { agentActiveCount: active, agentTotalCount: total, agentCountsState: 'ready' }
  }
  return visit(root)
}
