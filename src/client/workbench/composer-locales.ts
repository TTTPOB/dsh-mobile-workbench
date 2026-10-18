export const COMPOSER_NS = 'mobileComposer'
export const zh = {
  expand: '展开编辑',
  collapse: '收起编辑',
  draft: '编辑草稿',
  done: '完成',
}
export type ComposerKey = keyof typeof zh
export const en: Record<ComposerKey, string> = {
  expand: 'Expand editor',
  collapse: 'Collapse editor',
  draft: 'Edit draft',
  done: 'Done',
}

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    mobileComposer: ComposerKey
  }
}
