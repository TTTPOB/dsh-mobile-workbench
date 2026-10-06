export interface StatsDecoration {
  ensure: () => void
  dispose: () => void
}

/** Mark the native metrics and context meter without changing their layout or nodes. */
export function createStatsDecoration(): StatsDecoration {
  let marked: Element[] = []
  const dispose = (): void => {
    for (const element of marked) element.removeAttribute('data-mobile-nav')
    marked = []
  }
  const ensure = (): void => {
    const stats = document.querySelector('[data-composer-stats]')
    const dock = stats?.parentElement?.parentElement
    const ring = Array.from(dock?.children ?? []).find(child =>
      !child.contains(stats ?? null) && /\d\s*%/.test(child.textContent ?? ''),
    )
    const next = [stats, ring].filter((element): element is Element => element != null)
    for (const element of marked) {
      if (!next.includes(element)) element.removeAttribute('data-mobile-nav')
    }
    for (const [element, marker] of [[stats, 'stats'], [ring, 'stats-ring']] as const) {
      if (element && element.getAttribute('data-mobile-nav') !== marker) element.setAttribute('data-mobile-nav', marker)
    }
    marked = next
  }
  return { ensure, dispose }
}
