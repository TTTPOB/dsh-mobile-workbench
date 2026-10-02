export const WORKBENCH_CSS = /* css */ `
/* Workbench contributes chrome, not a second conversation implementation. */
[data-mobile-workbench="navigation"] { display: none; }
@media (max-width: 1023px) and (pointer: coarse) {
  html[data-mobile-workbench-active="true"] {
    --mobile-workbench-nav-size: calc(56px + env(safe-area-inset-bottom, 0px));
    --mobile-workbench-nav-height: max(0px, calc(var(--mobile-workbench-nav-size) - var(--mobile-compose-nav-release, 0px)));
  }
  html[data-mobile-workbench-active="true"] [data-mobile-nav="frame"] {
    padding-bottom: var(--mobile-workbench-nav-height) !important;
    box-sizing: border-box;
  }
  [data-mobile-workbench="navigation"] {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    position: fixed;
    inset: auto 0 0;
    height: var(--mobile-workbench-nav-size);
    padding: 4px 12px calc(4px + env(safe-area-inset-bottom, 0px));
    box-sizing: border-box;
    background: var(--dsw-alias-bg-base);
    color: var(--dsw-alias-label-secondary);
    border-top: 1px solid var(--dsw-alias-border-l2);
    z-index: 45;
    pointer-events: auto;
  }
  [data-mobile-workbench="navigation"] button {
    appearance: none;
    border: 0;
    background: transparent;
    color: inherit;
    border-radius: 12px;
    min-width: 0;
    min-height: 44px;
    padding: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    font: inherit;
    font-size: 11px;
    line-height: 14px;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }
  [data-mobile-workbench="navigation"] svg { width: 21px; height: 21px; }
  [data-workbench-count] {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 15px;
    height: 15px;
    margin-left: 2px;
    padding: 0 2px;
    border-radius: 8px;
    background: var(--dsw-alias-interactive-bg-hover);
    font-size: 9px;
    line-height: 1;
  }
  [data-workbench-count][data-workbench-running="true"]::before {
    content: "";
    width: 3px;
    height: 3px;
    margin-right: 2px;
    border-radius: 50%;
    background: var(--dsw-static-deepseek-500);
    flex: none;
  }
  [data-mobile-workbench="navigation"] button > span { white-space: nowrap; font-size: 10px; }
  [data-mobile-workbench="navigation"] button[aria-current="page"] {
    color: var(--dsw-static-deepseek-500);
    background: var(--dsw-alias-interactive-bg-hover);
    font-weight: 600;
  }
  [data-mobile-workbench="navigation"] button:disabled { opacity: .42; cursor: default; }
  [data-mobile-workbench="navigation"] button:focus-visible {
    outline: 2px solid var(--dsw-static-deepseek-500);
    outline-offset: -2px;
  }
  /* One file entry is sufficient; reclaim its existing header reservation. */
  html[data-mobile-workbench-active="true"] [data-mobile-nav="files"] { display: none !important; }
  html[data-mobile-workbench-active="true"] header [class*="_titleCluster"] {
    padding-right: 8px !important;
  }
  html[data-mobile-workbench-active="true"] [data-conversation-scroll] {
    scroll-padding-bottom: 24px;
  }
  /* Secondary metrics are summaries; tapping opens the unchanged native details. */
  html[data-mobile-workbench-active="true"] [data-composer-stats],
  html[data-mobile-workbench-active="true"] [data-composer-stats] button {
    min-height: 28px !important;
    height: 28px !important;
    align-items: center;
  }
  html[data-mobile-workbench-active="true"] [data-composer-stats] [data-workbench-stat-label] {
    font-size: 0 !important;
    white-space: nowrap !important;
    overflow: visible !important;
    text-overflow: clip !important;
  }
  [data-workbench-stat-label] > span { display: none; }
  [data-workbench-stat-label]::after {
    content: attr(data-workbench-stat-label);
    font-size: 11px;
    line-height: 16px;
  }
  /* The native sidebar is the sessions page, not an overlay drawer. */
  html[data-mobile-workbench-active="true"] [data-mobile-nav="frame"] > :first-child {
    bottom: var(--mobile-workbench-nav-height) !important;
    height: auto !important;
    width: 100% !important;
    transform: none !important;
    transition: none !important;
  }
  html[data-mobile-workbench-active="true"] [data-mobile-nav="frame"][data-sidebar-collapsed] > :first-child { display: none !important; }
  html[data-mobile-workbench-active="true"] [data-mobile-nav="backdrop"],
  html[data-mobile-workbench-active="true"] [data-mobile-nav="fab"] { display: none !important; }
  html[data-mobile-workbench-active="true"] [data-mobile-nav="frame"] > :first-child [class*="_root"]:has(> [class*="_regionArea"]) {
    display: grid !important;
    position: relative;
    width: 100% !important;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    grid-template-rows: auto auto minmax(0, 1fr) auto;
  }
  html[data-mobile-workbench-active="true"] [data-mobile-nav="frame"] > :first-child [class*="_logoRow"] { grid-column: 1 / -1; grid-row: 1; }
  html[data-mobile-workbench-active="true"] [data-mobile-nav="frame"] > :first-child [class*="_newSession"] { grid-column: 1 / -1; grid-row: 2; }
  html[data-mobile-workbench-active="true"] [data-mobile-nav="frame"] > :first-child [class*="_regionArea"] { grid-column: 1 / -1; grid-row: 3; min-height: 0; }
  html[data-mobile-workbench-active="true"] [data-mobile-nav="frame"] > :first-child [class*="_panelList"] { grid-column: 1; grid-row: 4; align-self: end; margin: 0 !important; }
  html[data-mobile-workbench-active="true"] [data-mobile-nav="frame"] > :first-child [class*="_footArea"] { grid-column: 2; grid-row: 4; align-self: end; margin: 0 !important; }
  /* Bottom tools share the same row height, without Settings' native 4px margins. */
  html[data-mobile-workbench-active="true"] [data-mobile-nav="frame"] > :first-child [class*="_settingsArea"] [class*="_triggerRow"] { margin: 0 !important; width: 100% !important; }
  html[data-mobile-workbench-active="true"] [data-mobile-nav="frame"] > :first-child [class*="_panelList"] button[class*="_panelRow"],
  html[data-mobile-workbench-active="true"] [data-mobile-nav="frame"] > :first-child [class*="_settingsArea"] [class*="_triggerRow"] button[class*="_trigger"] {
    height: 44px !important;
    min-height: 44px !important;
    margin: 0 !important;
    padding: 0 8px !important;
    align-items: center;
    box-sizing: border-box;
  }
  html[data-mobile-workbench-active="true"] [data-mobile-nav="frame"] > :first-child [class*="_wide"] { animation: none !important; }
  /* All page entries switch without the Files-only lateral slide. */
  html[data-mobile-workbench-active="true"] [data-sidebar-right-panel] :is([data-dockkit-host="dock"], [data-dockkit-empty], [data-dockkit-divider]) { transition: none !important; }
  /* Keyboard visibility never changes layout clearance in a discrete step. */
  html[data-mobile-compose-expanded="true"],
  html[data-mobile-workbench-keyboard="true"]:has([aria-modal="true"]) {
    --mobile-workbench-nav-height: 0px !important;
  }
  html:has([aria-modal="true"]) [data-mobile-workbench="navigation"],
  html[data-mobile-workbench-keyboard="true"] [data-mobile-workbench="navigation"],
  html[data-mobile-compose-expanded="true"] [data-mobile-workbench="navigation"] {
    display: none !important;
  }
  /* Normal editing uses the same visual viewport as the composer budget.
     Do not translate after the browser has already panned to the caret. */
  html[data-mobile-workbench-active="true"]:not([data-mobile-compose-expanded="true"]):not(:has([aria-modal="true"])) [data-mobile-nav="frame"]:has([data-mobile-workbench-composer="true"]) {
    max-height: min(100%, var(--mobile-compose-frame-max, 100%)) !important;
  }
  /* Only a coarse keyboard return gets a short theme motion; live viewport frames do not. */
  html[data-mobile-workbench-active="true"][data-mobile-compose-returning="true"]:not([data-mobile-compose-expanded="true"]):not(:has([aria-modal="true"])) [data-mobile-nav="frame"]:has([data-mobile-workbench-composer="true"]) {
    transition: max-height var(--ds-transition-duration, 0.2s) var(--ds-ease-in-out, ease), padding-bottom var(--ds-transition-duration, 0.2s) var(--ds-ease-in-out, ease) !important;
  }
  @media (prefers-reduced-motion: reduce) {
    html[data-mobile-compose-returning="true"] [data-mobile-nav="frame"] { transition: none !important; }
  }
  /* The native absolute panel already inherits the shortened rightbar column.
     Anchor to the viewport so navigation clearance is subtracted only once. */
  html[data-mobile-workbench-active="true"] [data-sidebar-right-panel="fullscreen"] {
    position: fixed !important;
    /* Fixed positioning contains the dock children; keep their native overlay band. */
    z-index: var(--dsh-dockkit-dock-layer) !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: var(--mobile-workbench-nav-height) !important;
    height: auto !important;
    max-height: none !important;
    box-sizing: border-box;
  }
}
@media (min-width: 1024px), (pointer: fine), (pointer: none) {
  [data-mobile-workbench="navigation"] { display: none !important; }
}
`
