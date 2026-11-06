/** Native column identity remains stable when AppFrame inserts a drawer mask. */
export declare const SIDEBAR_COLUMN = ":scope > [class*=\"_sidebarCol\"]";
export declare const SESSIONS_PAGE = "data-mobile-workbench-sessions";
/** Read only the workbench page selection, not the native drawer state. */
export declare function sessionsPageOpen(frame: Element | null): boolean;
/** Toggle the retained sidebar page without opening the native modal drawer. */
export declare function toggleSessionsPage(frame: Element | null): void;
/** Keep the native drawer closed and reapply page focusability after React commits. */
export declare function createSidebarPage(frame: HTMLElement, toggleNative: () => void, panelOpen: () => boolean): {
    sync: () => void;
    dispose: () => void;
};
//# sourceMappingURL=sidebar-page.d.ts.map