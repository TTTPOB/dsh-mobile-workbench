import { type NavigationEvidence, type WorkbenchDestination } from './navigation.ts';
/** All rc.2 DOM access stays here; host nodes remain in their React-owned parents. */
export declare function createHostBridge(viewIds: () => readonly string[], agentCounts?: () => Pick<NavigationEvidence, 'agentActiveCount' | 'agentTotalCount'>, closeDrawer?: () => void, openSessions?: () => void, conversation?: {
    show: () => void;
    hasSession: () => boolean;
}): {
    evidence: () => NavigationEvidence;
    activate: (destination: WorkbenchDestination, pointerStartedOpen?: boolean) => void;
    clear: () => void;
};
//# sourceMappingURL=host-bridge.d.ts.map