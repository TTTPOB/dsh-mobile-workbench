import type { SessionProjectionMap } from '@deepseek-ai/dsh-session-projection/types'
import type {} from '@deepseek-ai/dsh-session-stats/client'
import type {} from '@deepseek-ai/dsh-token-meter/client'
import type { StatsTranslate } from './stats-locales.ts'

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

/** Match the Host's paired, whole-session decode samples, excluding first-token wait. */
export function decodeTokensPerSecond(activity: StatsValues['sessionStats']): number | undefined {
  return activity === undefined || activity.decodeMs <= 0 ? undefined : activity.decodeTokens / (activity.decodeMs / 1000)
}

export function averageTtftMs(activity: StatsValues['sessionStats']): number | undefined {
  return activity === undefined || activity.ttftSteps === 0 ? undefined : activity.ttftMs / activity.ttftSteps
}

/** The four billing buckets are disjoint; reasoning is already included in output. */
export function totalTokens(usage: StatsValues['tokenUsage']): number | undefined {
  return usage === undefined ? undefined : usage.uncachedInputTokens + usage.cacheReadTokens + usage.cacheWriteTokens + usage.outputTokens
}

/** Keep partial cache hits below 100%, even when ordinary integer rounding would hide misses. */
export function cacheHitLabel(usage: StatsValues['tokenUsage']): string {
  if (usage === undefined) return '—'
  const input = usage.uncachedInputTokens + usage.cacheReadTokens + usage.cacheWriteTokens
  if (input === 0) return '—'
  const missed = input - usage.cacheReadTokens
  if (missed === 0) return '100%'
  const percent = usage.cacheReadTokens / input * 100
  const precision = Math.round(percent) < 100 ? 0 : Math.max(1, Math.ceil(-Math.log10(missed / input * 100)))
  return Number(percent.toFixed(precision)) + '%'
}

/** Use the native throughput precision without adding a misleading missing zero. */
export function statRate(value: number | undefined): string {
  return value === undefined ? '—' : String(value >= 10 ? Math.round(value) : Math.round(value * 10) / 10)
}

export function statDuration(ms: number | undefined, t: StatsTranslate): string {
  if (ms === undefined) return '—'
  const seconds = ms / 1000
  if (seconds < 60) return t('durationSeconds', { seconds: Math.round(seconds * 10) / 10 })
  const whole = Math.round(seconds)
  return t('durationMinutes', { minutes: Math.floor(whole / 60), seconds: whole % 60 })
}
