import type { Context as ClientContext } from '@deepseek-ai/cordis'
import { installMobileEffect } from '../effects/phone-chrome.ts'
import { boundaryMutation, COMPOSER_BOUNDARY } from './dom-observation.ts'
import { composerEndpointReturn, composerHeightBudget, composerKeyboardOpen, composerNavigationRelease } from './composer-geometry.ts'
import { createComposerControls } from './composer-controls.ts'
import { createComposerFocus } from './composer-focus.ts'
import { composerTriggers } from './composer-session.ts'
import { COMPOSER_NS, en, zh } from './composer-locales.ts'

const CARD = '[data-composer-card]'
const INPUT = '[data-composer-input]'
const SCROLL = '[data-input-scroll]'
const MARKER = 'data-mobile-workbench-composer'
const EXPANDED = 'data-mobile-compose-expanded'
const KEYBOARD = 'data-mobile-workbench-keyboard'
const RETURNING = 'data-mobile-compose-returning'

/** Decorate the official Lexical card in place; never own draft or submit state. */
export function installWorkbenchComposer(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(COMPOSER_NS, { zh, en }), 'dsh-web-mobile: composer dictionaries')
  installMobileEffect(ctx, 'dsh-web-mobile: workbench composer', () => {
    const root = document.documentElement
    const oldMarkers = new Map([EXPANDED, KEYBOARD, RETURNING].map(key => [key, root.getAttribute(key)]))
    const properties = ['--mobile-compose-vv-height', '--mobile-compose-vv-top', '--mobile-compose-vv-left', '--mobile-compose-vv-width', '--mobile-compose-nav-release', '--mobile-compose-frame-max'] as const
    const oldProperties = properties.map(key => [key, root.style.getPropertyValue(key), root.style.getPropertyPriority(key)] as const)
    let card: HTMLElement | null = null
    let button: HTMLButtonElement | null = null
    let header: HTMLElement | null = null
    const decorations = new Map<HTMLElement, Map<string, string | null>>()
    const decorate = (element: HTMLElement, key: string, value: string | null): void => {
      if (element.getAttribute(key) === value) return
      let previous = decorations.get(element)
      if (!previous) decorations.set(element, previous = new Map())
      if (!previous.has(key)) previous.set(key, element.getAttribute(key))
      if (value === null) element.removeAttribute(key)
      else element.setAttribute(key, value)
    }
    let restoreCard: (() => void) | undefined
    let controls: ReturnType<typeof createComposerControls> | undefined
    let focus: ReturnType<typeof createComposerFocus> | undefined
    let expanded = false
    let frame = 0
    let width = window.innerWidth
    let baseline = window.visualViewport?.height ?? window.innerHeight
    const viewport = window.visualViewport
    let previousHeight = baseline
    let previousWidth = viewport?.width ?? window.innerWidth
    let previousBottom = baseline + (viewport?.offsetTop ?? 0)
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const resizeObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => schedule())

    const mark = (name: string, on: boolean): void => {
      if (on) {
        if (root.getAttribute(name) !== 'true') root.setAttribute(name, 'true')
      } else if (root.hasAttribute(name)) root.removeAttribute(name)
    }
    const cancelReturning = (): void => {
      if (!root.hasAttribute(RETURNING)) return
      mark(RETURNING, false)
      for (const animation of card?.closest<HTMLElement>('[data-mobile-nav="frame"]')?.getAnimations() ?? []) {
        if ('transitionProperty' in animation
          && (animation.transitionProperty === 'max-height' || animation.transitionProperty === 'padding-bottom')) animation.cancel()
      }
    }
    const setStyle = (element: HTMLElement, key: string, value: string): void => {
      if (element.style.getPropertyValue(key) !== value) element.style.setProperty(key, value)
    }
    const setExpanded = (value: boolean, keyboard = false, restoreFocus = true): void => {
      cancelReturning()
      expanded = value
      mark(EXPANDED, value)
      if (card) {
        if (value) card.setAttribute(EXPANDED, 'true')
        else card.removeAttribute(EXPANDED)
      }
      controls?.update(value)
      if (value) focus?.start(keyboard)
      else {
        focus?.stop()
        if (restoreFocus && button?.isConnected) button.focus({ preventScroll: true })
      }
      schedule()
    }
    const release = (): void => {
      cancelReturning()
      resizeObserver?.disconnect()
      focus?.stop()
      focus = undefined
      controls?.dispose()
      controls = undefined
      button?.remove()
      button = null
      header?.remove()
      header = null
      for (const [element, attributes] of decorations) {
        for (const [key, value] of attributes) {
          if (value === null) element.removeAttribute(key)
          else element.setAttribute(key, value)
        }
      }
      decorations.clear()
      restoreCard?.()
      restoreCard = undefined
      card = null
      setExpanded(false, false, false)
    }
    const attach = (next: HTMLElement): void => {
      release()
      card = next
      const attributes = [MARKER, EXPANDED, 'data-mobile-compose-overflow'].map(key => [key, next.getAttribute(key)] as const)
      const styles = ['--mobile-compose-input-max', '--mobile-compose-card-max'].map(key => [key, next.style.getPropertyValue(key), next.style.getPropertyPriority(key)] as const)
      restoreCard = () => {
        for (const [key, value] of attributes) {
          if (value === null) next.removeAttribute(key)
          else next.setAttribute(key, value)
        }
        for (const [key, value, priority] of styles) {
          if (value) next.style.setProperty(key, value, priority)
          else next.style.removeProperty(key)
        }
      }
      next.setAttribute(MARKER, 'true')
      controls = createComposerControls(ctx, keyboard => setExpanded(!expanded, keyboard))
      button = controls.button
      header = controls.header
      focus = createComposerFocus(next, controls.heading, controls.done)
      next.append(header)
      resizeObserver?.observe(next)
      const seat = next.closest<HTMLElement>('[data-composer-seat]')
      if (seat) resizeObserver?.observe(seat)
      const layoutFrame = next.closest<HTMLElement>('[data-mobile-nav="frame"]')
      if (layoutFrame) resizeObserver?.observe(layoutFrame)
    }
    const ensureControls = (): void => {
      if (!card || !button || !header) return
      const row = card.querySelector<HTMLElement>(':scope > [class*="_row"]:has([class*="_trailing"])')
      if (row) {
        decorate(row, 'data-mobile-compose-bar', 'true')
        // Reattach only plugin-owned children after a React lane replacement.
        if (button.parentElement !== card) card.append(button)
      } else button.remove()
      if (header.parentElement !== card) card.append(header)
    }
    const update = (): void => {
      frame = 0
      const next = Array.from(document.querySelectorAll<HTMLElement>(CARD)).find(candidate => candidate.querySelector(INPUT) && candidate.getBoundingClientRect().width > 0) ?? null
      if (next !== card) {
        if (next) attach(next)
        else release()
      }
      ensureControls()
      const height = viewport?.height ?? window.innerHeight
      const currentWidth = viewport?.width ?? window.innerWidth
      const scale = viewport?.scale ?? 1
      if (Math.abs(currentWidth - width) > 40 && Math.abs(scale - 1) < 0.05) {
        width = currentWidth
        baseline = height
      }
      if (Math.abs(scale - 1) < 0.05) baseline = Math.max(baseline, height, window.innerHeight)
      const keyboard = composerKeyboardOpen(baseline, height, scale)
      const bottom = height + (viewport?.offsetTop ?? 0)
      const layoutFrame = card?.closest<HTMLElement>('[data-mobile-nav="frame"]') ?? null
      const normal = !!layoutFrame && !expanded && !document.querySelector('[aria-modal="true"]')
      const duration = getComputedStyle(root).getPropertyValue('--ds-transition-duration').trim()
      const coarseReturn = normal && root.hasAttribute(KEYBOARD) && !keyboard && currentWidth === previousWidth
        && (viewport?.offsetTop ?? 0) === previousBottom - previousHeight
        && composerEndpointReturn(previousHeight, height, baseline, scale) && !reducedMotion.matches
        && (!duration || parseFloat(duration) > 0)
      if (coarseReturn) mark(RETURNING, true)
      else if (!normal || reducedMotion.matches || Math.abs(scale - 1) >= 0.05 || keyboard || height !== previousHeight || bottom !== previousBottom || currentWidth !== previousWidth) cancelReturning()
      previousHeight = height
      previousWidth = currentWidth
      previousBottom = bottom
      mark(KEYBOARD, keyboard)
      setStyle(root, properties[0], `${height}px`)
      setStyle(root, properties[1], `${viewport?.offsetTop ?? 0}px`)
      setStyle(root, properties[2], `${viewport?.offsetLeft ?? 0}px`)
      setStyle(root, properties[3], `${currentWidth}px`)
      setStyle(root, properties[4], `${composerNavigationRelease(baseline, height, scale)}px`)
      // Limit the normal frame to the visible bottom; browser panning already owns its top.
      setStyle(root, properties[5], Math.abs(scale - 1) < 0.05 ? `${height + (viewport?.offsetTop ?? 0)}px` : '100%')
      if (!card || expanded) return
      const scroll = card.querySelector<HTMLElement>(SCROLL)
      if (!scroll) return
      // Anchor the corner to writing, not the attachment rail above it.
      if (button) setStyle(button, 'top', `${Math.max(0, scroll.offsetTop - 8)}px`)
      const seat = card.closest<HTMLElement>('[data-composer-seat]')
      const conversation = card.closest<HTMLElement>('[data-conversation-content]')
      const top = Math.max(0, (conversation?.getBoundingClientRect().top ?? 80) - (viewport?.offsetTop ?? 0))
      const navValue = getComputedStyle(root).getPropertyValue('--mobile-workbench-nav-height')
      // The navigation effect owns padding. Resolve its possibly calc()-based variable.
      probeNode.style.height = navValue.trim() ? 'var(--mobile-workbench-nav-height)' : 'calc(56px + env(safe-area-inset-bottom, 0px))'
      const navHeight = probeNode.getBoundingClientRect().height
      // During a coarse return, budget from the painted frame, not the final viewport.
      const nav = layoutFrame ? Math.max(0, parseFloat(getComputedStyle(layoutFrame).paddingBottom) || 0) : navHeight
      const availableHeight = layoutFrame
        ? Math.min(height, Math.max(0, layoutFrame.getBoundingClientRect().bottom - (viewport?.offsetTop ?? 0))) : height
      const cardHeight = card.getBoundingClientRect().height
      const dock = Math.max(0, (seat?.getBoundingClientRect().height ?? cardHeight) - cardHeight)
      const chrome = Math.max(cardHeight, card.scrollHeight || cardHeight) - scroll.getBoundingClientRect().height
      const budget = composerHeightBudget(Math.max(100, availableHeight - top - nav - dock - 12), chrome)
      setStyle(card, '--mobile-compose-input-max', `${Math.floor(budget.input)}px`)
      setStyle(card, '--mobile-compose-card-max', `${Math.floor(budget.card)}px`)
      const overflow = chrome + 44 > budget.card
      if (overflow && !card.hasAttribute('data-mobile-compose-overflow')) card.setAttribute('data-mobile-compose-overflow', 'true')
      if (!overflow && card.hasAttribute('data-mobile-compose-overflow')) card.removeAttribute('data-mobile-compose-overflow')
    }
    function schedule(): void {
      if (!frame) frame = window.requestAnimationFrame(update)
    }
    // Observe host visibility changes too: the composer fallback can hide in place.
    // Idempotent CSS writes settle after one extra observer pass.
    const observer = new MutationObserver(records => {
      if (records.some(record => boundaryMutation(record, COMPOSER_BOUNDARY)
        || record.attributeName === 'data-workbench-trajectory'
        || (record.type === 'childList' && boundaryMutation(record, '[data-workbench-trajectory], [data-trajectory-scroll]', COMPOSER_BOUNDARY))
        || (record.type === 'attributes' && record.target instanceof Element
          && (record.target.contains(card) || record.attributeName === 'aria-modal'
            || (record.attributeName === 'data-phase' && record.target.querySelector(CARD) !== null))))) schedule()
    })
    // Outside body, so measurements cannot trigger the tree observer.
    const probeNode = document.createElement('div')
    probeNode.setAttribute('aria-hidden', 'true')
    probeNode.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;width:0'
    root.append(probeNode)
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'data-phase', 'aria-modal', 'class', 'data-workbench-trajectory'] })
    window.addEventListener('resize', schedule)
    viewport?.addEventListener('resize', schedule)
    viewport?.addEventListener('scroll', schedule)
    const onKey = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape' || !expanded || event.isComposing) return
      const triggers = composerTriggers(ctx)
      if (triggers?.menu.getSnapshot().open) {
        event.preventDefault()
        event.stopPropagation()
        triggers.dismiss()
        return
      }
      if (!document.querySelector('[role="menu"], [role="listbox"]')
        && !Array.from(document.querySelectorAll('[role="dialog"][aria-modal="true"]')).some(dialog => dialog !== card)) {
        event.preventDefault()
        event.stopPropagation()
        setExpanded(false)
      }
    }
    const onTransitionEnd = (event: TransitionEvent): void => {
      if ((event.propertyName === 'max-height' || event.propertyName === 'padding-bottom')
        && event.target === card?.closest('[data-mobile-nav="frame"]')) {
        mark(RETURNING, false)
        schedule()
      }
    }
    const onReducedMotion = (): void => {
      if (reducedMotion.matches) cancelReturning()
      schedule()
    }
    document.addEventListener('keydown', onKey, true)
    document.addEventListener('transitionend', onTransitionEnd, true)
    reducedMotion.addEventListener('change', onReducedMotion)
    schedule()
    return () => {
      observer.disconnect()
      probeNode.remove()
      window.removeEventListener('resize', schedule)
      viewport?.removeEventListener('resize', schedule)
      viewport?.removeEventListener('scroll', schedule)
      document.removeEventListener('keydown', onKey, true)
      document.removeEventListener('transitionend', onTransitionEnd, true)
      reducedMotion.removeEventListener('change', onReducedMotion)
      release()
      window.cancelAnimationFrame(frame)
      for (const [key, value] of oldMarkers) {
        if (value === null) root.removeAttribute(key)
        else root.setAttribute(key, value)
      }
      for (const [key, value, priority] of oldProperties) {
        if (value) root.style.setProperty(key, value, priority)
        else root.style.removeProperty(key)
      }
    }
  })
}
