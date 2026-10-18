type Page = 'sessions' | 'session' | 'files'

/** Own at most one same-document entry above the session page; panel history stays independent. */
export function installPageHistory(
  window: Window,
  returnSession: () => void,
  panelActive: () => boolean,
): { enter: (page: Page) => void; sync: (page: Page) => void; dispose: () => void } {
  let owned = false
  let consuming = false
  const pop = (event: PopStateEvent): void => {
    if (event.state?.mobilePanelExit || panelActive()) return
    if (owned && !event.state?.mobileWorkbenchPage) {
      owned = false
      consuming = false
      returnSession()
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
