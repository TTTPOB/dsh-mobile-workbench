import type { SessionListState } from '@deepseek-ai/dsh-api-session-controller/client'

/** The public main-view retain count identifies the visible session. */
export function currentSessionIdOf(list: unknown): SessionListState['ids'][number] | undefined {
  const snapshot = list as SessionListState | undefined
  return Object.values(snapshot?.byId ?? {}).find(summary => (summary.retainedBy?.mainView ?? 0) > 0)?.id
}
