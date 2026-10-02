import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
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

/** Extend only the official, in-place Session Header menu; keep its native rows intact. */
export function installWorkbenchSessionMenu(ctx: ClientContext): void {
  installMobileEffect(ctx, 'dsh-web-mobile: copy session id', () => {
    const t = ctx.locale.bind(WORKBENCH_NS)
    // Development typings predate rc.2's menu key; use the public raw-namespace overload.
    const hostNamespace: string = 'session-log-download'
    const hostT = ctx.locale.bind(hostNamespace)
    let frame = 0
    let disposed = false
    let menu: HTMLElement | null = null
    let row: HTMLElement | null = null
    let removeClick: (() => void) | undefined

    const release = (): void => {
      removeClick?.()
      removeClick = undefined
      row?.remove()
      row = null
      menu = null
    }
    const ensure = (): void => {
      frame = 0
      // HeaderAction does not portal this menu. The wrapper is the ownership
      // check; a download label in some unrelated menu is never sufficient.
      const trigger = document.querySelector<HTMLButtonElement>('header button[class*="_moreButton"][aria-haspopup="menu"][aria-expanded="true"]')
      const next = trigger?.parentElement?.querySelector<HTMLElement>(':scope > [role="menu"]') ?? null
      const native = next ? Array.from(next.querySelectorAll<HTMLButtonElement>('button[role="menuitem"]')).find(item => item.textContent?.trim() === hostT('menu.download')) : undefined
      if (!next || !native) { release(); return }
      if (menu === next && row && next.contains(row)) return
      release()
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
      row.append(button, status)
      // Append to the native row's items container, not its React-owned row.
      native.parentElement?.parentElement?.append(row)
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
    // A native Menu opens/remounts under its trigger wrapper. Coalesce React commits.
    const observer = new MutationObserver(schedule)
    observer.observe(document.body, { childList: true, subtree: true })
    schedule()
    return () => {
      disposed = true
      observer.disconnect()
      window.cancelAnimationFrame(frame)
      release()
    }
  })
}
