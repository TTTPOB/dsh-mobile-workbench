export type WorkbenchDestination = 'chat' | 'trajectory' | 'agents' | 'files'

export interface NavigationEvidence {
  selectedView: string | undefined
  filesOpen: boolean
  agentsOpen: boolean
  hasChat: boolean
  hasTrajectory: boolean
  hasAgents: boolean
  hasFiles: boolean
}

/** Derive selection from host evidence, never from the last requested action. */
export function resolveDestination(evidence: NavigationEvidence): WorkbenchDestination {
  if (evidence.filesOpen) return 'files'
  if (evidence.agentsOpen) return 'agents'
  return evidence.selectedView === 'trajectory' ? 'trajectory' : 'chat'
}

/** Keep missing host capabilities explicit rather than simulating their content. */
export function destinationAvailable(destination: WorkbenchDestination, evidence: NavigationEvidence): boolean {
  switch (destination) {
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
