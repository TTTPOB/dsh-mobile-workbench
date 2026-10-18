type Page = 'sessions' | 'session' | 'files';
/** Own at most one same-document entry above the session page; panel history stays independent. */
export declare function installPageHistory(window: Window, restorePage: (page: Page) => void, panelActive: () => boolean): {
    enter: (page: Page) => void;
    sync: (page: Page) => void;
    dispose: () => void;
};
export {};
//# sourceMappingURL=page-history.d.ts.map