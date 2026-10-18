import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type { SessionListState } from '@deepseek-ai/dsh-api-session-controller/client'
import { currentSessionIdOf } from '../core/sessions-compat.ts'
import { installMobileEffect } from '../effects/phone-chrome.ts'
import { WORKBENCH_NS } from './locales.ts'

/** Read the selection at activation time, including a selected child session. */
export async function copyCurrentSessionId(snapshot: unknown, clipboard: Pick<Clipboard, 'writeText'> | undefined): Promise<boolean> {
  const id = currentSessionIdOf(snapshot)
  if (!id || !clipboard) return false
  try {
    await clipboard.writeText(id)
    return true
  } catch {
    // Clipboard permission and insecure-origin failures are visible in the menu.
    return false
  }
}

/** Read immutable preset metadata from the selected public summary. */
export function currentSessionPreset(snapshot: SessionListState): string {
  const id = currentSessionIdOf(snapshot)
  const preset = id ? (snapshot.byId[id]?.projectionValues as { agentPreset?: string | null } | undefined)?.agentPreset : undefined
  return typeof preset === 'string' ? preset : '—'
}

/** Extend only the official, in-place Session Header menu; keep its native rows intact. */
export function installWorkbenchSessionMenu(ctx: ClientContext, resolvePreset: (id: string | undefined) => Promise<string>): void {
  installMobileEffect(ctx, 'dsh-web-mobile: copy session id', () => {
    const t = ctx.locale.bind(WORKBENCH_NS)
    // The public raw-namespace overload reads the native download menu label.
    const hostNamespace: string = 'session-log-download'
    const hostT = ctx.locale.bind(hostNamespace)
    let frame = 0
    let disposed = false
    let menu: HTMLElement | null = null
    let row: HTMLElement | null = null
    let presetInfo: HTMLElement | null = null
    let presetRead: { menu: HTMLElement; session: string | undefined; preset: string; locale: string } | null = null
    let presetName = '—'
    let removeClick: (() => void) | undefined
    let wrapper: Element | null = null
    const observer = new MutationObserver(() => schedule())

    const release = (): void => {
      removeClick?.()
      removeClick = undefined
      row?.remove()
      presetInfo?.remove()
      row = null
      presetInfo = null
      presetRead = null
      menu = null
    }
    const ensure = (): void => {
      frame = 0
      // HeaderAction does not portal this menu. The wrapper is the ownership
      // check; a download label in some unrelated menu is never sufficient.
      const trigger = document.querySelector<HTMLButtonElement>('header button[class*="_moreButton"][aria-haspopup="menu"][aria-expanded="true"]')
      const nextWrapper = trigger?.parentElement ?? null
      if (nextWrapper !== wrapper) {
        observer.disconnect()
        wrapper = nextWrapper
        if (wrapper) observer.observe(wrapper, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-expanded'] })
      }
      const next = nextWrapper?.querySelector<HTMLElement>(':scope > [role="menu"]') ?? null
      const native = next ? Array.from(next.querySelectorAll<HTMLButtonElement>('button[role="menuitem"]')).find(item => item.textContent?.trim() === hostT('menu.download')) : undefined
      if (!next || !native) { release(); return }
      const snapshot = ctx.sessions.list.getSnapshot()
      const preset = currentSessionPreset(snapshot)
      const session = currentSessionIdOf(snapshot)
      const locale = t('modeUnavailable')
      if (presetRead?.menu !== next || presetRead.session !== session || presetRead.preset !== preset || presetRead.locale !== locale) {
        const read = { menu: next, session, preset, locale }
        presetRead = read
        presetName = '—'
        void resolvePreset(preset).then(name => {
          if (!disposed && presetRead === read) { presetName = name; schedule() }
        })
      }
      const presetText = t('presetReadOnly', { name: presetName })
      if (menu === next && row && presetInfo && next.contains(row) && next.contains(presetInfo)) {
        if (presetInfo && presetInfo.textContent !== presetText) { presetInfo.textContent = presetText; presetInfo.setAttribute('title', presetText) }
        return
      }
      removeClick?.()
      row?.remove()
      presetInfo?.remove()
      menu = next
      const labelTemplate = native.querySelector<HTMLElement>('[class*="_itemLabel"]')
      row = document.createElement('div')
      row.setAttribute('data-mobile-workbench-session-copy', '')
      row.className = native.parentElement?.className ?? ''
      const button = document.createElement('button')
      button.type = 'button'
      button.setAttribute('role', 'menuitem')
      button.className = native.className
      const label = document.createElement('span')
      label.className = labelTemplate?.className ?? ''
      label.textContent = t('copySessionId')
      const icon = document.createElement('span')
      icon.className = native.querySelector<HTMLElement>('[class*="_itemIcon"]')?.className ?? ''
      icon.setAttribute('aria-hidden', 'true')
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      svg.setAttribute('viewBox', '0 0 16 16')
      svg.setAttribute('width', '16')
      svg.setAttribute('height', '16')
      svg.setAttribute('fill', 'none')
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      const copyPath = 'M5.5 5.5h8v8h-8zM10.5 5.5v-3h-8v8h3'
      path.setAttribute('d', copyPath)
      path.setAttribute('stroke', 'currentColor')
      path.setAttribute('stroke-width', '1.25')
      path.setAttribute('stroke-linejoin', 'round')
      svg.append(path)
      icon.append(svg)
      button.append(icon, label)
      const status = document.createElement('span')
      status.setAttribute('role', 'status')
      status.setAttribute('aria-live', 'polite')
      status.className = labelTemplate?.className ?? ''
      status.hidden = true
      presetInfo = document.createElement('div')
      presetInfo.setAttribute('data-mobile-workbench-session-preset', '')
      presetInfo.setAttribute('role', 'note')
      presetInfo.textContent = presetText
      presetInfo.setAttribute('title', presetText)
      row.append(button, status)
      // Append to the native row's items container, not its React-owned row.
      native.parentElement?.parentElement?.append(row, presetInfo)
      let pending = false
      const onClick = async (): Promise<void> => {
        if (pending) return
        pending = true
        button.disabled = true
        const copied = await copyCurrentSessionId(ctx.sessions.list.getSnapshot(), navigator.clipboard)
        pending = false
        if (disposed || menu !== next || !row?.contains(button)) return
        button.disabled = false
        path.setAttribute('d', copied ? 'M3 8l3 3 7-7' : copyPath)
        button.setAttribute('aria-label', t(copied ? 'copySessionIdSuccess' : 'copySessionId'))
        status.textContent = copied ? '' : t('copySessionIdFailure')
        status.hidden = copied
      }
      button.addEventListener('click', onClick)
      removeClick = () => button.removeEventListener('click', onClick)
    }
    const schedule = (): void => {
      if (!frame) frame = window.requestAnimationFrame(ensure)
    }
    // Observe the wrapper only while open. Schedule after native activation,
    // including ArrowDown; the host still owns all keyboard/menu state.
    const onClick = (event: Event): void => {
      if (event.target instanceof Element && event.target.closest('header button[class*="_moreButton"][aria-haspopup="menu"]')) schedule()
    }
    const onKey = (event: KeyboardEvent): void => {
      if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(event.key)) onClick(event)
    }
    document.addEventListener('click', onClick, true)
    document.addEventListener('keydown', onKey, true)
    const stopSessions = ctx.sessions.list.subscribe(schedule)
    const stopLocale = ctx.locale.subscribe(schedule)
    schedule()
    return () => {
      disposed = true
      observer.disconnect()
      document.removeEventListener('click', onClick, true)
      document.removeEventListener('keydown', onKey, true)
      stopSessions()
      stopLocale()
      window.cancelAnimationFrame(frame)
      release()
    }
  })
}
