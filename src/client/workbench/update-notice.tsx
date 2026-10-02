import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import { MOBILE_QUERY } from '../effects/phone-chrome.ts'
import { WORKBENCH_UPDATE_NOTICE_CSS } from '../styles/workbench-update-notice.css.ts'
import { createUpdateNoticeState, type ClientSyncSnapshot } from './update-notice-state.ts'

const NS = 'mobileWorkbenchRecovery' as const
const zh = { failed: '组件更新未能应用', reload: '重新加载', dismiss: '关闭提示' }
const en: Record<keyof typeof zh, string> = { failed: 'Component update could not be applied', reload: 'Reload', dismiss: 'Dismiss notice' }
declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap { mobileWorkbenchRecovery: keyof typeof zh }
}
interface RecoveryInjected {
  hooks: { recovery: { getSnapshot: () => boolean; subscribe: (listener: () => void) => () => void } }
  dismiss: () => void
  reload: () => void
}
type Props = PropsRuntime<'shell.overlay'> & InjectFace<RecoveryInjected> & PropsLocale<typeof NS>

function UpdateNotice({ useRecovery, dismiss, reload, t }: Props) {
  const visible = useRecovery(value => value)
  if (!visible) return null
  return <aside data-mobile-workbench="update-notice" role="status">
    <span>{t('failed')}</span>
    <button type="button" onClick={reload}>{t('reload')}</button>
    <button type="button" aria-label={t('dismiss')} onClick={dismiss}>×</button>
  </aside>
}

/** Add a manual recovery action without changing the native module replacement controller. */
export function installWorkbenchUpdateNotice(ctx: ClientContext): void {
  ctx.inject(['modules'], child => {
    const scoped = child as ClientContext
    // This structural face mirrors rc.2's public entries.state; it carries no revision tables.
    const modules = scoped.get('modules') as {
      entries: { state: { getSnapshot: () => ClientSyncSnapshot; subscribe: (listener: () => void) => () => void } }
    }
    scoped.effect(() => scoped.locale.register(NS, { zh, en }), 'mobile-workbench: recovery dictionary')
    const state = createUpdateNoticeState()
    const mq = window.matchMedia(MOBILE_QUERY)
    let visible = false
    const listeners = new Set<() => void>()
    const refresh = (): void => {
      const next = state.update(modules.entries.state.getSnapshot()) && mq.matches
      if (next === visible) return
      visible = next
      for (const listener of listeners) listener()
    }
    const source = {
      getSnapshot: () => visible,
      subscribe(listener: () => void): () => void {
        listeners.add(listener)
        return () => { listeners.delete(listener) }
      },
    }
    scoped.effect(() => {
      const style = document.createElement('style')
      style.dataset.pluginCss = 'dsh-web-mobile/update-notice.css'
      style.textContent = WORKBENCH_UPDATE_NOTICE_CSS
      document.head.appendChild(style)
      const stop = modules.entries.state.subscribe(refresh)
      mq.addEventListener('change', refresh)
      refresh()
      return () => {
        stop()
        mq.removeEventListener('change', refresh)
        style.remove()
        listeners.clear()
      }
    }, 'mobile-workbench: recovery status')
    scoped.slots.inject('shell.overlay', () => scoped.slots.register({
      name: 'shell.overlay', id: 'mobile-workbench-update-notice', order: 25, locale: NS,
      inject: () => ({
        hooks: { recovery: source },
        dismiss: () => { state.dismiss(); refresh() },
        reload: () => { window.location.reload() },
      }),
    }, UpdateNotice))
  })
}
