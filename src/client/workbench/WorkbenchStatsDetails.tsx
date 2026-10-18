import type { ReactElement } from 'react'
import { averageTtftMs, cacheHitLabel, decodeTokensPerSecond, pressureLabel, statDuration, statNumber, statRate, totalTokens, type StatsValues } from './stats.ts'
import type { StatsKey, StatsTranslate } from './stats-locales.ts'

export interface WorkbenchStatsDetailsProps {
  pressure: StatsValues['contextPressure']
  breakdown: StatsValues['contextBreakdown']
  activity: StatsValues['sessionStats']
  usage: StatsValues['tokenUsage']
  t: StatsTranslate
}

/** Present session-bound public projections; the parent owns panel placement and dismissal. */
export function WorkbenchStatsDetails({ pressure, breakdown, activity, usage, t }: WorkbenchStatsDetailsProps): ReactElement {
  const speed = decodeTokensPerSecond(activity)
  const rows = (items: [StatsKey, string][]): ReactElement => <dl>{items.map(([key, value]) =>
    <div key={key} data-workbench-stat={key}><dt>{t(key)}</dt><dd>{value}</dd></div>)}</dl>
  return <>
    <h2>{t('context')} <span>{pressureLabel(pressure)}</span></h2>
    {rows([
      ['usedTokens', statNumber(pressure?.projectedTokens ?? pressure?.pressureTokens)],
      ['capacity', statNumber(pressure?.contextWindow)],
      ...(breakdown ? [
        ['system', statNumber(breakdown.systemTokens)],
        ['tools', statNumber(breakdown.toolsTokens)],
        ['messages', statNumber(breakdown.messageTokens)],
      ] as [StatsKey, string][] : []),
    ])}
    <h2>{t('activity')}</h2>
    {rows([
      ['turns', statNumber(activity?.turns)],
      ['steps', statNumber(activity?.steps)],
      ['decodeSpeed', speed === undefined ? '—' : t('tokensPerSecond', { value: statRate(speed) })],
      ['ttft', statDuration(averageTtftMs(activity), t)],
      ['llmTime', statDuration(activity?.llmMs, t)],
      ['toolTime', statDuration(activity?.toolMs, t)],
    ])}
    <h2>{t('tokens')}</h2>
    {rows([
      ['total', statNumber(totalTokens(usage))],
      ['cacheHit', cacheHitLabel(usage)],
      ['input', statNumber(usage?.uncachedInputTokens)],
      ['output', statNumber(usage?.outputTokens)],
      ['cacheRead', statNumber(usage?.cacheReadTokens)],
      ['cacheWrite', statNumber(usage?.cacheWriteTokens)],
    ])}
  </>
}
