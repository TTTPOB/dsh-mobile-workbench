export const WORKBENCH_TRAJECTORY_CSS = `@media (max-width: 1023px) and (pointer: coarse) {
  /* Keep virtual ledger row geometry intact. Make the native inspector readable. */
  html[data-mobile-workbench-active="true"] [data-workbench-trajectory]:has(aside[class*="_details"]) {
    /* Reserve the floating composer once, outside both scrolling panes. */
    padding-bottom: var(--dsh-trajectory-bottom-clearance) !important;
    box-sizing: border-box;
  }
  html[data-mobile-workbench-active="true"] [data-workbench-trajectory] [class*="_split"]:has(> aside[class*="_details"]) {
    display: grid !important;
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: minmax(0, 2fr) minmax(0, 3fr);
    --dsh-trajectory-bottom-clearance: 0px;
  }
  [data-workbench-trajectory] [class*="_split"]:has(> aside[class*="_details"]) > [data-trajectory-scroll] {
    min-height: 0 !important;
    padding-bottom: 0 !important;
    overscroll-behavior-y: contain;
  }
  html[data-mobile-workbench-active="true"] [data-workbench-trajectory] aside[class*="_details"] {
    position: relative !important;
    inset: auto !important;
    width: 100% !important;
    max-width: none !important;
    height: auto !important;
    min-height: 0 !important;
    overflow-x: hidden !important;
    overflow-y: auto !important;
    z-index: auto !important;
    border: 0 !important;
    border-top: 1px solid var(--dsw-alias-border-l2) !important;
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
  [data-workbench-trajectory] aside[class*="_details"] [class*="_detailBody"] {
    /* At short heights, scroll the inspector chrome rather than erase its body. */
    min-height: 64px !important;
    overflow-y: auto !important;
    overscroll-behavior-y: contain;
  }
  [data-workbench-trajectory] aside[class*="_details"] [role="tablist"] {
    height: 44px !important;
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
  /* Schema intro is a payload header, never the conversation chrome. */
  html[data-mobile-workbench-active="true"] [data-workbench-trajectory] aside[class*="_details"] header[class*="_schemaIntro"] {
    display: block !important;
    position: static !important;
    width: auto !important;
    height: auto !important;
    min-height: 0 !important;
    margin: 0 !important;
    padding: 12px 14px 6px !important;
    text-align: left !important;
    box-sizing: border-box;
  }
  [data-workbench-trajectory] aside[class*="_details"] [class*="_schemaDescription"] {
    white-space: pre-wrap !important;
    overflow-wrap: anywhere;
    margin: 2px 0 0 !important;
  }
  html[data-mobile-workbench-active="true"] [data-workbench-trajectory] aside[class*="_details"] header[class*="_schemaIntro"] > [class*="_schemaName"] {
    display: block !important;
    padding: 0 !important;
    margin: 0 !important;
    width: auto !important;
    overflow-wrap: anywhere;
  }
  [data-workbench-trajectory] aside[class*="_details"] pre { overflow-x: auto; max-width: 100%; }
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
