export type WorkbenchDestination = 'sessions' | 'session' | 'agents' | 'files'
export type WorkbenchView = 'chat' | 'trajectory'

export interface NavigationEvidence {
  selectedView: string | undefined
  sessionsOpen?: boolean
  hasSessions?: boolean
  hasSessionPage?: boolean
  hasParent?: boolean
  filesOpen: boolean
  agentsOpen: boolean
  hasChat: boolean
  hasTrajectory: boolean
  agentActiveCount?: number
  agentTotalCount?: number
  agentCountsState?: 'ready' | 'loading' | 'unavailable'
  hasAgents: boolean
  hasFiles: boolean
}

/** Derive the page independently of the native conversation view. */
export function resolveDestination(evidence: NavigationEvidence): Exclude<WorkbenchDestination, 'agents'> {
  if (evidence.sessionsOpen) return 'sessions'
  if (evidence.filesOpen) return 'files'
  return 'session'
}

/** Keep missing host capabilities explicit rather than simulating their content. */
export function destinationAvailable(destination: WorkbenchDestination, evidence: NavigationEvidence): boolean {
  switch (destination) {
    case 'sessions': return evidence.hasSessions === true
    case 'session': return evidence.hasSessionPage === true
    case 'agents': return evidence.hasAgents
    case 'files': return evidence.hasFiles
  }
}

/** Map the official ordered view ledger onto its rendered tab strip. */
export function viewIndex(ids: readonly string[], view: string, tabCount: number): number {
  if (ids.length !== tabCount) return -1
  return ids.indexOf(view)
}
