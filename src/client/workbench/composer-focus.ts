export interface ComposerFocus {
  start(keyboard: boolean): void
  stop(): void
}

/** A focus scope for the existing expanded card and its native menu portals. */
export function createComposerFocus(card: HTMLElement, heading: HTMLElement, done: HTMLButtonElement): ComposerFocus {
  let active = false
  const originals = new Map(['role', 'aria-modal', 'aria-labelledby'].map(key => [key, card.getAttribute(key)]))
  const inert = new Map<HTMLElement, boolean>()
  const portals = (): HTMLElement[] => Array.from(card.querySelectorAll('[aria-controls]'))
    .flatMap(trigger => (trigger.getAttribute('aria-controls') ?? '').split(' '))
    .map(id => document.getElementById(id))
    .filter((node): node is HTMLElement => node !== null && node.getBoundingClientRect().width > 0)
  const roots = (): HTMLElement[] => [card, ...portals()]
  const nestedModal = (): boolean => Array.from(document.querySelectorAll('[aria-modal="true"]'))
    .some(node => node !== card && !card.contains(node) && node.getBoundingClientRect().width > 0)
  const restoreInert = (): void => {
    for (const [element, value] of inert) element.inert = value
    inert.clear()
  }
  const sync = (): void => {
    restoreInert()
    // A native image viewer or modal temporarily owns its own focus scope.
    if (!active || nestedModal()) return
    const allowed = roots()
    const visit = (parent: Element): void => {
      for (const element of parent.children) {
        if (!(element instanceof HTMLElement) || element.matches('script, style, link')) continue
        if (allowed.includes(element)) continue
        if (allowed.some(root => element.contains(root))) visit(element)
        else { inert.set(element, element.inert); element.inert = true }
      }
    }
    visit(document.body)
  }
  const focusable = (): HTMLElement[] => roots().flatMap(root => Array.from(root.querySelectorAll<HTMLElement>(
    'button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), a[href], [contenteditable="true"], [tabindex]:not([tabindex="-1"])',
  ))).filter(element => !element.closest('[inert]') && (element.tabIndex >= 0 || element.isContentEditable)
    && element.getClientRects().length > 0 && getComputedStyle(element).visibility !== 'hidden')
  const onKey = (event: KeyboardEvent): void => {
    if (event.key !== 'Tab' || event.isComposing || nestedModal()) return
    const items = focusable()
    if (!items.length) return
    const index = items.indexOf(document.activeElement as HTMLElement)
    const next = event.shiftKey ? (index <= 0 ? items.length - 1 : index - 1) : (index + 1) % items.length
    event.preventDefault()
    items[next]?.focus({ preventScroll: true })
  }
  const onFocus = (event: FocusEvent): void => {
    if (nestedModal() || !(event.target instanceof Node) || roots().some(root => root.contains(event.target as Node))) return
    done.focus({ preventScroll: true })
  }
  const observer = new MutationObserver(sync)
  const stop = (): void => {
    active = false
    observer.disconnect()
    document.removeEventListener('keydown', onKey, true)
    document.removeEventListener('focusin', onFocus, true)
    restoreInert()
    for (const [key, value] of originals) {
      if (value === null) card.removeAttribute(key)
      else card.setAttribute(key, value)
    }
  }
  return {
    start(keyboard: boolean): void {
      if (active) return
      active = true
      card.setAttribute('role', 'dialog')
      card.setAttribute('aria-modal', 'true')
      card.setAttribute('aria-labelledby', heading.id)
      observer.observe(document.body, { childList: true })
      observer.observe(card, { subtree: true, attributes: true, attributeFilter: ['aria-controls', 'aria-expanded'] })
      document.addEventListener('keydown', onKey, true)
      document.addEventListener('focusin', onFocus, true)
      sync()
      if (keyboard) done.focus({ preventScroll: true })
    },
    stop,
  }
}
