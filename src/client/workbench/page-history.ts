type Page = 'sessions' | 'session' | 'files'

/** Own at most one same-document entry above the session page; panel history stays independent. */
export function installPageHistory(
  window: Window,
  restorePage: (page: Page) => void,
  panelActive: () => boolean,
): { enter: (page: Page) => void; sync: (page: Page) => void; dispose: () => void } {
  let owned = false
  let consuming = false
  const pop = (event: PopStateEvent): void => {
    if (event.state?.mobilePanelExit || panelActive()) return
    const page = event.state?.mobileWorkbenchPage
    // Native global-panel navigation collapses its sidebar; restore the underlying page on pop.
    if (owned && (page === 'sessions' || page === 'files')) { restorePage(page); return }
    if (owned && !page) {
      owned = false
      consuming = false
      restorePage('session')
    }
  }
  const sync = (page: Page): void => {
    if (!owned || consuming || panelActive() || window.history.state?.mobilePanelExit) return
    if (page === 'session') { consuming = true; window.history.back() }
  }
  const enter = (page: Page): void => {
    if (panelActive() || window.history.state?.mobilePanelExit || consuming) return
    if (page === 'session') { sync(page); return }
    const state = { ...window.history.state, mobileWorkbenchPage: page }
    if (owned) window.history.replaceState(state, '')
    else { window.history.pushState(state, ''); owned = true }
  }
  window.addEventListener('popstate', pop)
  return { enter, sync, dispose: () => { window.removeEventListener('popstate', pop) } }
}
