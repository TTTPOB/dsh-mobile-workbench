import type { Context as ClientContext } from '@deepseek-ai/cordis'
import { installMobileEffect } from './phone-chrome.ts'
import { createRafScheduler } from '../core/raf-scheduler.ts'

const MARKET = '[data-dsh-market-root]'
const ROW = '[class*="irow"]:not([class*="irowActions"]):not([class*="irowTrailing"])'

/** Keep optional market overrides local and restore the inline values we replace. */
export function installInstalledListStyles(ctx: ClientContext): void {
  installMobileEffect(ctx, 'dsh-web-mobile: installed-list-inline-styles', () => {
    const originals = new Map<HTMLElement, Map<string, { value: string; priority: string }>>()
    const roots = new Map<HTMLElement, MutationObserver>()
    const scheduler = createRafScheduler(
      cb => window.requestAnimationFrame(cb),
      id => window.cancelAnimationFrame(id),
    )
    const set = (element: HTMLElement, properties: Record<string, string>): void => {
      let saved = originals.get(element)
      if (!saved) originals.set(element, saved = new Map())
      for (const [key, value] of Object.entries(properties)) {
        if (!saved.has(key)) saved.set(key, { value: element.style.getPropertyValue(key), priority: element.style.getPropertyPriority(key) })
        element.style.setProperty(key, value, 'important')
      }
    }
    const clear = (): void => {
      for (const [element, properties] of originals) {
        for (const [key, original] of properties) {
          if (original.value) element.style.setProperty(key, original.value, original.priority)
          else element.style.removeProperty(key)
        }
      }
      originals.clear()
    }
    const apply = (): void => {
      for (const root of roots.keys()) {
        for (const row of root.querySelectorAll<HTMLElement>(ROW)) {
          set(row, { 'flex-wrap': 'wrap', 'align-items': 'center', gap: '4px 10px' })
          const first = row.firstElementChild
          if (first instanceof HTMLElement) set(first, { flex: '1 1 100%', 'max-width': '100%', 'min-width': '0' })
          for (const text of row.querySelectorAll<HTMLElement>('[class*="spec"], [class*="nm"]')) {
            set(text, { 'white-space': 'nowrap', overflow: 'hidden', 'text-overflow': 'ellipsis', 'max-width': '100%' })
          }
        }
      }
    }
    const syncRoots = (): void => {
      const next = new Set(document.querySelectorAll<HTMLElement>(MARKET))
      if (next.size === roots.size && [...next].every(root => roots.has(root))) return
      clear()
      for (const [root, observer] of roots) {
        if (!next.has(root)) { observer.disconnect(); roots.delete(root) }
      }
      for (const root of next) {
        if (roots.has(root)) continue
        const observer = new MutationObserver(() => scheduler.schedule(apply))
        observer.observe(root, { childList: true, subtree: true })
        roots.set(root, observer)
      }
      apply()
    }
    // Discovery examines only mounted/removed boundary nodes, not streamed text.
    const mounts = new MutationObserver(records => {
      if (records.some(record => [...record.addedNodes, ...record.removedNodes].some(node =>
        node instanceof Element && (node.matches(MARKET) || node.querySelector(MARKET) !== null),
      ))) syncRoots()
    })
    mounts.observe(document.body, { childList: true, subtree: true })
    syncRoots()
    return () => {
      scheduler.cancel()
      mounts.disconnect()
      for (const observer of roots.values()) observer.disconnect()
      roots.clear()
      clear()
    }
  })
}
