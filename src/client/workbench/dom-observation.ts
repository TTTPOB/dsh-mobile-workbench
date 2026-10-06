// Only inspect changed boundary nodes, never the streamed conversation subtree.
export const PRESENTATION_LOCAL = 'header:has([data-conversation-tabs]), [data-composer-stats], [role="tree"][class*="_menuBody"]'
export const PRESENTATION_BOUNDARY = 'header:has([data-conversation-tabs]), [data-composer-stats], [data-trajectory-scroll], tr[data-selected="true"][data-trajectory-row-key], aside[class*="_details"], [role="tree"][class*="_menuBody"]'
export const NAVIGATION_BOUNDARY = 'header:has([data-conversation-tabs]), [data-sidebar-right-panel], [data-sidebar-right-toggle], [data-mobile-workbench="navigation"]'
export const COMPOSER_BOUNDARY = '[data-composer-card], [data-composer-seat], [data-chain-overlay-fallback="conversation.composer"], [aria-modal="true"]'

/** Recognize local changes and boundary mounts/removals without reading message text. */
export function boundaryMutation(record: MutationRecord, selector: string, localSelector: string = selector): boolean {
  const target = record.target instanceof Element ? record.target : record.target.parentElement
  if (!target) return false
  if (target.closest('[data-mobile-workbench="navigation"], [data-workbench-context-control], [data-workbench-agent-heading], [data-mobile-workbench-session-copy]')) return false
  if (record.type === 'attributes') return target.closest(selector) !== null
  if (record.type === 'characterData') return target.closest(localSelector) !== null
  // Descendant commits matter only inside the boundary itself, not its broad ancestors.
  if (target.closest(localSelector) !== null) return true
  return [...record.addedNodes, ...record.removedNodes].some(node => node instanceof Element
    && (node.matches(selector) || node.querySelector(selector) !== null))
}
