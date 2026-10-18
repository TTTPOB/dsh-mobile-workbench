import type { SessionProjectionMap } from '@deepseek-ai/dsh-session-projection/types';
import type { StatsTranslate } from './stats-locales.ts';
export type StatsValues = Pick<Partial<SessionProjectionMap>, 'contextPressure' | 'contextBreakdown' | 'sessionStats' | 'tokenUsage'>;
/** Missing measurements stay missing; a provider-reported zero remains a real zero. */
export declare function contextPercent(pressure: StatsValues['contextPressure']): number | undefined;
export declare function statNumber(value: number | undefined): string;
export declare function pressureLabel(pressure: StatsValues['contextPressure']): string;
/** Match the Host's paired, whole-session decode samples, excluding first-token wait. */
export declare function decodeTokensPerSecond(activity: StatsValues['sessionStats']): number | undefined;
export declare function averageTtftMs(activity: StatsValues['sessionStats']): number | undefined;
/** The four billing buckets are disjoint; reasoning is already included in output. */
export declare function totalTokens(usage: StatsValues['tokenUsage']): number | undefined;
/** Keep partial cache hits below 100%, even when ordinary integer rounding would hide misses. */
export declare function cacheHitLabel(usage: StatsValues['tokenUsage']): string;
/** Use the native throughput precision without adding a misleading missing zero. */
export declare function statRate(value: number | undefined): string;
export declare function statDuration(ms: number | undefined, t: StatsTranslate): string;
//# sourceMappingURL=stats.d.ts.map