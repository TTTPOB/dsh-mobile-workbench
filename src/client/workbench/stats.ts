import type { SessionProjectionMap } from '@deepseek-ai/dsh-session-projection/types'
import type {} from '@deepseek-ai/dsh-session-stats/client'
import type {} from '@deepseek-ai/dsh-token-meter/client'

export type StatsValues = Pick<Partial<SessionProjectionMap>, 'contextPressure' | 'contextBreakdown' | 'sessionStats' | 'tokenUsage'>

/** Missing measurements stay missing; a provider-reported zero remains a real zero. */
export function contextPercent(pressure: StatsValues['contextPressure']): number | undefined {
  const tokens = pressure?.projectedTokens ?? pressure?.pressureTokens
  const capacity = pressure?.contextWindow
  return tokens === undefined || capacity === undefined || capacity <= 0
    ? undefined : Math.round(tokens / capacity * 100)
}

export function statNumber(value: number | undefined): string {
  return value === undefined ? '—' : value.toLocaleString()
}

export function pressureLabel(pressure: StatsValues['contextPressure']): string {
  const percent = contextPercent(pressure)
  return percent === undefined ? '—' : percent + '%'
}
