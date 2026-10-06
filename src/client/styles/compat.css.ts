/** Native workspace portal layering and plugin management. */
export const COMPAT_CSS = `@media (max-width: 1023px) and (pointer: coarse) {
  /* Native AppFrame portals clear fullscreen workspace cells (dock layer 40). */
  body:has([data-sidebar-right-open][data-sidebar-right-panel="fullscreen"]) [class*="_overlayLayer"] {
    z-index: 50 !important;
  }
  [role="dialog"]:has([data-dsh-market-root]) > nav { display: flex !important; }
  [data-dsh-market-root] [class*="_titleRow"] { flex-wrap: wrap !important; }
  [data-dsh-market-root] [class*="_titleRow"] [class*="_title"] { min-width: 0; overflow-wrap: anywhere; }
  [data-dsh-market-root] [class*="_opPanel"] { max-width: calc(100vw - 24px); }

  [class*="irow"]:not([class*="irowActions"]):not([class*="irowTrailing"]) > div > [class*="spec"] {
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    max-width: 100% !important;
    font-size: 12px !important;
  }
  [class*="irow"]:not([class*="irowActions"]):not([class*="irowTrailing"]) > div > [class*="nm"] {
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    max-width: 100% !important;
  }
  [class*="irow"]:not([class*="irowActions"]):not([class*="irowTrailing"]) {
    flex-wrap: wrap !important;
    align-items: center !important;
    gap: 4px 10px !important;
  }
  [class*="irow"]:not([class*="irowActions"]):not([class*="irowTrailing"]) > div:first-child {
    flex: 1 1 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
  }
  [class*="irow"]:not([class*="irowActions"]):not([class*="irowTrailing"]) > [class*="grow"] {
    flex: 1 1 auto !important;
    order: 0 !important;
  }
  [class*="irow"]:not([class*="irowActions"]):not([class*="irowTrailing"]) > button {
    flex: 0 0 auto !important;
  }
  [class*="irow"]:not([class*="irowActions"]):not([class*="irowTrailing"]) > button[class*="switch"] {
    order: 3 !important;
  }
  [class*="irow"]:not([class*="irowActions"]):not([class*="irowTrailing"]) > button:not([class*="switch"]) {
    order: 2 !important;
  }
  [class*="irow"]:not([class*="irowActions"]):not([class*="irowTrailing"]) > [class*="owner"] {
    order: 1 !important;
  }
  [data-mobile-nav="frame"] [class*="cardShots"] {
    display: flex !important;
    flex-wrap: nowrap !important;
    overflow-x: auto !important;
    -webkit-overflow-scrolling: touch !important;
    scrollbar-width: thin !important;
    min-width: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
    gap: 8px !important;
    padding: 4px 0 !important;
  }
  [data-mobile-nav="frame"] [class*="cardShots"] > [class*="cardShot"] {
    flex: 0 0 min(100%, 420px) !important;
    width: min(100%, 420px) !important;
    max-width: 100% !important;
    height: auto !important;
    display: block !important;
    object-fit: contain !important;
  }
  [data-mobile-nav="frame"] [class*="cardShots"]::-webkit-scrollbar {
    height: 4px !important;
  }
  [data-mobile-nav="frame"] [class*="cardShots"]::-webkit-scrollbar-thumb {
    background: var(--ds-border-color, #ccc) !important;
    border-radius: 4px !important;
  }

}
`
