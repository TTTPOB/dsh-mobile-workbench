const H = 'html[data-mobile-workbench-active="true"] [data-mobile-nav="frame"] [data-phase] header[data-mobile-workbench-header]'
const A = '[class*="_titleCluster"] [class*="_headerActions"] button[data-mobile-workbench="agents"][aria-expanded]'
const C = '[class*="_titleCluster"] [class*="_headerActions"] button[data-workbench-context-control][type="button"]'
const J = '[class*="_headerActions"] [class*="_root"]:has(> button[class*="_trigger"][aria-expanded]:not([aria-haspopup]) > [class*="_count"])'

export const WORKBENCH_HEADER_CSS = `@media (max-width: 1023px) and (pointer: coarse) {
  /* One contextual app bar: navigation, readable title, native session menu. */
  ${H} {
    --mobile-workbench-header-utilities-width: 44px;
    display: block !important;
    position: relative !important;
    min-height: 60px !important;
    padding: 8px 12px !important;
    width: 100% !important;
    box-sizing: border-box !important;
    flex-shrink: 0;
  }
  ${H} [data-mobile-nav="toggle"],
  ${H} [data-conversation-header-leading]:not(:has(button, a)),
  ${H} [data-conversation-header-corner],
  ${H}[data-workbench-tabs-owned] [data-conversation-tabs],
  ${H} [data-workbench-agent-count],
  ${H} [data-slot="conversation.session.header.lineage"] [class*="_root"]:not([class*="_switcherRoot"]):has(> button[aria-haspopup="tree"]),
  ${H} [data-slot="conversation.session.header.utilities"] > :has([data-open-target]) {
    display: none !important;
  }
  ${H} [class*="_titleRow"] {
    display: block !important;
    padding: 0 var(--mobile-workbench-header-utilities-width) 0 0 !important;
    min-height: 44px !important;
    width: 100% !important;
    min-width: 0 !important;
    box-sizing: border-box !important;
  }
  ${H} [data-workbench-title-info] > svg { display: none !important; }
  ${H} [class*="_titleCluster"] button[data-workbench-title-info][aria-haspopup="dialog"][type="button"] {
    position: static !important;
    display: flex !important;
    min-height: 44px !important;
    height: auto !important;
    max-height: none !important;
    min-width: 0 !important;
    max-width: 100% !important;
    padding: 0 !important;
    overflow: visible !important;
  }
  ${H} ${C} {
    position: static !important;
    display: inline-flex !important;
    min-height: 44px !important;
    height: 44px !important;
    min-width: 44px !important;
    max-width: 100%;
    align-items: center;
    justify-content: center;
    padding: 0 8px !important;
    border: 0;
    border-radius: 12px;
    font: inherit;
    font-size: 12px !important;
    white-space: nowrap;
    touch-action: manipulation;
    background: var(--dsw-alias-interactive-bg-hover);
    color: var(--dsw-alias-label-secondary);
  }
  ${H} ${C}:disabled { opacity: .42; }
  ${H} ${C}[aria-pressed="true"] { color: var(--dsw-static-deepseek-500); background: var(--dsw-alias-interactive-bg-active); }
  ${H} [data-mobile-workbench="views"] { display: inline-flex; flex: none; gap: 2px; order: 2; }
  ${H} ${C}[data-mobile-workbench="parent"] { order: 3; }

  ${H} ${A} {
    position: static !important;
    display: inline-flex !important;
    align-items: center;
    gap: 6px;
    min-height: 44px !important;
    min-width: 44px !important;
    max-width: 100%;
    padding: 0 8px !important;
    border: 0;
    border-radius: 12px;
    background: var(--dsw-alias-interactive-bg-hover);
    color: var(--dsw-alias-label-secondary);
    font: inherit;
    font-size: 13px;
    white-space: nowrap;
    flex: none;
    order: 1;
    touch-action: manipulation;
  }
  ${H} ${A} svg { width: 20px; height: 20px; flex: none; }
  ${H} ${A} [data-workbench-count] { font-size: 11px; padding: 0 4px; height: 20px; }
  ${H} ${A}[aria-expanded="true"] { color: var(--dsw-static-deepseek-500); }
  ${H} [class*="_titleCluster"] {
    display: flex !important;
    flex-direction: column !important;
    align-items: flex-start !important;
    justify-content: center !important;
    min-height: 44px !important;
    width: 100% !important;
    max-width: none !important;
    padding: 0 4px !important;
    gap: 2px !important;
    overflow: visible !important;
    box-sizing: border-box;
  }
  ${H} nav[class*="_crumbs"],
  ${H} [class*="_crumbSeg"],
  ${H} [class*="_crumbCurrent"],
  ${H} [class*="_switcherTitle"] {
    min-width: 0 !important;
    max-width: 100% !important;
    white-space: normal !important;
    overflow: visible !important;
    text-overflow: clip !important;
    overflow-wrap: anywhere;
    line-height: 20px !important;
    font-size: 15px !important;
    font-weight: 600;
  }
  ${H} nav[class*="_crumbs"] {
    flex: 0 1 auto !important;
    width: 100% !important;
    gap: 0 !important;
  }
  ${H} [class*="_headerActions"] {
    position: static !important;
    display: flex !important;
    flex-wrap: wrap !important;
    height: auto !important;
    min-height: 0 !important;
    max-width: 100% !important;
    gap: 4px !important;
    margin: 0 !important;
    width: 100% !important;
    justify-content: flex-start !important;
    overflow: visible !important;
  }
  ${H} [class*="_crumbCurrent"] {
    padding: 0 !important;
    display: -webkit-box !important;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden !important;
    cursor: pointer;
  }
  ${H} [class*="_crumbCurrent"]:focus-visible { outline: 2px solid currentColor; outline-offset: 3px; }
  [data-workbench-title-dialog] {
    position: fixed;
    inset: auto 12px 12px;
    width: calc(100% - 24px);
    max-width: none;
    max-height: 70dvh;
    margin: 0;
    padding: 20px;
    box-sizing: border-box;
    border: 1px solid var(--dsw-alias-border-l2);
    border-radius: 20px;
    background: var(--dsw-alias-bg-base);
    color: var(--dsw-alias-label-primary);
    font: inherit;
    overflow-wrap: anywhere;
  }
  [data-workbench-title-dialog]::backdrop { background: rgb(0 0 0 / 48%); }
  [data-workbench-title-dialog] h2 { margin: 0 0 16px; font-size: 16px; }
  [data-workbench-title-dialog] p { font-size: 15px; line-height: 1.6; margin: 8px 0; }
  [data-workbench-title-dialog] [data-workbench-title-mode] { color: var(--dsw-alias-label-secondary); font-size: 13px; }
  [data-workbench-title-dialog] > button {
    width: 100%;
    min-height: 44px;
    border: 0;
    border-radius: 12px;
    margin-top: 16px;
    background: var(--dsw-alias-interactive-bg-hover);
    color: inherit;
    font: inherit;
  }
  ${H} [data-slot="conversation.session.header.actions"] > span[title]:not(:has(button)) {
    display: flex !important;
    position: static !important;
    width: auto !important;
    height: auto !important;
    font-size: 11px !important;
    line-height: 16px !important;
    white-space: normal !important;
    padding: 0 !important;
    margin: 0 !important;
    gap: 0 !important;
    color: var(--dsw-alias-label-tertiary);
  }
  ${H} [data-slot="conversation.session.header.actions"] > span[title]:not(:has(button)) > svg {
    display: none !important;
  }
  /* Jobs and more live in different native slots; reserve both touch targets. */
  ${H}:has(${J}) {
    --mobile-workbench-header-utilities-width: 96px;
  }
  ${H} ${J} {
    position: absolute !important;
    top: 8px !important;
    right: 60px !important;
    bottom: auto !important;
    width: 44px !important;
    min-width: 44px !important;
    max-width: 44px !important;
    height: 44px !important;
    min-height: 44px !important;
    margin: 0 !important;
    z-index: auto !important;
  }
  ${H} ${J} > button {
    width: 44px !important;
    min-width: 44px !important;
    height: 44px !important;
    min-height: 44px !important;
    padding: 0 !important;
    gap: 2px !important;
    justify-content: center !important;
    border-radius: 12px !important;
    color: var(--dsw-alias-label-secondary) !important;
  }
  /* Match the native More Button ghost fills; only the trigger owns feedback. */
  ${H} ${J} > button:hover,
  ${H} ${J} > button[aria-expanded="true"] {
    background: var(--dsw-alias-interactive-bg-hover) !important;
  }
  ${H} ${J} > button:active {
    background: var(--dsw-alias-interactive-bg-active) !important;
  }
  ${H} ${J} > button [class*="_count"] {
    min-width: 0;
    margin: 0 !important;
    font-size: 13px !important;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  ${H} ${J} > button > svg { width: 10px; flex: none; }
  ${H} [class*="_headerUtilities"] {
    display: flex !important;
    position: absolute !important;
    right: 8px !important;
    top: 8px !important;
    width: 44px !important;
    height: 44px !important;
    padding: 0 !important;
    margin: 0 !important;
  }
  ${H} [class*="_headerUtilities"] button[aria-haspopup="menu"] {
    width: 44px !important;
    height: 44px !important;
    min-width: 44px !important;
    min-height: 44px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 0 !important;
    border-radius: 12px !important;
  }
  ${H} [data-workbench-parent],
  ${H}[data-workbench-child] [class*="_crumbSep"],
  ${H} [data-workbench-ancestor] { display: none !important; }
  ${H} [data-slot="conversation.session.header.lineage"] > div,
  ${H} [data-slot="conversation.session.header.lineage"] button[aria-haspopup="tree"] {
    position: static !important;
    display: flex !important;
    flex: 1 1 auto !important;
    min-width: 0 !important;
    max-width: 100% !important;
    width: auto !important;
    height: auto !important;
    min-height: 24px !important;
    padding: 0 !important;
    white-space: normal !important;
    overflow: visible !important;
    transform: none !important;
  }
  /* Native catalog behaves as a readable sheet, not a tiny header popover. */
  html[data-mobile-workbench-active="true"] [data-workbench-agent-menu] {
    position: fixed !important;
    top: auto !important;
    left: 12px !important;
    right: 12px !important;
    bottom: calc(var(--mobile-workbench-nav-height) + 10px) !important;
    width: auto !important;
    max-width: none !important;
    max-height: min(65dvh, 520px) !important;
    border-radius: 18px !important;
    padding: 10px !important;
    box-shadow: 0 10px 48px rgb(0 0 0 / 35%);
    box-sizing: border-box;
  }
  /* Keep the native absolute background pseudo-element out of the title layout. */
  [data-workbench-agent-menu] > [data-workbench-agent-heading] {
    flex: none;
    margin: 0;
    padding: 4px 6px 10px;
    font-size: 14px;
    font-weight: 600;
    line-height: 22px;
    max-height: 25dvh;
    overflow-y: auto;
    overflow-wrap: anywhere;
  }
  [data-workbench-agent-heading] h2 { font-size: 16px; line-height: 22px; margin: 0; }
  [data-workbench-agent-heading] p { font-size: 12px; line-height: 18px; margin: 4px 0 0; color: var(--dsw-alias-label-secondary); }
  [data-workbench-agent-menu] > [role="tree"] {
    flex: 1 1 auto !important;
    min-height: 0 !important;
    max-height: none !important;
    overflow-y: auto !important;
    padding: 4px 2px;
    overscroll-behavior-y: contain;
  }
  [data-workbench-agent-menu] [class*="_content"] { min-width: 0 !important; }
  [data-workbench-agent-menu] [class*="_metrics"] { flex: none !important; }
  [data-workbench-agent-menu] [class*="_label"],
  [data-workbench-agent-menu] [class*="_summary"] {
    white-space: normal !important;
    overflow-wrap: anywhere;
    text-overflow: clip !important;
    line-height: 1.5 !important;
  }
  [data-workbench-agent-menu] [class*="_label"] { font-size: 14px; }
  [data-workbench-agent-menu] [class*="_summary"] { font-size: 11px; }
  [data-workbench-agent-menu] [class*="_sidebarButton"] { width: 36px; height: 44px; }
}
`
