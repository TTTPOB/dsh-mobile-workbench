import { type NavigationEvidence, type WorkbenchDestination } from './navigation.ts';
/** All rc.2 DOM access stays here; host nodes remain in their React-owned parents. */
export declare function createHostBridge(viewIds: () => readonly string[]): {
    evidence: () => NavigationEvidence;
    activate: (destination: WorkbenchDestination) => void;
};
//# sourceMappingURL=host-bridge.d.ts.map