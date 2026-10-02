export const WORKBENCH_NS = 'mobileWorkbench'
export const zh = {
  navigation: '工作台导航',
  sessions: '会话列表',
  sessionInfo: '会话信息',
  chat: '对话',
  trajectory: '轨迹',
  agents: '智能体',
  files: '文件',
  emptyAgents: '暂无子代理',
  unavailable: '当前不可用',
  copySessionId: '复制会话ID',
  copySessionIdSuccess: '已复制会话ID',
  copySessionIdFailure: '复制失败，请检查浏览器剪贴板权限',
}
export type WorkbenchKey = keyof typeof zh
export const en: Record<WorkbenchKey, string> = {
  navigation: 'Workbench navigation',
  sessions: 'Sessions',
  sessionInfo: 'Session information',
  chat: 'Chat',
  trajectory: 'Trace',
  agents: 'Agents',
  files: 'Files',
  emptyAgents: 'No subagents yet',
  unavailable: 'Currently unavailable',
  copySessionId: 'Copy session ID',
  copySessionIdSuccess: 'Session ID copied',
  copySessionIdFailure: 'Copy failed; check browser clipboard permissions',
}

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    mobileWorkbench: WorkbenchKey
  }
}
