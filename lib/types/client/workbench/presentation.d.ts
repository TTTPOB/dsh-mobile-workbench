/** Condense secondary metrics; the native button still opens every detail. */
export declare function workbenchStatLabel(label: string): string | null;
/** Mark presentation boundaries without moving React-owned elements. */
export declare function createWorkbenchPresentation(openCatalog?: (pointerStartedOpen: boolean) => boolean): {
    update: (viewIds: readonly string[]) => void;
    clear: () => void;
    openInfo: (pointerStartedOpen?: boolean) => void;
};
//# sourceMappingURL=presentation.d.ts.map