export const WORKBENCH_CSS = /* css */ `
/* Workbench contributes chrome, not a second conversation implementation. */
[data-mobile-workbench="navigation"] { display: none; }
@media (max-width: 1023px) and (pointer: coarse) {
  html[data-mobile-workbench-active="true"] {
    --mobile-workbench-nav-height: calc(56px + env(safe-area-inset-bottom, 0px));
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
    height: var(--mobile-workbench-nav-height);
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
  /* Modal and drawer chrome retain precedence over this navigation. */
  /* A covered navigation must release its frame reservation, including fade-out. */
  html[data-mobile-workbench-active="true"]:has([data-mobile-nav="frame"]:not([data-sidebar-collapsed])),
  html[data-mobile-workbench-active="true"]:has([data-mobile-nav="backdrop"]),
  html[data-mobile-workbench-keyboard="true"],
  html[data-mobile-compose-expanded="true"] {
    --mobile-workbench-nav-height: 0px !important;
  }
  html:has([data-mobile-nav="frame"]:not([data-sidebar-collapsed])) [data-mobile-workbench="navigation"],
  html:has([aria-modal="true"]) [data-mobile-workbench="navigation"],
  html:has([data-mobile-nav="backdrop"]) [data-mobile-workbench="navigation"],
  html[data-mobile-workbench-keyboard="true"] [data-mobile-workbench="navigation"],
  html[data-mobile-compose-expanded="true"] [data-mobile-workbench="navigation"] {
    display: none !important;
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
