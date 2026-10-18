import type { ReactElement } from 'react';
import { type StatsValues } from './stats.ts';
import type { StatsTranslate } from './stats-locales.ts';
export interface WorkbenchStatsDetailsProps {
    pressure: StatsValues['contextPressure'];
    breakdown: StatsValues['contextBreakdown'];
    activity: StatsValues['sessionStats'];
    usage: StatsValues['tokenUsage'];
    t: StatsTranslate;
}
/** Present session-bound public projections; the parent owns panel placement and dismissal. */
export declare function WorkbenchStatsDetails({ pressure, breakdown, activity, usage, t }: WorkbenchStatsDetailsProps): ReactElement;
//# sourceMappingURL=WorkbenchStatsDetails.d.ts.map