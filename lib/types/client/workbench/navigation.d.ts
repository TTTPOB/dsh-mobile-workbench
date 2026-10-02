export type WorkbenchDestination = 'sessions' | 'session' | 'agents' | 'files';
export type WorkbenchView = 'chat' | 'trajectory';
export interface NavigationEvidence {
    selectedView: string | undefined;
    sessionsOpen?: boolean;
    hasSessions?: boolean;
    hasSessionPage?: boolean;
    hasParent?: boolean;
    filesOpen: boolean;
    agentsOpen: boolean;
    hasChat: boolean;
    hasTrajectory: boolean;
    agentActiveCount?: number;
    agentTotalCount?: number;
    agentCountsState?: 'ready' | 'loading' | 'unavailable';
    hasAgents: boolean;
    hasFiles: boolean;
}
/** Derive the page independently of the native conversation view. */
export declare function resolveDestination(evidence: NavigationEvidence): Exclude<WorkbenchDestination, 'agents'>;
/** Keep missing host capabilities explicit rather than simulating their content. */
export declare function destinationAvailable(destination: WorkbenchDestination, evidence: NavigationEvidence): boolean;
/** Map the official ordered view ledger onto its rendered tab strip. */
export declare function viewIndex(ids: readonly string[], view: string, tabCount: number): number;
//# sourceMappingURL=navigation.d.ts.map