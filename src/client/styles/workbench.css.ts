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
    min-width: 44px;
    min-height: 44px;
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
  /* Modal and drawer chrome retain precedence over this navigation. */
  html:has([aria-modal="true"]),
  html:has([data-mobile-nav="backdrop"]),
  html[data-mobile-workbench-keyboard="true"],
  html[data-mobile-compose-expanded="true"] {
    --mobile-workbench-nav-height: 0px !important;
  }
  html:has([aria-modal="true"]) [data-mobile-workbench="navigation"],
  html:has([data-mobile-nav="backdrop"]) [data-mobile-workbench="navigation"],
  html[data-mobile-workbench-keyboard="true"] [data-mobile-workbench="navigation"],
  html[data-mobile-compose-expanded="true"] [data-mobile-workbench="navigation"] {
    display: none !important;
  }
  html[data-mobile-workbench-active="true"] [data-sidebar-right-panel="fullscreen"] {
    bottom: var(--mobile-workbench-nav-height) !important;
  }
}
@media (min-width: 1024px), (pointer: fine), (pointer: none) {
  [data-mobile-workbench="navigation"] { display: none !important; }
}
`
