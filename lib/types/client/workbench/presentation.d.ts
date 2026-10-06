/** Condense secondary metrics; the native button still opens every detail. */
export declare function workbenchStatLabel(label: string): string | null;
/** Mark presentation boundaries without moving React-owned elements. */
export declare function createWorkbenchPresentation(): {
    update: (viewIds: readonly string[], scope?: ParentNode) => void;
    clear: () => void;
    openInfo: () => void;
};
//# sourceMappingURL=presentation.d.ts.map