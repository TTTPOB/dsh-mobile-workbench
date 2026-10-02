export interface AgentStatusSource {
    getSnapshot: () => ReadonlyMap<string, {
        running?: boolean;
    }>;
    subscribe: (listener: () => void) => () => void;
}
/** Count the catalog represented by the native header, not its changing aria label. */
export declare function subagentCounts(snapshot: unknown, statuses?: ReadonlyMap<string, {
    running?: boolean;
}>): {
    agentActiveCount: number;
    agentTotalCount: number;
} | undefined;
//# sourceMappingURL=agent-counts.d.ts.map