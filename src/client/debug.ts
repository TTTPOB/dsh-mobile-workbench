import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import { MOBILE_QUERY } from './effects/phone-chrome.ts'

/** Display local viewport and page diagnostics with ?mobile-nav-debug=1. */
export function installDebugBadge(ctx: ClientContext): void {
  ctx.effect(() => {
    if (!new URLSearchParams(location.search).has('mobile-nav-debug')) return () => {}
    const badge = document.createElement('div')
    badge.setAttribute('data-mobile-workbench', 'debug')
    badge.style.cssText = 'position:fixed;top:40px;right:6px;z-index:2147483000;background:rgba(0,0,0,.82);color:#fff;font:11px/1.5 ui-monospace,monospace;padding:8px 10px;border-radius:8px;max-width:94vw;white-space:pre-wrap;pointer-events:none'
    const errors: string[] = []
    const paint = (): void => {
      const root = document.documentElement
      const frame = document.querySelector<HTMLElement>('[data-mobile-nav="frame"]')
      const panel = document.querySelector<HTMLElement>('[data-sidebar-right-panel]')
      const viewport = window.visualViewport
      const rectangle = panel?.getBoundingClientRect()
      badge.textContent = [
        'Mobile Workbench',
        `${innerWidth} × ${innerHeight} · DPR ${devicePixelRatio} · mobile ${matchMedia(MOBILE_QUERY).matches}`,
        `page ${root.getAttribute('data-mobile-workbench-page') ?? 'desktop'} · keyboard ${root.hasAttribute('data-mobile-workbench-keyboard')}`,
        `safe top ${frame ? getComputedStyle(frame).paddingTop : 'n/a'}`,
        `viewport ${viewport ? Math.round(viewport.width) + ' × ' + Math.round(viewport.height) + ' @ ' + Math.round(viewport.offsetTop) : 'n/a'}`,
        `workspace ${rectangle ? Math.round(rectangle.width) + ' × ' + Math.round(rectangle.height) : 'closed'}`,
        `errors ${errors.join(' | ') || 'none'}`,
      ].join('\n')
    }
    const record = (message: string): void => {
      errors.push(message.slice(0, 120))
      if (errors.length > 5) errors.shift()
      paint()
    }
    const onError = (event: ErrorEvent): void => record(event.message)
    const onRejection = (event: PromiseRejectionEvent): void => record(String(event.reason))
    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onRejection)
    document.body.append(badge)
    paint()
    const timer = window.setInterval(paint, 1500)
    return () => {
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onRejection)
      window.clearInterval(timer)
      badge.remove()
    }
  }, 'dsh-web-mobile: debug badge')
}
