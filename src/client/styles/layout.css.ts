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
    grid-template-columns: minmax(0, 1fr) 0 0 !important;
    padding-top: env(safe-area-inset-top, 0px) !important;
  }
  /* The native sidebar is a page, with no off-screen drawer or backdrop. */
  [data-mobile-nav="frame"] > :first-child {
    position: absolute !important;
    inset: 0 0 var(--mobile-workbench-nav-height) !important;
    width: 100% !important;
    height: auto !important;
    z-index: 10 !important;
    transform: none !important;
    transition: none !important;
    padding-top: env(safe-area-inset-top, 0px) !important;
    box-sizing: border-box;
    border-right: none !important;
    background: var(--dsw-alias-bg-surface);
    touch-action: pan-y pinch-zoom !important;
  }
  [data-mobile-nav="frame"][data-sidebar-collapsed] > :first-child {
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
  [data-mobile-nav="frame"] > :first-child [role="tree"] {
    content-visibility: auto;
    contain-intrinsic-size: auto 600px;
  }
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
