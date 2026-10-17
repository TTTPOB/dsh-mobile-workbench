/** Return the public panel command used to reveal the session page. */
export function panelSelectorOf(layout: unknown): (() => void) | null {
  const select = (layout as { selectPanel?: unknown } | null)?.selectPanel
  if (typeof select !== 'function') return null
  return (): void => { select.call(layout, null) }
}
