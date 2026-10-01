export type WorkbenchDestination = 'chat' | 'trajectory' | 'agents' | 'files';
export interface NavigationEvidence {
    selectedView: string | undefined;
    filesOpen: boolean;
    agentsOpen: boolean;
    hasChat: boolean;
    hasTrajectory: boolean;
    agentCount?: number;
    hasAgents: boolean;
    hasFiles: boolean;
}
/** Derive selection from host evidence, never from the last requested action. */
export declare function resolveDestination(evidence: NavigationEvidence): WorkbenchDestination;
/** Keep missing host capabilities explicit rather than simulating their content. */
export declare function destinationAvailable(destination: WorkbenchDestination, evidence: NavigationEvidence): boolean;
/** Map the official ordered view ledger onto its rendered tab strip. */
export declare function viewIndex(ids: readonly string[], view: string, tabCount: number): number;
//# sourceMappingURL=navigation.d.ts.map