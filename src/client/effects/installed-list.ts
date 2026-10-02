import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import { MOBILE_QUERY } from './phone-chrome.ts'
import { createRafScheduler } from '../core/raf-scheduler.ts'

/**
 * Hard-fix the installed-plugins list text layout: the host market UI
 * injects its own CSS after this plugin's stylesheet, so CSS overrides can
 * be beaten. Inline !important styles win over every external rule. Keep
 * the selector on outer rows only; irowActions/irowTrailing are nested
 * flex containers and must retain the market's own action geometry.
 */
export function installInstalledListStyles(ctx: ClientContext): void {
  ctx.effect(() => {
    const mq = window.matchMedia(MOBILE_QUERY)
    const rowSelector = '[class*="irow"]:not([class*="irowActions"]):not([class*="irowTrailing"])'
    const set = (el: HTMLElement, props: Record<string, string>): void => {
      for (const [key, value] of Object.entries(props)) {
        el.style.setProperty(key, value, 'important')
      }
    }
    const unset = (el: HTMLElement, props: readonly string[]): void => {
      for (const key of props) el.style.removeProperty(key)
    }
    const rowProps = ['flex-wrap', 'align-items', 'gap'] as const
    const firstProps = ['flex', 'max-width', 'min-width'] as const
    const textProps = ['white-space', 'overflow', 'text-overflow', 'max-width'] as const
    const clear = (): void => {
      document.querySelectorAll<HTMLElement>(rowSelector).forEach((row) => {
        unset(row, rowProps)
        const first = row.children[0] as HTMLElement | undefined
        if (first) unset(first, firstProps)
        row.querySelectorAll<HTMLElement>(':scope > button, :scope > [class*="owner"], :scope > [class*="grow"]').forEach((el) => {
          unset(el, ['order'])
        })
        const spec = row.querySelector<HTMLElement>('[class*="spec"]')
        const nm = row.querySelector<HTMLElement>('[class*="nm"]')
        if (spec) unset(spec, textProps)
        if (nm) unset(nm, textProps)
      })
    }
    const apply = (): void => {
      // The market rows only exist while the market UI is mounted (inside a
      // settings dialog). Skip the full-document class-substring scan on every
      // streamed mutation frame with no dialog open; dshmarket keeps the
      // data-dsh-market-root marker (1.20.x), [role="dialog"] covers the
      // settings dialog generically so a marker change degrades to cost, not
      // to a silently dead effect.
      if (document.querySelector('[data-dsh-market-root], [role="dialog"]') === null) return
      document.querySelectorAll<HTMLElement>(rowSelector).forEach((row) => {
        set(row, {
          'flex-wrap': 'wrap',
          'align-items': 'center',
          'gap': '4px 10px',
        })
        const first = row.children[0] as HTMLElement | undefined
        if (first) {
          set(first, {
            'flex': '1 1 100%',
            'max-width': '100%',
            'min-width': '0',
          })
        }
        const spec = row.querySelector<HTMLElement>('[class*="spec"]')
        const nm = row.querySelector<HTMLElement>('[class*="nm"]')
        if (spec) {
          set(spec, {
            'white-space': 'nowrap',
            'overflow': 'hidden',
            'text-overflow': 'ellipsis',
            'max-width': '100%',
          })
        }
        if (nm) {
          set(nm, {
            'white-space': 'nowrap',
            'overflow': 'hidden',
            'text-overflow': 'ellipsis',
            'max-width': '100%',
          })
        }
      })
    }
    const arm = (): void => {
      clear()
      if (mq.matches) apply()
    }
    arm()
    // Streaming floods this observer with document-wide childList batches;
    // coalesce to one apply per frame and re-check the breakpoint at flush
    // time so a queued callback never writes mobile styles on desktop.
    const scheduler = createRafScheduler(
      (cb) => window.requestAnimationFrame(cb),
      (id) => window.cancelAnimationFrame(id),
    )
    const mo = new MutationObserver(() => {
      if (mq.matches) scheduler.schedule(() => { if (mq.matches) apply() })
    })
    mo.observe(document.documentElement, { childList: true, subtree: true })
    mq.addEventListener('change', arm)
    return () => {
      scheduler.cancel()
      mo.disconnect()
      mq.removeEventListener('change', arm)
      clear()
    }
  }, 'dsh-web-mobile: installed-list-inline-styles')
}
