import type { TranslateNS } from '@deepseek-ai/dsh-client-ui-slots'

export const STATS_NS = 'mobileWorkbenchStats'
export const statsZh = {
  context: '上下文占用',
  usedTokens: '已用 token（参考）',
  capacity: '上下文窗口',
  system: '系统（估算）',
  tools: '工具（估算）',
  messages: '消息（估算）',
  activity: '会话活动',
  turns: '轮',
  steps: '步',
  decodeSpeed: '输出生成速率（会话平均）',
  ttft: '平均首 token 等待',
  llmTime: '模型用时',
  toolTime: '工具用时',
  tokens: 'Token',
  total: '总计',
  cacheHit: '缓存命中率',
  input: '输入',
  output: '输出',
  cacheRead: '缓存读取',
  cacheWrite: '缓存写入',
  tokensPerSecond: '{value} tok/s',
  durationSeconds: '{seconds}秒',
  durationMinutes: '{minutes}分{seconds}秒',
}
export type StatsKey = keyof typeof statsZh
export const statsEn: Record<StatsKey, string> = {
  context: 'Context occupancy',
  usedTokens: 'Used tokens (reference)',
  capacity: 'Context window',
  system: 'System (estimate)',
  tools: 'Tools (estimate)',
  messages: 'Messages (estimate)',
  activity: 'Session activity',
  turns: 'Turns',
  steps: 'Steps',
  decodeSpeed: 'Output speed (session average)',
  ttft: 'Average time to first token',
  llmTime: 'Model time',
  toolTime: 'Tool time',
  tokens: 'Tokens',
  total: 'Total',
  cacheHit: 'Cache hit',
  input: 'Input',
  output: 'Output',
  cacheRead: 'Cache read',
  cacheWrite: 'Cache write',
  tokensPerSecond: '{value} tok/s',
  durationSeconds: '{seconds}s',
  durationMinutes: '{minutes}m{seconds}s',
}
export type StatsTranslate = TranslateNS<typeof STATS_NS>

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    mobileWorkbenchStats: StatsKey
  }
}
