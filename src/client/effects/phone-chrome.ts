import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'

export { detectIosWebKit, installPhoneChrome, STABLE_VIEWPORT_VAR } from './phone-viewport.ts'

/** Mobile adaptation is restricted to touch-primary viewports below 1024px. */
export const MOBILE_QUERY = '(max-width: 1023px) and (pointer: coarse)'
export const DESKTOP_QUERY = '(min-width: 1024px)'
export const TOUCH_QUERY = '(pointer: coarse)'

/** Own a breakpoint-scoped effect and dispose it before rearming. */
export function installMobileEffect(
  ctx: ClientContext,
  label: string,
  install: (narrow: MediaQueryList) => (() => void) | undefined,
  query: string = MOBILE_QUERY,
): void {
  ctx.effect(() => {
    const narrow = window.matchMedia(query)
    let cleanup: (() => void) | undefined
    const arm = (): void => {
      cleanup?.()
      cleanup = narrow.matches ? install(narrow) : undefined
    }
    arm()
    narrow.addEventListener('change', arm)
    return () => {
      narrow.removeEventListener('change', arm)
      cleanup?.()
    }
  }, label)
}

export function findFrame(): HTMLElement | null {
  return document.querySelector('[data-shell-overlay]')?.parentElement ?? null
}

export function getFrame(): HTMLElement | null {
  return document.querySelector('[data-mobile-nav="frame"]') ?? findFrame()
}

/** Workbench pages use the host sidebar state, with no drawer animation. */
export function toggleDrawer(ctx: ClientContext): void {
  ctx.layout.toggleSidebar()
}
