import type { SessionProjectionMap } from '@deepseek-ai/dsh-session-projection/types';
export type StatsValues = Pick<Partial<SessionProjectionMap>, 'contextPressure' | 'contextBreakdown' | 'sessionStats' | 'tokenUsage'>;
/** Missing measurements stay missing; a provider-reported zero remains a real zero. */
export declare function contextPercent(pressure: StatsValues['contextPressure']): number | undefined;
export declare function statNumber(value: number | undefined): string;
export declare function pressureLabel(pressure: StatsValues['contextPressure']): string;
//# sourceMappingURL=stats.d.ts.map