export type WorkbenchDestination = 'sessions' | 'chat' | 'trajectory' | 'agents' | 'files'

export interface NavigationEvidence {
  selectedView: string | undefined
  sessionsOpen?: boolean
  hasSessions?: boolean
  filesOpen: boolean
  agentsOpen: boolean
  hasChat: boolean
  hasTrajectory: boolean
  agentActiveCount?: number
  agentTotalCount?: number
  hasAgents: boolean
  hasFiles: boolean
}

/** Derive selection from host evidence, never from the last requested action. */
export function resolveDestination(evidence: NavigationEvidence): WorkbenchDestination {
  if (evidence.sessionsOpen) return 'sessions'
  if (evidence.filesOpen) return 'files'
  return evidence.selectedView === 'trajectory' ? 'trajectory' : 'chat'
}

/** Keep missing host capabilities explicit rather than simulating their content. */
export function destinationAvailable(destination: WorkbenchDestination, evidence: NavigationEvidence): boolean {
  switch (destination) {
    case 'sessions': return evidence.hasSessions === true
    case 'chat': return evidence.hasChat
    case 'trajectory': return evidence.hasTrajectory
    case 'agents': return evidence.hasAgents
    case 'files': return evidence.hasFiles
  }
}

/** Map the official ordered view ledger onto its rendered tab strip. */
export function viewIndex(ids: readonly string[], view: string, tabCount: number): number {
  if (ids.length !== tabCount) return -1
  return ids.indexOf(view)
}
