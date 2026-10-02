export interface AgentStatusSource {
    getSnapshot: () => ReadonlyMap<string, {
        running?: boolean;
    }>;
    subscribe: (listener: () => void) => () => void;
}
interface Counts {
    agentActiveCount?: number;
    agentTotalCount?: number;
    agentCountsState: 'ready' | 'loading' | 'unavailable';
}
/** Discover only missing baselines reachable from the current session's own catalog. */
export declare function missingDescendantCatalogs(snapshot: unknown): string[];
/** Count only this session's descendants, never substituting a parent's sibling catalog. */
export declare function subagentCounts(snapshot: unknown, statuses?: ReadonlyMap<string, {
    running?: boolean;
}>): Counts | undefined;
export {};
//# sourceMappingURL=agent-counts.d.ts.map