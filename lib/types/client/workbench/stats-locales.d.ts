import type { TranslateNS } from '@deepseek-ai/dsh-client-ui-slots';
export declare const STATS_NS = "mobileWorkbenchStats";
export declare const statsZh: {
    context: string;
    usedTokens: string;
    capacity: string;
    system: string;
    tools: string;
    messages: string;
    activity: string;
    turns: string;
    steps: string;
    decodeSpeed: string;
    ttft: string;
    llmTime: string;
    toolTime: string;
    tokens: string;
    total: string;
    cacheHit: string;
    input: string;
    output: string;
    cacheRead: string;
    cacheWrite: string;
    tokensPerSecond: string;
    durationSeconds: string;
    durationMinutes: string;
};
export type StatsKey = keyof typeof statsZh;
export declare const statsEn: Record<StatsKey, string>;
export type StatsTranslate = TranslateNS<typeof STATS_NS>;
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        mobileWorkbenchStats: StatsKey;
    }
}
//# sourceMappingURL=stats-locales.d.ts.map