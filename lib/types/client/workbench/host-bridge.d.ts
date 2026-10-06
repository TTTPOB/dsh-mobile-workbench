import { type NavigationEvidence, type WorkbenchDestination, type WorkbenchView } from './navigation.ts';
/** Native navigation actions and evidence; host nodes stay in their React-owned parents. */
export declare function createHostBridge(viewIds: () => readonly string[], agentCounts?: () => Pick<NavigationEvidence, 'agentActiveCount' | 'agentTotalCount' | 'agentCountsState'>, closeDrawer?: () => void, openSessions?: () => void, conversation?: {
    show: () => void;
    hasSession: () => boolean;
}): {
    evidence: () => NavigationEvidence;
    activate: (destination: WorkbenchDestination, pointerStartedOpen?: boolean) => void;
    selectView: (view: WorkbenchView) => void;
    returnParent: () => void;
    clear: () => void;
};
//# sourceMappingURL=host-bridge.d.ts.map