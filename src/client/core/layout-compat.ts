/** Released rc.2 panel command, structurally typed for the older development SDK. */
export function panelSelectorOf(layout: unknown): (() => void) | null {
  const select = (layout as { selectPanel?: unknown } | null)?.selectPanel
  if (typeof select !== 'function') return null
  return (): void => { select.call(layout, null) }
}
