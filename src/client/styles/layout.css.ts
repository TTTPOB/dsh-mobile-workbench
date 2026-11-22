/** Frame and native conversation surfaces on touch-primary screens. */
export const LAYOUT_CSS = `@media (max-width: 1023px) and (pointer: coarse) {
  html,
  body {
    touch-action: pan-y pinch-zoom !important;
    overscroll-behavior-x: none !important;
  }
  html [data-mobile-nav="frame"] {
    box-sizing: border-box !important;
    position: relative !important;
    grid-template-columns: 0 minmax(0, 1fr) 0 !important;
    padding-top: env(safe-area-inset-top, 0px) !important;
  }
  [data-mobile-nav="frame"] > [data-sidebar-mask] { display: none !important; }
  /* The native sidebar is a page, with no off-screen drawer or backdrop. */
  [data-mobile-nav="frame"] > [class*="_sidebarCol"] {
    position: absolute !important;
    inset: 0 0 var(--mobile-workbench-nav-height) !important;
    width: 100% !important;
    height: auto !important;
    z-index: 10 !important;
    transform: none !important;
    visibility: visible !important;
    transition: none !important;
    padding-top: env(safe-area-inset-top, 0px) !important;
    box-sizing: border-box;
    border-right: none !important;
    background: var(--dsw-specific-sidebar-fill);
    touch-action: pan-y pinch-zoom !important;
  }
  [data-mobile-nav="frame"]:not([data-mobile-workbench-sessions]) > [class*="_sidebarCol"] {
    display: none !important;
  }
  html [data-mobile-nav="frame"] [data-dsh-responsive-part="sidebar-toggle"],
  html [data-mobile-nav="frame"] [data-conversation-header-leading] button[aria-label*="sidebar" i],
  html [data-mobile-nav="frame"] [data-conversation-header-leading] button[aria-label*="侧边栏"],
  html [data-mobile-nav="frame"] [data-shell-leading] button[aria-label*="sidebar" i],
  html [data-mobile-nav="frame"] [data-shell-leading] button[aria-label*="侧边栏"],
  [data-side="sidebar"],
  [data-side="details"] {
    display: none !important;
  }
  [data-mobile-nav="frame"] [class*="sessionRow"] [class*="_rowActions"] {
    display: inline-flex !important;
  }
  [data-mobile-nav="frame"] > [class*="_sidebarCol"] [role="tree"] {
    content-visibility: auto;
    contain-intrinsic-size: auto 600px;
  }
  [role="dialog"][data-subagent-panel] :is([class*="_disclosure"], [class*="_disclosureSpace"]) {
    width: 44px !important;
    min-width: 44px !important;
    height: 44px !important;
    flex: 0 0 44px !important;
    box-sizing: border-box;
  }
  [role="dialog"][data-subagent-panel] :is([class*="_disclosure"], [class*="_sidebarButton"]) svg { width: 12px; height: 12px; }
  [role="dialog"][data-subagent-panel] [class*="_clickarea"] { margin-left: 0 !important; }
  [data-mobile-nav="frame"] [data-row-key^="session:"] { min-height: 44px !important; }
  /* Keep destructive inline actions in the native More menu on touch screens. */
  [data-mobile-nav="frame"] [data-row-key^="session:"] [data-slot="sidebar.workspaces.session.row.action"] { display: none !important; }
  [data-mobile-nav="frame"] [data-row-key^="session:"] [class*="_rowActions"] button {
    width: 44px !important;
    min-width: 44px !important;
    height: 44px !important;
    min-height: 44px !important;
    padding: 0 !important;
  }
  [data-mobile-nav="frame"] [data-row-key^="session:"] [class*="_rowActions"] button svg { width: 16px; height: 16px; }
  /* Keep the native selection toolbar below Android's selection controls. */
  [data-conversation-scroll] [data-composer-seat] { anchor-name: --mobile-workbench-quote-composer; }
  @supports (bottom: anchor(top)) {
    [data-conversation-scroll]:has([data-composer-seat]) [data-text-interaction-surface][aria-hidden="false"] {
      position: fixed;
      position-anchor: --mobile-workbench-quote-composer;
      inset: auto !important;
      bottom: calc(anchor(top) + 8px) !important;
      left: anchor(center) !important;
      translate: -50% 0;
    }
  }
  html[data-mobile-workbench-keyboard="true"] [data-text-interaction-surface] { visibility: hidden !important; }
  [data-conversation-scroll] {
    scrollbar-gutter: auto !important;
    scroll-padding-bottom: 24px;
    touch-action: pan-y pinch-zoom;
  }
  /* Keep markdown wide content inside its own scroller, not the app frame. */
  [data-conversation-scroll] img { max-width: 100%; height: auto; }
  [data-conversation-scroll] pre { max-width: 100%; overflow-x: auto; }
  [data-phase] [class*="_userStack"],
  [data-phase] [class*="_userStack"] [class*="_bubble"] {
    box-sizing: border-box;
    max-width: 100%;
  }
  [data-phase] [role="tooltip"],
  [data-phase] [class*="_actions"] [class*="_bubble"] {
    display: none !important;
    pointer-events: none !important;
  }
  /* rc.2's empty hero header must not inherit the responsive grid seat. */
  [data-mobile-nav="frame"] [data-phase="hero"] header[class*="headerBlank"] {
    display: none !important;
  }
  [data-mobile-nav="frame"] header button,
  [data-mobile-nav="frame"] header [role="tab"],
  [data-composer-card] button {
    -webkit-tap-highlight-color: transparent;
  }
}
`
