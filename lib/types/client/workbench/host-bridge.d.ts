import type { SessionId } from '@deepseek-ai/dsh-session/types';
import type { NavigationEvidence, WorkbenchDestination, WorkbenchView } from './navigation.ts';
export interface HostView {
    id: string;
    label: string;
}
/** Native navigation actions and evidence; host nodes stay in their React-owned parents. */
export declare function createHostBridge(viewTabs: () => readonly HostView[], agentCounts?: () => Pick<NavigationEvidence, 'agentActiveCount' | 'agentTotalCount' | 'agentCountsState'>, closeDrawer?: () => void, openSessions?: () => void, conversation?: {
    show: () => void;
    hasSession: () => boolean;
    parentId?: () => SessionId | undefined;
    openSession?: (id: SessionId) => void;
}): {
    evidence: () => NavigationEvidence;
    activate: (destination: WorkbenchDestination, pointerStartedOpen?: boolean) => void;
    selectView: (view: WorkbenchView) => void;
    returnParent: () => void;
    closeAgents: (restoreFocus?: boolean) => void;
    focusAgents: () => void;
    clear: () => void;
};
//# sourceMappingURL=host-bridge.d.ts.map