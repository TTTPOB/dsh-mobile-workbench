export declare const WORKBENCH_NS = "mobileWorkbench";
export declare const zh: {
    close: string;
    backToSessions: string;
    backToPrevious: string;
    presetReadOnly: string;
    viewSessionInfo: string;
    statistics: string;
    context: string;
    usedTokens: string;
    activity: string;
    turns: string;
    steps: string;
    tokens: string;
    input: string;
    output: string;
    cacheRead: string;
    cacheWrite: string;
    mode: string;
    capacity: string;
    system: string;
    tools: string;
    messages: string;
    navigation: string;
    sessions: string;
    session: string;
    sessionView: string;
    agentCatalog: string;
    parentSession: string;
    loading: string;
    sessionInfo: string;
    chat: string;
    trajectory: string;
    agents: string;
    files: string;
    emptyAgents: string;
    unavailable: string;
    copySessionId: string;
    copySessionIdSuccess: string;
    copySessionIdFailure: string;
};
export type WorkbenchKey = keyof typeof zh;
export declare const en: Record<WorkbenchKey, string>;
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        mobileWorkbench: WorkbenchKey;
    }
}
//# sourceMappingURL=locales.d.ts.map