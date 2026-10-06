import { panelSelectorOf } from '../core/layout-compat.ts'

/** Keep system Back inside a native global panel, without an exit animation. */
export function createPanelBack(layout: unknown): { update: () => void; dispose: () => void } {
  const selectPanel = panelSelectorOf(layout)
  let armed = false
  let selfBack = false
  let disposed = false
  let leaving = false
  let timer: number | undefined
  const clearEcho = (): void => {
    selfBack = false
    if (timer !== undefined) window.clearTimeout(timer)
    timer = undefined
  }
  const release = (): void => {
    armed = false
    selfBack = true
    timer = window.setTimeout(() => { clearEcho(); update() }, 1200)
    history.back()
  }
  const update = (): void => {
    if (!selectPanel || disposed) return
    const open = document.querySelector('[class*="panelRow"][aria-current="page"]') !== null
    if (!open) leaving = false
    if (leaving) return
    if (open && !armed && !selfBack) {
      try {
        history.pushState({ mobilePanelExit: true }, '')
        armed = true
      } catch {
        // Embedded browsers may disable history writes.
      }
    } else if (!open && armed) release()
  }
  const onBack = (): void => {
    if (selfBack) { clearEcho(); update(); return }
    if (!armed) return
    armed = false
    leaving = true
    selectPanel?.()
  }
  window.addEventListener('popstate', onBack)
  return {
    update,
    dispose: () => {
      disposed = true
      window.removeEventListener('popstate', onBack)
      if (armed) { armed = false; history.back() }
      clearEcho()
    },
  }
}
