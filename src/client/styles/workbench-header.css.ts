import { HOST_JOB_TRIGGER } from '../workbench/dom-observation.ts'

const H = 'html[data-mobile-workbench-active="true"] [data-mobile-nav="frame"] [data-phase] header[data-mobile-workbench-header]'
const JOB_BUTTON = '[data-slot="conversation.session.header.actions"] ' + HOST_JOB_TRIGGER
const TASKS = '[data-slot="conversation.session.header.actions"] > div:has(> ' + HOST_JOB_TRIGGER + ')'

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
  ${H} [data-slot="conversation.session.header.actions"] > [data-subagent-action]:has([data-subagent-count]),
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
  /* The desktop title fade also masked the end of the second mobile row. */
  ${H} [class*="_titleCluster"] { mask-image: none; }
  /* Host nodes and the plugin nodes are siblings under the display:contents slot,
     so the actions row is a grid: row one keeps the title and the reserve for the
     absolutely positioned native utilities, row two holds the view tabs, the
     background-job chip and the downstream directory. */
  ${H} [class*="_headerActions"] {
    display: grid !important;
    grid-template-columns: auto minmax(0, 1fr) auto;
    grid-template-rows: 44px 44px;
    grid-template-areas:
      "main main main"
      "views tasks agents";
    column-gap: 4px;
    row-gap: 4px;
    align-items: center;
  }
  /* Keep measuring the native strip without letting it occupy the mobile header grid. */
  ${H}[data-workbench-tabs-owned] :has(> [data-conversation-tabs]) {
    position: absolute !important;
    inset-inline: 12px;
    visibility: hidden;
    pointer-events: none;
  }
  /* Leave the native launcher mounted for selection of a folded view. */
  ${H} [data-conversation-tabs] + span > button[aria-haspopup="menu"]:has(> svg[data-icon="dsw-icon-ellipsis-outline-regular"]) {
    display: none !important;
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
  ${H} [data-mobile-workbench="agents"] { grid-area: agents; justify-self: end; gap: 4px; white-space: nowrap; }
  /* Restore the native text-mode trigger inside the compact header container. */
  ${H} ${TASKS} { grid-area: tasks; justify-self: start; min-width: 0; max-width: 100%; }
  ${H} ${JOB_BUTTON} {
    box-sizing: border-box;
    width: auto;
    max-width: 100%;
    min-width: 44px;
    height: 44px !important;
    min-height: 44px;
    padding: 0 4px;
    justify-content: start;
    touch-action: manipulation;
  }
  ${H} ${JOB_BUTTON} > [data-job-count] { display: none; }
  ${H} ${JOB_BUTTON}[data-workbench-job-count]::after {
    content: attr(data-workbench-job-count) / "";
    font-size: 11px;
    line-height: 16px;
    white-space: nowrap;
  }
  ${H} ${JOB_BUTTON}[data-workbench-job-count]:not([data-workbench-job-count^="0/"])::after {
    color: var(--dsw-alias-state-business-primary);
  }
  ${H} ${JOB_BUTTON} [class*="_compactIcon"] { display: none; }
  ${H} ${JOB_BUTTON} [class*="_textModeActivity"] { display: inline-flex !important; }
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
    top: calc(anchor(bottom) + 4px);
    right: 12px;
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
  .mobile-workbench-session-info { overflow-wrap: anywhere; }
  .mobile-workbench-session-info-content > :has(> h2) { padding-block: 12px 4px; }
  .mobile-workbench-session-info-content > :has(> h2) > button { min-width: 44px; min-height: 44px; }
  .mobile-workbench-session-info-content > :has(> [data-workbench-info-details]) { margin-top: 0; }
  [data-workbench-info-details] { display: grid; gap: 4px; font-size: 14px; line-height: 22px; }
  [data-workbench-info-details] > p { margin: 0; color: var(--dsw-alias-label-primary); }
  [data-workbench-info-details] > p + p { color: var(--dsw-alias-label-secondary); }
  /* Native catalog behaves as a readable sheet, not a tiny header popover. */
  html[data-mobile-workbench-active="true"] [role="dialog"][data-subagent-panel] {
    position: fixed !important;
    top: auto !important;
    left: 12px !important;
    right: 12px !important;
    bottom: calc(var(--mobile-workbench-nav-height) + 10px) !important;
    width: auto !important;
    max-width: none !important;
    max-height: min(65dvh, 520px) !important;
    display: flex !important;
    flex-direction: column-reverse !important;
    border-radius: var(--dsw-radius-lg) !important;
    padding: 10px !important;
    box-shadow: var(--dsw-elevation-prominent);
    border: 1px solid var(--dsw-alias-border-l1);
    box-sizing: border-box;
  }
  [role="dialog"][data-subagent-panel] > [data-workbench-agent-heading] {
    display: flex;
    flex: none;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 0 4px 4px;
  }
  [data-workbench-agent-heading] h2 { font-size: 16px; line-height: 22px; margin: 0; }
  [data-workbench-agent-heading] button {
    display: grid;
    place-items: center;
    flex: 0 0 44px;
    height: 44px;
    border: 0;
    border-radius: var(--dsw-radius-sm);
    background: transparent;
    color: var(--dsw-alias-label-secondary);
  }
  [role="dialog"][data-subagent-panel] > :has(> [role="tree"]) {
    flex: 1 1 auto !important;
    min-height: 0 !important;
    max-height: none !important;
    overflow-y: auto !important;
    padding: 4px 2px;
    overscroll-behavior-y: contain;
  }
  [role="dialog"][data-subagent-panel] [class*="_content"] { min-width: 0 !important; }
  [role="dialog"][data-subagent-panel] [class*="_metrics"] { flex: none !important; }
  [role="dialog"][data-subagent-panel] [class*="_label"],
  [role="dialog"][data-subagent-panel] [class*="_summary"] {
    white-space: normal !important;
    overflow-wrap: anywhere;
    text-overflow: clip !important;
    line-height: 1.5 !important;
  }
  [role="dialog"][data-subagent-panel] [class*="_label"] { font-size: 14px; }
  [role="dialog"][data-subagent-panel] [class*="_summary"] { font-size: 11px; }
  [role="dialog"][data-subagent-panel] [class*="_sidebarButton"] { width: 44px; height: 44px; }
  [data-subagent-panel]:has([data-agent-cards]) { max-height: min(80dvh, 610px) !important; background: var(--dsw-alias-bg-layer-2) !important; }
  [data-subagent-panel] [role="tree"]:has(> [data-agent-cards]) > :not([data-agent-cards]) { display: none; }
  [data-agent-cards] { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; }
  [data-agent-cards="nested"] { grid-column: 1 / -1; margin-inline-start: 12px; padding-inline-start: 8px; border-inline-start: 1px solid var(--dsw-alias-border-l2); }
  [data-agent-card] { position: relative; min-width: 0; border: 1px solid var(--dsw-alias-border-l2); border-radius: var(--dsw-radius-md); background: var(--dsw-alias-interactive-bg-hover); }
  [data-agent-card-open], [data-agent-card-branch] { border: 0; background: transparent; color: inherit; font: inherit; }
  [data-agent-card-open] { width: 100%; min-height: 44px; padding: 6px 8px; display: grid; gap: 1px; text-align: start; }
  [data-agent-card]:has(> [data-agent-card-branch]) [data-agent-card-open] { padding-inline-end: 44px; }
  [data-agent-card-branch] { position: absolute; inset: 0 0 auto auto; width: 44px; height: 44px; }
  [data-agent-card-branch][aria-expanded="true"] { rotate: 90deg; }
  [data-agent-card-name] { display: flex; align-items: center; gap: 6px; font-weight: 600; }
  [data-agent-card-detail], [data-agent-card-model] { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12px; color: var(--dsw-alias-label-secondary); }
}
`
