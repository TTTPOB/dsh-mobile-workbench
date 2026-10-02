import { missingDescendantCatalogs } from './agent-counts.ts'

interface CatalogSource {
  getSnapshot: () => unknown
  subscribe: (listener: () => void) => () => void
}

/** Fill reachable projection baselines with at most two concurrent owner reads, without opening history. */
export function installAgentCatalogLoader(source: CatalogSource, refresh: (id: string) => Promise<void>, enabled: () => boolean): { update: () => void; dispose: () => void } {
  let disposed = false
  const inflight = new Set<string>()
  const update = (): void => {
    if (disposed || !enabled()) return
    // Re-read current membership rather than retaining an old root's work queue.
    for (const id of missingDescendantCatalogs(source.getSnapshot())) {
      if (inflight.size >= 2) break
      if (inflight.has(id)) continue
      inflight.add(id)
      void refresh(id).catch((_error) => {
        // The sessions owner exposes failures in projectionsBySession; counts stay unknown.
      }).finally(() => {
        inflight.delete(id)
        update()
      })
    }
  }
  const stop = source.subscribe(update)
  update()
  return { update, dispose: () => { disposed = true; stop() } }
}
