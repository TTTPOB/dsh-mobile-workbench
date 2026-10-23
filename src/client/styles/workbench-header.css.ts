const H = 'html[data-mobile-workbench-active="true"] [data-mobile-nav="frame"] [data-phase] header[data-mobile-workbench-header]'
// The host background-task chip is a class-less wrapper directly under the header
// actions slot; the old `_root` arm stopped matching when the host dropped that
// wrapper class, so the chip fell out of the first row. Anchor on the slot and on
// the count inside the trigger instead, and keep the team chip out of the match.
const TASKS = '[data-slot="conversation.session.header.actions"] > div:has(> button[class*="_trigger"] > [class*="_count"])'

export const WORKBENCH_HEADER_CSS = `@media (max-width: 1023px) and (pointer: coarse) {
  ${H} {
    position: relative !important;
    display: block !important;
    padding: 8px 12px !important;
    width: 100% !important;
    min-height: 108px !important;
    box-sizing: border-box !important;
    flex-shrink: 0;
  }
  ${H} [data-mobile-nav="toggle"],
  ${H} [data-conversation-header-leading],
  ${H} [data-conversation-header-corner],
  ${H}[data-workbench-tabs-owned] [data-conversation-tabs],
  ${H} nav[class*="_crumbs"],
  ${H} [data-workbench-agent-count],
  ${H} [data-slot="conversation.session.header.actions"] > span[title],
  ${H} [data-slot="conversation.session.header.utilities"] > :has([data-open-target]) { display: none !important; }
  ${H} [class*="_titleRow"], ${H} [class*="_titleCluster"], ${H} [class*="_headerActions"] {
    width: 100% !important;
    max-width: none !important;
    min-width: 0 !important;
    padding: 0 !important;
    margin: 0 !important;
    overflow: visible !important;
  }
  ${H} [class*="_titleRow"], ${H} [class*="_titleCluster"] { display: block !important; }
  /* Host nodes and the plugin nodes are siblings under the display:contents slot,
     so the actions row is a grid: row one keeps the title and the reserve for the
     absolutely positioned native utilities, row two holds the view tabs, the
     background-task chip, the host team chip and the downstream directory. */
  ${H} [class*="_headerActions"] {
    display: grid !important;
    grid-template-columns: auto minmax(0, 1fr) auto auto;
    grid-template-rows: 44px 44px;
    grid-template-areas:
      "main main main main"
      "views tasks team agents";
    column-gap: 4px;
    row-gap: 4px;
    align-items: center;
  }
  ${H} [data-workbench-header-main] {
    grid-area: main;
    display: flex;
    align-items: center;
    min-width: 0;
    height: 44px;
    padding-right: 44px;
  }
  /* The plugin owns this wrapper, so it can dissolve into the grid without
     touching either host node or the plugin controls inside it. */
  ${H} [data-workbench-header-secondary] { display: contents !important; }
  ${H} button[data-workbench-context-control] {
    appearance: none;
    box-sizing: border-box;
    display: inline-flex !important;
    align-items: center;
    justify-content: center;
    flex: none;
    height: 44px !important;
    min-height: 44px !important;
    min-width: 44px !important;
    padding: 0 4px !important;
    border: 0;
    border-radius: 8px;
    background: transparent;
    color: var(--dsw-alias-label-secondary);
    font: inherit;
    font-size: 12px;
    line-height: 16px;
    touch-action: manipulation;
  }
  ${H} button[data-workbench-context-control]:focus-visible { outline: 2px solid currentColor; outline-offset: -2px; }
  ${H} button[data-workbench-context-control] > svg { width: 20px; height: 20px; flex: none; }
  ${H} button[data-workbench-title-info] {
    flex: 1 1 0;
    min-width: 0 !important;
    justify-content: flex-start;
    text-align: left;
    color: var(--dsw-alias-label-primary);
    font-size: 15px;
    line-height: 20px;
    font-weight: 600;
  }
  ${H} [data-workbench-title-info] span {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    word-break: normal;
    overflow-wrap: anywhere;
  }
  ${H} button[data-mobile-workbench="parent"] { width: 44px; }
  ${H} button[data-mobile-workbench="stats"] { width: 56px; min-width: 56px !important; gap: 3px; font-size: 11px; }
  ${H} button[data-mobile-workbench="stats"] > svg { width: 16px; height: 16px; }
  ${H} [data-mobile-workbench="views"] { grid-area: views; display: flex; flex: none; }
  ${H} [data-workbench-view] { position: relative; border-radius: 0 !important; padding: 0 8px !important; }
  ${H} [data-workbench-view][aria-selected="true"] { color: var(--dsw-alias-label-primary); font-weight: 600; }
  ${H} [data-workbench-view][aria-selected="true"]::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 4px;
    right: 4px;
    height: 2px;
    background: var(--dsw-static-deepseek-500);
  }
  ${H} [data-workbench-mode] { flex: 1 1 0; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 11px; color: var(--dsw-alias-label-secondary); }
  ${H} [data-mobile-workbench="agents"] { grid-area: agents; justify-self: end; gap: 4px; }
  ${H} [data-team-action] { grid-area: team; justify-self: end; }
  /* The host hides the team label below 480px, so the icon-only phone trigger
     reaches 44px through min-width while tablets keep the visible label. */
  ${H} [data-team-action] > button {
    box-sizing: border-box;
    min-width: 44px !important;
    height: 44px !important;
    min-height: 44px !important;
    padding: 0 6px !important;
    justify-content: center;
    touch-action: manipulation;
  }
  ${H} ${TASKS} {
    grid-area: tasks;
    justify-self: start;
    align-items: center;
    min-width: 0;
    max-width: 100%;
    overflow: hidden;
  }
  ${H} ${TASKS} > button {
    box-sizing: border-box;
    height: 44px !important;
    min-height: 44px !important;
    min-width: 0 !important;
    max-width: 100% !important;
    touch-action: manipulation;
  }
  ${H} ${TASKS} > button [class*="_count"] {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  ${H} [data-workbench-count] { background: transparent; font-size: 11px; padding: 0; margin: 0; }
  ${H} button[data-mobile-workbench="agents"] > svg { width: 16px; height: 16px; }
  /* Touch feedback remains visible without permanently filling every control. */
  ${H} :is(button[data-workbench-context-control], [class*="_headerUtilities"] button[aria-haspopup="menu"])[aria-expanded="true"]:not(:disabled) {
    background: var(--dsw-alias-interactive-bg-hover);
    color: var(--dsw-alias-label-primary);
  }
  @media (hover: hover) {
    ${H} :is(button[data-workbench-context-control], [class*="_headerUtilities"] button[aria-haspopup="menu"]):hover:not(:disabled) {
      background: var(--dsw-alias-interactive-bg-hover);
      color: var(--dsw-alias-label-primary);
    }
  }
  ${H} :is(button[data-workbench-context-control], [class*="_headerUtilities"] button[aria-haspopup="menu"]):active:not(:disabled) {
    background: var(--dsw-alias-interactive-bg-active);
    color: var(--dsw-alias-label-primary);
  }
  ${H} [class*="_headerUtilities"] button[aria-haspopup="menu"]:focus-visible { outline: 2px solid currentColor; outline-offset: -2px; }
  ${H} [class*="_headerUtilities"] { display: flex !important; position: absolute !important; top: 8px !important; right: 12px !important; width: 44px !important; height: 44px !important; padding: 0 !important; margin: 0 !important; }
  ${H} [class*="_headerUtilities"] button[aria-haspopup="menu"] { display: flex !important; align-items: center; justify-content: center; width: 44px !important; min-width: 44px !important; height: 44px !important; min-height: 44px !important; padding: 0 !important; }
  /* MenuSurface paints its material as an absolute inset:0 child, so the surface
   * itself must never scroll: scrolling it would carry the material away and
   * leave later rows on a transparent background. Scroll an inner layer instead. */
  [data-workbench-stats-panel] {
    position: fixed;
    z-index: 100;
    width: min(336px, calc(100vw - 24px));
    max-height: 60dvh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-sizing: border-box;
    border-radius: var(--dsw-radius-lg);
    border: 1px solid var(--dsw-alias-border-l1);
    box-shadow: var(--dsw-elevation-prominent);
    color: var(--dsw-alias-label-primary);
  }
  [data-workbench-stats-scroll] { flex: 1 1 auto; min-height: 0; overflow-y: auto; overscroll-behavior-y: contain; padding: 12px; }
  [data-workbench-stats-panel] h2 { display: flex; justify-content: space-between; font-size: 14px; margin: 8px 0; }
  [data-workbench-stats-panel] dl { margin: 0 0 12px; font-size: 13px; }
  [data-workbench-stats-panel] dl > div { display: flex; justify-content: space-between; gap: 12px; padding: 4px 0; }
  [data-workbench-stats-panel] dt { color: var(--dsw-alias-label-secondary); min-width: 0; }
  [data-workbench-stats-panel] dd { margin: 0; flex: none; text-align: right; white-space: nowrap; }
  .mobile-workbench-session-info { width: min(400px, calc(100vw - 24px)); overflow-wrap: anywhere; }
  .mobile-workbench-session-info button { min-width: 44px; min-height: 44px; }
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
    border-radius: var(--dsw-radius-lg) !important;
    padding: 10px !important;
    box-shadow: var(--dsw-elevation-prominent);
    border: 1px solid var(--dsw-alias-border-l1);
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
  [data-workbench-agent-menu] [class*="_sidebarButton"] { width: 44px; height: 44px; }
}
`
