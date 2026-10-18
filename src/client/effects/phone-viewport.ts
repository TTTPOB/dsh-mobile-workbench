import type { Context as ClientContext } from '@deepseek-ai/cordis'
import { installMobileEffect } from './phone-chrome.ts'

/** iOS text fields need the stylesheet font-size floor to avoid focus zoom. */
export function detectIosWebKit(
  nav: { userAgent: string; maxTouchPoints: number },
  supports: ((condition: string) => boolean) | null,
): boolean {
  if (supports !== null) {
    try {
      if (supports('(font: -apple-system-body) and (-webkit-touch-callout: none)')) return true
    } catch {
      // Fall back to the UA when the CSS probe is unavailable.
    }
  }
  if (/iP(hone|ad|od)/.test(nav.userAgent)) return true
  return /Macintosh/.test(nav.userAgent) && nav.maxTouchPoints > 1
}

const IOS_MARKER = 'data-mobile-nav-ios'
// Safe-area support must not disable user pinch zoom.
const VIEWPORT_CONTENT = 'width=device-width, initial-scale=1, viewport-fit=cover'
export const STABLE_VIEWPORT_VAR = '--dsh-web-mobile-vh'
const findViewportMeta = (): HTMLMetaElement | null =>
  document.querySelector<HTMLMetaElement>('meta[name="viewport"]')

/** Own viewport-fit and keyboard-less modal height; the Host owns theme-color. */
export function installPhoneChrome(ctx: ClientContext): void {
  installMobileEffect(ctx, 'dsh-web-mobile: viewport + zoom guard', () => {
    const root = document.documentElement
    let originalViewport: string | null = null
    let observedMeta: HTMLMetaElement | null = null
    const assertViewport = (): void => {
      const viewport = findViewportMeta()
      if (viewport === null) return
      if (originalViewport === null) originalViewport = viewport.content
      if (viewport.content !== VIEWPORT_CONTENT) viewport.content = VIEWPORT_CONTENT
    }
    const metaObserver = new MutationObserver(assertViewport)
    const attachMetaObserver = (): void => {
      const viewport = findViewportMeta()
      if (viewport === observedMeta) return
      metaObserver.disconnect()
      observedMeta = viewport
      if (viewport !== null) metaObserver.observe(viewport, { attributes: true, attributeFilter: ['content'] })
    }
    // The host may rewrite or replace its viewport meta after initial mount.
    const headObserver = new MutationObserver(() => { attachMetaObserver(); assertViewport() })
    headObserver.observe(document.head, { childList: true })
    attachMetaObserver()
    assertViewport()
    const cssSupports = typeof CSS !== 'undefined' && typeof CSS.supports === 'function'
      ? (condition: string): boolean => CSS.supports(condition) : null
    if (detectIosWebKit(navigator, cssSupports)) root.setAttribute(IOS_MARKER, '')

    // Android adjustResize changes all viewport units with the keyboard.
    // Keep modal height stable until growth or a real width/rotation change.
    let stableVh = 0
    let stableWidth = 0
    const syncStableViewport = (): void => {
      const height = window.innerHeight
      const width = window.innerWidth
      if (stableVh === 0 || height > stableVh || width !== stableWidth) {
        stableVh = height
        stableWidth = width
        root.style.setProperty(STABLE_VIEWPORT_VAR, `${height}px`)
      }
    }
    syncStableViewport()
    window.addEventListener('resize', syncStableViewport)
    return () => {
      window.removeEventListener('resize', syncStableViewport)
      root.style.removeProperty(STABLE_VIEWPORT_VAR)
      metaObserver.disconnect()
      headObserver.disconnect()
      const viewport = findViewportMeta()
      if (viewport !== null && originalViewport !== null && viewport.content === VIEWPORT_CONTENT) {
        viewport.content = originalViewport
      }
      root.removeAttribute(IOS_MARKER)
    }
  })
}
