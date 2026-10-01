import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import { installMobileEffect } from '../effects/phone-chrome.ts'

// Pure geometry policy; visual viewport shrink, not focus, is keyboard evidence.
export function composerKeyboardOpen(baseline: number, height: number, scale: number): boolean {
  return Math.abs(scale - 1) < 0.05 && baseline - height > Math.max(120, baseline * 0.18)
}

export function composerHeightBudget(available: number, chrome: number): { input: number; card: number; context: number } {
  const context = Math.min(150, Math.max(48, available - chrome - 44))
  const card = Math.max(80, available - context)
  return { input: Math.max(44, Math.min(160, available * 0.3, card - chrome)), card, context }
}

// Only shorten recognized names; unknown permission states remain verbatim.
export function composerPermissionLabel(name: string): string | null {
  const state = name.replace(/^访问模式[，,:：]\s*当前[：:]\s*/, '').trim()
  if (/^(只读|仅可查看|Read[- ]only)$/i.test(state)) return '只读'
  if (/^(工作区内修改|工作区|Workspace(?: write)?)$/i.test(state)) return '工作区'
  if (/^(完全权限|Full access)$/i.test(state)) return '完全权限'
  return null
}

export function composerModelLabel(name: string): string {
  return name.trim().replace(/^(?:openai|anthropic|deepseek)\//i, '').replace(/^claude-/i, 'Claude ').replace(/^gpt-/i, 'GPT-')
}

const CARD = '[data-composer-card]'
const INPUT = '[data-composer-input]'
const SCROLL = '[data-input-scroll]'
const MARKER = 'data-mobile-workbench-composer'
const EXPANDED = 'data-mobile-compose-expanded'
const KEYBOARD = 'data-mobile-workbench-keyboard'

/** Decorate the official Lexical card in place; never own draft or submit state. */
export function installWorkbenchComposer(ctx: ClientContext): void {
  installMobileEffect(ctx, 'dsh-web-mobile: workbench composer', () => {
    const root = document.documentElement
    const oldMarkers = new Map([EXPANDED, KEYBOARD].map(key => [key, root.getAttribute(key)]))
    const properties = ['--mobile-compose-vv-height', '--mobile-compose-vv-top', '--mobile-compose-vv-left', '--mobile-compose-vv-width'] as const
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
    let removeButtonListeners: (() => void) | undefined
    let expanded = false
    let frame = 0
    let width = window.innerWidth
    let baseline = window.visualViewport?.height ?? window.innerHeight
    const viewport = window.visualViewport
    const resizeObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => schedule())

    const mark = (name: string, on: boolean): void => {
      if (on) {
        if (root.getAttribute(name) !== 'true') root.setAttribute(name, 'true')
      } else if (root.hasAttribute(name)) root.removeAttribute(name)
    }
    const setStyle = (element: HTMLElement, key: string, value: string): void => {
      if (element.style.getPropertyValue(key) !== value) element.style.setProperty(key, value)
    }
    const setExpanded = (value: boolean): void => {
      expanded = value
      mark(EXPANDED, value)
      if (card) {
        if (value) card.setAttribute(EXPANDED, 'true')
        else card.removeAttribute(EXPANDED)
      }
      if (button) {
        button.setAttribute('aria-label', value ? '收起编辑' : '展开编辑')
        button.title = value ? '收起编辑' : '展开编辑'
        button.setAttribute('aria-expanded', String(value))
      }
      schedule()
    }
    const release = (): void => {
      resizeObserver?.disconnect()
      removeButtonListeners?.()
      removeButtonListeners = undefined
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
      setExpanded(false)
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
      button = document.createElement('button')
      button.type = 'button'
      button.setAttribute('data-mobile-compose-toggle', '')
      button.setAttribute('aria-expanded', 'false')
      button.setAttribute('aria-label', '展开编辑')
      button.title = '展开编辑'
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      svg.setAttribute('viewBox', '0 0 24 24')
      svg.setAttribute('aria-hidden', 'true')
      svg.setAttribute('focusable', 'false')
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      path.setAttribute('d', 'M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5M3 3l6 6m12-6-6 6M3 21l6-6m12 6-6-6')
      svg.append(path)
      button.append(svg)
      header = document.createElement('div')
      header.setAttribute('data-mobile-compose-header', '')
      const heading = document.createElement('strong')
      heading.textContent = '编辑草稿'
      const done = document.createElement('button')
      done.type = 'button'
      done.textContent = '完成'
      done.setAttribute('aria-label', '收起编辑')
      done.title = '收起编辑'
      header.append(heading, done)
      // Keep the native selection, including an active IME composition, intact.
      const keepSelection = (event: Event): void => event.preventDefault()
      const toggle = (event: Event): void => {
        event.stopPropagation()
        setExpanded(!expanded)
      }
      const ownedButton = button
      ownedButton.addEventListener('pointerdown', keepSelection)
      ownedButton.addEventListener('mousedown', keepSelection)
      ownedButton.addEventListener('click', toggle)
      done.addEventListener('pointerdown', keepSelection)
      done.addEventListener('mousedown', keepSelection)
      done.addEventListener('click', toggle)
      removeButtonListeners = () => {
        ownedButton.removeEventListener('pointerdown', keepSelection)
        ownedButton.removeEventListener('mousedown', keepSelection)
        ownedButton.removeEventListener('click', toggle)
        done.removeEventListener('pointerdown', keepSelection)
        done.removeEventListener('mousedown', keepSelection)
        done.removeEventListener('click', toggle)
      }
      next.append(header)
      resizeObserver?.observe(next)
      const seat = next.closest<HTMLElement>('[data-composer-seat]')
      if (seat) resizeObserver?.observe(seat)
    }
    const ensureControls = (): void => {
      if (!card || !button || !header) return
      const row = card.querySelector<HTMLElement>(':scope > [class*="_row"]:has([class*="_trailing"])')
      if (row) {
        decorate(row, 'data-mobile-compose-bar', 'true')
        // Reattach only plugin-owned children after a React lane replacement.
        if (button.parentElement !== row) row.append(button)
      } else button.remove()
      if (header.parentElement !== card) card.append(header)
      const permission = card.querySelector<HTMLElement>('[data-slot="conversation.input.permission"] button')
      const permissionText = permission?.querySelector<HTMLElement>('[class*="_triggerLabel"]')
      if (permission && permissionText) {
        decorate(permissionText, 'data-mobile-compose-label', composerPermissionLabel(permission.getAttribute('aria-label') ?? permissionText.textContent ?? ''))
      }
      const model = card.querySelector<HTMLElement>('[data-slot="conversation.input.model"] button[aria-haspopup="menu"]')
      const modelText = model?.querySelector<HTMLElement>('[class*="_triggerLabel"]')
      if (modelText) {
        const full = modelText.textContent ?? ''
        const short = composerModelLabel(full)
        decorate(modelText, 'data-mobile-compose-label', short !== full.trim() ? short : null)
      }
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
      mark(KEYBOARD, composerKeyboardOpen(baseline, height, scale))
      setStyle(root, properties[0], `${height}px`)
      setStyle(root, properties[1], `${viewport?.offsetTop ?? 0}px`)
      setStyle(root, properties[2], `${viewport?.offsetLeft ?? 0}px`)
      setStyle(root, properties[3], `${currentWidth}px`)
      if (!card || expanded) return
      const scroll = card.querySelector<HTMLElement>(SCROLL)
      if (!scroll) return
      const seat = card.closest<HTMLElement>('[data-composer-seat]')
      const conversation = card.closest<HTMLElement>('[data-conversation-content]')
      const top = Math.max(0, (conversation?.getBoundingClientRect().top ?? 80) - (viewport?.offsetTop ?? 0))
      const navValue = getComputedStyle(root).getPropertyValue('--mobile-workbench-nav-height')
      // The navigation effect owns padding. Resolve its possibly calc()-based variable.
      probeNode.style.height = navValue.trim() ? 'var(--mobile-workbench-nav-height)' : 'calc(56px + env(safe-area-inset-bottom, 0px))'
      const navHeight = probeNode.getBoundingClientRect().height
      const nav = root.hasAttribute(KEYBOARD) ? 0 : navHeight
      const cardHeight = card.getBoundingClientRect().height
      const dock = Math.max(0, (seat?.getBoundingClientRect().height ?? cardHeight) - cardHeight)
      const chrome = Math.max(cardHeight, card.scrollHeight || cardHeight) - scroll.getBoundingClientRect().height
      const budget = composerHeightBudget(Math.max(100, height - top - nav - dock - 12), chrome)
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
    const observer = new MutationObserver(schedule)
    // Outside body, so measurements cannot trigger the tree observer.
    const probeNode = document.createElement('div')
    probeNode.setAttribute('aria-hidden', 'true')
    probeNode.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;width:0'
    root.append(probeNode)
    observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['style', 'data-phase', 'aria-label', 'class'] })
    window.addEventListener('resize', schedule)
    viewport?.addEventListener('resize', schedule)
    viewport?.addEventListener('scroll', schedule)
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape' && expanded && !event.isComposing && !document.querySelector('[role="dialog"][aria-modal="true"], [role="menu"], [role="listbox"]')) {
        event.preventDefault()
        event.stopPropagation()
        setExpanded(false)
      }
    }
    document.addEventListener('keydown', onKey, true)
    schedule()
    return () => {
      observer.disconnect()
      probeNode.remove()
      window.removeEventListener('resize', schedule)
      viewport?.removeEventListener('resize', schedule)
      viewport?.removeEventListener('scroll', schedule)
      document.removeEventListener('keydown', onKey, true)
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
