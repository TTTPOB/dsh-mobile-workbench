import type { Context as ClientContext } from '@deepseek-ai/cordis'
import { installMobileEffect } from './phone-chrome.ts'

/** Model menus follow their native trigger's aria-controls, never a CSS-module hash. */
const MODEL_TRIGGER = '[data-slot="conversation.input.model"] button[aria-haspopup="menu"]'

/** Center the menu over the native composer card. */
const COMPOSER_CARD = '[data-composer-card]'

/** Minimum viewport gutter. */
const GUTTER = 8

/** Native open animation may measure again during these delays. */
const SETTLE_MS = [0, 60, 200]

export function installModelMenuAnchor(ctx: ClientContext): void {
  installMobileEffect(ctx, 'dsh-web-mobile: model menu anchor', () => {
    let raf = 0
    const timers: number[] = []
    // Cache only the open portal for viewport updates.
    let active: HTMLElement | null = null
    const originalLeft = new Map<HTMLElement, { value: string; priority: string }>()
    const restoreLeft = (menu: HTMLElement): void => {
      const original = originalLeft.get(menu)
      if (!original) return
      if (original.value) menu.style.setProperty('left', original.value, original.priority)
      else menu.style.removeProperty('left')
      originalLeft.delete(menu)
    }

    const laidOut = (el: Element | null): DOMRect | null => {
      if (el === null) return null
      const box = el.getBoundingClientRect()
      return box.width > 0 && box.height > 0 ? box : null
    }

    // Resolve menus only after interactions with the model seat.
    const findMenu = (): HTMLElement | null => {
      for (const trigger of document.querySelectorAll<HTMLElement>(MODEL_TRIGGER)) {
        const id = trigger.getAttribute('aria-controls')
        const menu = id === null ? null : document.getElementById(id)
        if (menu !== null && laidOut(menu) !== null) return menu
      }
      return null
    }

    // Write only left; native code still owns vertical placement.
    const place = (menu: HTMLElement): void => {
      const menuBox = laidOut(menu)
      if (menuBox === null) return
      const width = menuBox.width
      const viewport = document.documentElement.clientWidth
      const max = Math.max(GUTTER, viewport - width - GUTTER)
      const card = document.querySelector<HTMLElement>(COMPOSER_CARD)
      const cardBox = card === null ? null : card.getBoundingClientRect()
      const trigger = cardBox !== null && cardBox.width > 0 ? null : document.querySelector<HTMLElement>(MODEL_TRIGGER)
      const triggerBox = trigger === null ? null : trigger.getBoundingClientRect()
      const center = cardBox !== null && cardBox.width > 0
        ? cardBox.left + cardBox.width / 2
        : triggerBox === null ? null : triggerBox.left + triggerBox.width / 2
      if (center === null) return
      const left = Math.min(Math.max(center - width / 2, GUTTER), max)
      const next = `${Math.round(left)}px`
      // Do not rewrite an unchanged position.
      if (menu.style.left !== next) {
        if (!originalLeft.has(menu)) originalLeft.set(menu, { value: menu.style.getPropertyValue('left'), priority: menu.style.getPropertyPriority('left') })
        menu.style.left = next
      }
    }

    // Refresh the cached portal after native activation.
    const refresh = (): void => {
      const next = findMenu()
      if (active !== null && active !== next) restoreLeft(active)
      active = next
      if (active !== null) place(active)
    }

    // Viewport changes reuse the active portal.
    const follow = (): void => {
      if (active === null) return
      if (laidOut(active) === null) {
        restoreLeft(active)
        active = null
        return
      }
      place(active)
    }

    const schedule = (run: () => void): void => {
      if (raf !== 0) return
      raf = window.requestAnimationFrame(() => {
        raf = 0
        run()
      })
    }

    // Settle after the native opening measurements.
    const scheduleRefresh = (): void => {
      schedule(refresh)
      for (const delay of SETTLE_MS) timers.push(window.setTimeout(() => schedule(refresh), delay))
      // Bound pending callbacks during repeated interaction.
      while (timers.length > SETTLE_MS.length * 2) {
        const stale = timers.shift()
        if (stale !== undefined) window.clearTimeout(stale)
      }
    }

    // Ignore unrelated controls and menus.
    const touchesMenu = (event: Event): boolean => {
      const target = event.target
      if (!(target instanceof Element)) return false
      return target.closest(MODEL_TRIGGER) !== null || active?.contains(target) === true
    }

    const onPointerDown = (event: Event): void => {
      if (touchesMenu(event)) scheduleRefresh()
    }
    // Include keyboard, accessibility, and synthetic clicks.
    const onKeyDown = (event: Event): void => {
      if (touchesMenu(event)) scheduleRefresh()
    }
    const onFocusIn = (event: Event): void => {
      if (touchesMenu(event)) scheduleRefresh()
    }
    const onClick = (event: Event): void => {
      if (touchesMenu(event)) scheduleRefresh()
    }
    // Viewport updates never search for menus.
    const onViewportChange = (): void => {
      schedule(follow)
    }

    document.addEventListener('pointerdown', onPointerDown, true)
    document.addEventListener('keydown', onKeyDown, true)
    document.addEventListener('focusin', onFocusIn, true)
    document.addEventListener('click', onClick, true)
    window.addEventListener('resize', onViewportChange)
    document.addEventListener('scroll', onViewportChange, true)

    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true)
      document.removeEventListener('keydown', onKeyDown, true)
      document.removeEventListener('focusin', onFocusIn, true)
      document.removeEventListener('click', onClick, true)
      window.removeEventListener('resize', onViewportChange)
      document.removeEventListener('scroll', onViewportChange, true)
      if (raf !== 0) window.cancelAnimationFrame(raf)
      for (const timer of timers) window.clearTimeout(timer)
      timers.length = 0
      for (const menu of originalLeft.keys()) restoreLeft(menu)
      active = null
    }
  })
}
