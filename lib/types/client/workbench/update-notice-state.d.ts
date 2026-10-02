/** Public ClientEntries synchronization fields used by the recovery notice. */
export interface ClientSyncSnapshot {
    readonly syncing: boolean;
    readonly failures: readonly {
        readonly id: string;
        readonly message: string;
    }[];
}
/** Ignore initial boot failures and keep dismissal until the next healthy settlement. */
export declare function createUpdateNoticeState(): {
    update: (state: ClientSyncSnapshot) => boolean;
    dismiss: () => void;
};
//# sourceMappingURL=update-notice-state.d.ts.map