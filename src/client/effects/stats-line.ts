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
    const stats = Array.from(document.querySelectorAll('[data-composer-stat]'))
    const dock = document.querySelector('[data-composer-dock]')
    const ring = Array.from(dock?.children ?? []).find(child =>
      !child.matches('[data-composer-stat]') && !child.querySelector('[data-composer-stat]')
      && /\d\s*%/.test(child.textContent ?? ''),
    )
    const next = [...stats, ...ring ? [ring] : []]
    for (const element of marked) {
      if (!next.includes(element)) element.removeAttribute('data-mobile-nav')
    }
    for (const [element, marker] of [...stats.map(element => [element, 'stats'] as const), [ring, 'stats-ring'] as const]) {
      if (element && element.getAttribute('data-mobile-nav') !== marker) element.setAttribute('data-mobile-nav', marker)
    }
    marked = next
  }
  return { ensure, dispose }
}
