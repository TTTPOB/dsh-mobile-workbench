import type { ILayout } from '@deepseek-ai/dsh-client-ui-layout/client'
import { panelSelectorOf } from '../core/layout-compat.ts'

/** Own one global-panel entry above any workbench page entry. */
export function createPanelBack(layout: Pick<ILayout, 'panelInfo' | 'selectPanel'>): { update: () => void; dispose: () => void } {
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
    if (disposed) return
    const open = layout.panelInfo.getSnapshot().activePanelId !== null
    if (!open) leaving = false
    if (leaving) return
    if (open && !armed && !selfBack) {
      try {
        history.pushState({ ...history.state, mobilePanelExit: true }, '')
        armed = true
      } catch {
        // Embedded browsers may disable history writes.
      }
    } else if (!open && armed) release()
  }
  const onBack = (event: PopStateEvent): void => {
    if (selfBack) { clearEcho(); update(); return }
    // Another entry above ours, or Forward into ours, has not consumed it.
    if (!armed || event.state?.mobilePanelExit === true) return
    armed = false
    leaving = true
    if (layout.panelInfo.getSnapshot().activePanelId !== null) selectPanel()
  }
  const unsubscribe = layout.panelInfo.subscribe(update)
  window.addEventListener('popstate', onBack)
  update()
  return {
    update,
    dispose: () => {
      disposed = true
      unsubscribe()
      window.removeEventListener('popstate', onBack)
      if (armed && history.state?.mobilePanelExit === true) { armed = false; history.back() }
      clearEcho()
    },
  }
}
