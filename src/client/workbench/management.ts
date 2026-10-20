import type { Context } from '@deepseek-ai/cordis'
import type { MainPanelId } from '@deepseek-ai/dsh-client-ui-layout/client'
import { closeTopModal, modalSelector } from '@deepseek-ai/dsh-client-ui-primitives'
import { getFrame, installMobileEffect } from '../effects/phone-chrome.ts'
import { decorateManagementMenu, managementEntries } from './management-menu.ts'
import { INSTALL_NAME_ENTRY_ID } from './install-name.ts'
import { WORKBENCH_NS } from './locales.ts'

/** Mobile-only presentation of native account, plugin, settings and global-panel owners. */
export function installManagement(ctx: Context, restorePage: (page: 'sessions' | 'session' | 'files') => void, openSession: () => void, changed: (active: boolean) => void, openInstallName: () => void): void {
  installMobileEffect(ctx, 'mobile-workbench: management navigation', () => {
    const t = ctx.locale.bind(WORKBENCH_NS)
    let anchor: HTMLElement | null = null
    let menu: HTMLElement | null = null
    let keyboardOpen = false
    let releaseMenu = (): void => {}
    let surface: HTMLElement | null = null
    let kind = ''
    let currentPanelId: MainPanelId | null = null
    let chrome: HTMLElement | null = null
    let mask: HTMLElement | null = null
    let nativeSessionExit = false
    let sessionFrame: number | undefined
    let modalEntry = false
    let frame: number | undefined
    let origin: 'sessions' | 'session' | 'files' = 'sessions'
    let savedScroll: { node: HTMLElement; top: number }[] = []
    const marked = new Set<HTMLElement>()
    const mark = (node: HTMLElement | null, name: string): void => { if (node) { node.setAttribute(name, ''); marked.add(node) } }
    const launcher = (): HTMLButtonElement | null => getFrame()?.querySelector('[data-slot="settings.launcher"] button[aria-haspopup="menu"]') ?? null
    // The install-name editor is owned by this plugin, so it appends its own row to the ledger.
    const entries = (): { id: string; label: string }[] => [
      ...managementEntries(ctx),
      { id: INSTALL_NAME_ENTRY_ID, label: t('installName') },
    ]
    const captureList = (): void => {
      const page = document.documentElement.getAttribute('data-mobile-workbench-page')
      origin = page === 'files' || page === 'session' ? page : 'sessions'
      savedScroll = Array.from(getFrame()?.firstElementChild?.querySelectorAll<HTMLElement>('*') ?? []).filter(node => node.scrollHeight > node.clientHeight && /auto|scroll/.test(getComputedStyle(node).overflowY)).map(node => ({ node, top: node.scrollTop }))
    }
    const restore = (): void => {
      restorePage(origin)
      for (const { node, top } of savedScroll) if (node.isConnected) node.scrollTop = top
      const focus = origin === 'sessions' ? launcher() : document.querySelector<HTMLElement>('[data-workbench-destination="' + origin + '"]')
      focus?.focus({ preventScroll: true })
    }
    const close = (): void => {
      nativeSessionExit = false
      if (ctx.layout.panelInfo.getSnapshot().activePanelId !== null && kind === 'panel') ctx.layout.selectPanel(null)
      else closeTopModal(document)
      restore()
      schedule()
    }
    const clearSurface = (): void => {
      surface?.removeAttribute('data-mobile-management-surface')
      chrome?.remove(); chrome = null
      mask?.remove(); mask = null
      surface = null
      kind = ''
      document.documentElement.removeAttribute('data-mobile-workbench-management')
      changed(false)
    }
    const addChrome = (node: HTMLElement, title: string, type: string): void => {
      surface = node; kind = type; nativeSessionExit = false
      node.setAttribute('data-mobile-management-surface', type)
      chrome = document.createElement('div')
      chrome.dataset.mobileManagementChrome = ''
      const back = document.createElement('button')
      back.type = 'button'; back.textContent = '←'; back.setAttribute('aria-label', t(origin === 'sessions' ? 'backToSessions' : 'backToPrevious'))
      const heading = document.createElement('h2')
      heading.textContent = title
      const exit = document.createElement('button')
      exit.type = 'button'; exit.textContent = '×'; exit.setAttribute('aria-label', t('close'))
      back.addEventListener('click', close); exit.addEventListener('click', close)
      chrome.append(back, heading, exit)
      node.prepend(chrome)
      if (type === 'panel') {
        mask = document.createElement('div'); mask.dataset.mobileManagementMask = ''; mask.setAttribute('aria-hidden', 'true')
        mask.addEventListener('click', close)
        node.parentNode?.insertBefore(mask, node)
      } else if (!modalEntry) {
        history.pushState({ ...history.state, mobileManagementModal: true }, '')
        modalEntry = true
      }
      const focused = document.activeElement
      if (type === 'panel' || (focused instanceof Element && focused.closest('[class*="_toolbar"], [class*="_header"]'))) back.focus({ preventScroll: true })
      document.documentElement.setAttribute('data-mobile-workbench-management', type)
      changed(true)
    }
    const update = (): void => {
      frame = undefined
      const trigger = launcher()
      if (trigger?.parentElement !== anchor) {
        anchor?.removeAttribute('data-mobile-management-anchor')
        anchor = trigger?.parentElement ?? null
        mark(anchor, 'data-mobile-management-anchor')
      }
      mark(getFrame()?.querySelector('[class*="_logoRow"] button[class*="_toggle"]') ?? null, 'data-mobile-management-toggle')
      mark(getFrame()?.querySelector('[class*="_panelList"]') ?? null, 'data-mobile-management-panels')
      if (menu && (!menu.isConnected || trigger?.getAttribute('aria-expanded') !== 'true')) { releaseMenu(); menu = null }
      const dialogs = Array.from(document.querySelectorAll<HTMLElement>('[role="dialog"][aria-modal="true"]'))
      const settings = dialogs.find(node => node.getAttribute('data-shortcut-modal') === 'settings')
      const plugins = dialogs.find(node => node.querySelector('[data-plugin-panel]') !== null)
      const panelId = ctx.layout.panelInfo.getSnapshot().activePanelId
      const panel = panelId ? getFrame()?.querySelector<HTMLElement>('[data-slot="main"]') : null
      const next = settings ?? plugins ?? panel ?? null
      if (surface === next && (kind !== 'panel' || panelId === currentPanelId)) return
      currentPanelId = panelId
      if (!surface && (settings || plugins)) captureList()
      const previousKind = kind
      if (surface) clearSurface()
      if (previousKind && previousKind !== 'panel' && !next && modalEntry) {
        modalEntry = false
        if (history.state?.mobileManagementModal) history.back()
        restore()
      }
      if (previousKind === 'panel' && !next) {
        if (!nativeSessionExit) restore()
        else if (!history.state?.mobilePanelExit) { nativeSessionExit = false; openSession() }
      }
      if (next) {
        const title = next.querySelector('h1')?.textContent ?? next.querySelector('[class*="_navTitle"]')?.textContent ?? managementEntries(ctx).find(entry => entry.id === panelId)?.label ?? ''
        addChrome(next, title, settings ? 'settings' : plugins ? 'plugins' : 'panel')
      }
    }
    function schedule(): void { if (frame === undefined) frame = requestAnimationFrame(update) }
    const activate = (id: string): void => {
      menu?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
      if (id === INSTALL_NAME_ENTRY_ID) {
        // Hand focus back to the account trigger so the modal's layer restores it on close.
        launcher()?.focus({ preventScroll: true })
        openInstallName()
        return
      }
      captureList()
      const native = ctx.get('pluginNavigation') as { openModal?: () => void } | undefined
      if (id === 'plugins' && native?.openModal) native.openModal()
      else ctx.layout.selectPanel(id as MainPanelId)
      schedule()
    }
    const onClick = (event: MouseEvent): void => {
      if (!(event.target instanceof Element)) return
      const newTask = event.target.closest('[data-testid="task-manager-page"] button[class*="_newButton"], [data-testid="task-manager-page"] button[class*="_emptyAction"]')
      if (kind === 'panel' && newTask && surface?.contains(newTask)) { nativeSessionExit = true; return }
      if (!launcher()?.contains(event.target)) return
      if (launcher()?.getAttribute('aria-expanded') !== 'true') { captureList(); keyboardOpen = event.detail === 0 }
      schedule()
    }
    const portals = new MutationObserver(records => {
      if (launcher()?.getAttribute('aria-expanded') === 'true' && !menu) {
        const added = records.flatMap(record => Array.from(record.addedNodes)).filter((node): node is HTMLElement => node instanceof HTMLElement)
        menu = added.find(node => node.matches('[role="menu"]')) ?? null
        if (menu) {
          releaseMenu = decorateManagementMenu(menu, entries(), activate)
          // Native autofocus may have targeted its first row before owned rows mounted.
          if (keyboardOpen || menu.contains(document.activeElement)) menu.querySelector<HTMLButtonElement>('[data-mobile-management-entry]')?.focus({ preventScroll: true })
          keyboardOpen = false
        }
      }
      schedule()
    })
    portals.observe(document.body, { childList: true })
    const sidebar = new MutationObserver(schedule)
    const bindSidebar = (): void => {
      sidebar.disconnect()
      const column = getFrame()?.firstElementChild
      if (column) sidebar.observe(column, { childList: true, subtree: true })
    }
    const stopPanels = ctx.layout.panelInfo.subscribe(() => {
      const panelId = ctx.layout.panelInfo.getSnapshot().activePanelId
      if (!surface && panelId !== null) captureList()
      schedule()
    })
    const refreshMenu = (): void => {
      if (!menu) return
      const focused = document.activeElement?.getAttribute('data-mobile-management-entry')
      releaseMenu()
      releaseMenu = decorateManagementMenu(menu, entries(), activate)
      if (focused) {
        const rows = Array.from(menu.querySelectorAll<HTMLButtonElement>('[data-mobile-management-entry]'))
        ;(rows.find(row => row.dataset.mobileManagementEntry === focused) ?? rows[0])?.focus({ preventScroll: true })
      }
    }
    const stopLedger = ctx.slots.subscribe('sidebar.panellist', () => { refreshMenu(); schedule() })
    const stopLocale = ctx.locale.subscribe(() => { refreshMenu(); if (surface) clearSurface(); schedule() })
    const back = (event: PopStateEvent): void => {
      const key = modalEntry ? 'mobileManagementModal' : kind === 'panel' ? 'mobilePanelExit' : null
      if (key && !event.state?.[key]) {
        const foreground = Array.from(document.querySelectorAll<HTMLElement>(modalSelector)).at(-1)
        if (foreground && foreground !== surface) {
          if (foreground.getAttribute('role') === 'menu') {
            // Native Modal handles Escape before its younger Menu; outside-pointer dismisses only the menu.
            const owner = surface?.querySelector<HTMLButtonElement>('button[aria-expanded="true"]')
            surface?.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch' }))
            owner?.focus({ preventScroll: true })
          } else closeTopModal(document)
          history.pushState({ ...event.state, [key]: true }, '')
          event.stopImmediatePropagation()
          return
        }
      }
      if (nativeSessionExit && !event.state?.mobilePanelExit) {
        nativeSessionExit = false
        sessionFrame = requestAnimationFrame(() => { sessionFrame = undefined; openSession() })
      }
      if (modalEntry && !event.state?.mobileManagementModal) {
        modalEntry = false
        closeTopModal(document)
        restore()
      }
    }
    const escape = (event: KeyboardEvent): void => {
      if (kind !== 'panel' || event.key !== 'Escape' || event.defaultPrevented || event.isComposing) return
      if (document.querySelector(modalSelector)) return
      event.preventDefault(); close()
    }
    document.addEventListener('click', onClick, true)
    document.addEventListener('keydown', escape)
    window.addEventListener('popstate', back, true)
    update(); bindSidebar()
    // The first shell mount can follow effect installation.
    const mounts = new MutationObserver(() => { if (!anchor) { update(); bindSidebar() }; if (anchor) mounts.disconnect() })
    if (!anchor) mounts.observe(document.body, { childList: true, subtree: true })
    return () => {
      if (frame !== undefined) cancelAnimationFrame(frame)
      if (sessionFrame !== undefined) cancelAnimationFrame(sessionFrame)
      mounts.disconnect(); sidebar.disconnect(); portals.disconnect()
      stopPanels(); stopLedger(); stopLocale(); releaseMenu()
      document.removeEventListener('click', onClick, true)
      document.removeEventListener('keydown', escape)
      window.removeEventListener('popstate', back, true)
      if (modalEntry && history.state?.mobileManagementModal) history.back()
      clearSurface()
      for (const node of marked) for (const name of ['data-mobile-management-anchor', 'data-mobile-management-toggle', 'data-mobile-management-panels']) node.removeAttribute(name)
    }
  })
}
