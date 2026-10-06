export interface StatsDecoration {
    ensure: () => void;
    dispose: () => void;
}
/** Mark the native metrics and context meter without changing their layout or nodes. */
export declare function createStatsDecoration(): StatsDecoration;
//# sourceMappingURL=stats-line.d.ts.map