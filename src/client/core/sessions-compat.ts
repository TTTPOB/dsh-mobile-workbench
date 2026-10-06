/** Structural state access keeps released rc.2 usable with the older dev SDK. */
interface SessionListLike {
  current?: unknown
  byId?: Record<string, { id?: unknown; retainedBy?: { mainView?: unknown } }>
}

/** Read the retained main-view session, with the dev SDK snapshot fallback. */
export function currentSessionIdOf(list: unknown): string | undefined {
  if (typeof list !== 'object' || list === null) return undefined
  const snapshot = list as SessionListLike
  for (const key in snapshot.byId) {
    const summary = snapshot.byId[key]
    // for-in guarantees the key exists, not the value — an explicitly
    // undefined property still reaches the guard below.
    if (summary === undefined) continue
    const mainView = summary.retainedBy?.mainView
    if (typeof mainView === 'number' && mainView > 0 && typeof summary.id === 'string') return summary.id
  }
  return typeof snapshot.current === 'string' ? snapshot.current : undefined
}
