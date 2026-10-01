export const WORKBENCH_TRAJECTORY_CSS = `@media (max-width: 1023px) and (pointer: coarse) {
  /* Keep virtual ledger row geometry intact. Make the native inspector readable. */
  html[data-mobile-workbench-active="true"] [data-workbench-trajectory]:has(aside[class*="_details"]) {
    z-index: 70 !important;
    isolation: auto !important;
  }
  html[data-mobile-workbench-active="true"] [data-workbench-trajectory] aside[class*="_details"] {
    position: fixed !important;
    inset: 0 0 var(--mobile-workbench-nav-height) !important;
    width: 100% !important;
    max-width: none !important;
    height: auto !important;
    z-index: 65 !important;
    border: 0 !important;
    border-radius: 0 !important;
    background: var(--dsw-alias-bg-base);
  }
  [data-workbench-trajectory] aside[class*="_details"] [role="separator"] { display: none !important; }
  [data-workbench-trajectory] aside[class*="_details"] [class*="_detailsHeader"] {
    height: 56px !important;
    min-height: 56px !important;
    padding: 6px 12px !important;
    box-sizing: border-box;
  }
  [data-workbench-trajectory] aside[class*="_details"] [class*="_detailsHeader"] button {
    width: 44px !important;
    height: 44px !important;
  }
  [data-workbench-trajectory] aside[class*="_details"] [role="tablist"] {
    display: flex;
    padding: 0 8px;
    overflow-x: auto;
    flex-shrink: 0;
  }
  [data-workbench-trajectory] aside[class*="_details"] [role="tab"] {
    flex: 1 0 auto;
    min-height: 44px;
    font-size: 13px;
    white-space: nowrap;
  }
  [data-workbench-trajectory] [data-trajectory-row-key] > td:last-child { position: relative; padding-right: 20px !important; }
  [data-workbench-trajectory] [data-trajectory-row-key] > td:last-child::after {
    content: '›';
    position: absolute;
    right: 7px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 17px;
    color: var(--dsw-alias-label-tertiary);
    pointer-events: none;
  }
}
`
