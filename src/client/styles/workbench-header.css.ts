const H = 'html[data-mobile-workbench-active="true"] [data-mobile-nav="frame"] [data-phase] header[data-mobile-workbench-header]'

export const WORKBENCH_HEADER_CSS = `@media (max-width: 1023px) and (pointer: coarse) {
  /* One contextual app bar: navigation, readable title, native session menu. */
  ${H} {
    display: block !important;
    position: relative !important;
    min-height: 60px !important;
    padding: 8px 12px !important;
    width: 100% !important;
    box-sizing: border-box !important;
    flex-shrink: 0;
  }
  ${H} [data-conversation-header-leading]:not(:has(button, a)),
  ${H} [data-conversation-header-corner],
  ${H}[data-workbench-tabs-owned] [data-conversation-tabs],
  ${H} [data-workbench-agent-count],
  ${H} [data-slot="conversation.session.header.utilities"] > :has([data-open-target]) {
    display: none !important;
  }
  ${H} [class*="_titleRow"] {
    display: block !important;
    padding: 0 44px !important;
    min-height: 44px !important;
    width: 100% !important;
    min-width: 0 !important;
    box-sizing: border-box !important;
  }
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
  ${H} [class*="_headerUtilities"] button[aria-haspopup="menu"],
  ${H} [class*="_titleCluster"] button[data-mobile-nav="toggle"],
  ${H} [class*="_titleCluster"] button[data-workbench-parent] {
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
  ${H} [class*="_titleCluster"] button[data-mobile-nav="toggle"],
  ${H} [class*="_titleCluster"] button[data-workbench-parent] {
    position: absolute !important;
    top: 8px !important;
    left: 8px !important;
    right: auto !important;
    bottom: auto !important;
    transform: none !important;
  }
  ${H} [data-mobile-nav="toggle"] svg { width: 20px; height: 20px; }
  ${H}[data-workbench-child] [class*="_titleCluster"] button[data-mobile-nav="toggle"],
  ${H}[data-workbench-child] [class*="_crumbSep"],
  ${H} [data-workbench-ancestor] { display: none !important; }
  ${H} [data-workbench-parent] { font-size: 0 !important; }
  ${H} [data-workbench-parent]::before {
    content: '‹';
    font: 30px/1 system-ui;
  }
  ${H} [class*="_crumbSeg"]:has(> [data-workbench-parent]) { display: contents !important; }
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
  [data-workbench-agent-menu]::before {
    content: "子智能体";
    display: block;
    font-size: 14px;
    font-weight: 600;
    padding: 4px 6px 10px;
  }
  [data-workbench-agent-menu] [role="tree"] { max-height: 55dvh !important; }
  [data-workbench-agent-menu] [role="treeitem"] { min-height: 72px; }
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
