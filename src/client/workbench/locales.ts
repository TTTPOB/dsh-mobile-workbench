export const WORKBENCH_NS = 'mobileWorkbench'
export const zh = {
  navigation: '工作台导航',
  chat: '对话',
  trajectory: '轨迹',
  agents: '智能体',
  files: '文件',
  emptyAgents: '暂无子代理',
  unavailable: '当前不可用',
}
export type WorkbenchKey = keyof typeof zh
export const en: Record<WorkbenchKey, string> = {
  navigation: 'Workbench navigation',
  chat: 'Chat',
  trajectory: 'Trace',
  agents: 'Agents',
  files: 'Files',
  emptyAgents: 'No subagents yet',
  unavailable: 'Currently unavailable',
}

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    mobileWorkbench: WorkbenchKey
  }
}
