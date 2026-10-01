// Append after base → layout → compat → misc. No independent style owner.
export const WORKBENCH_COMPOSER_CSS = `@media (max-width: 1023px) and (pointer: coarse) {
  /* Cap the scrollport, never the Lexical document or its growing wrapper. */
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] {
    max-height: var(--mobile-compose-card-max, 320px) !important;
    gap: 6px !important;
    position: relative;
    border-radius: 18px;
    box-shadow: 0 4px 18px rgb(0 0 0 / 5%);
  }
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] [data-input-scroll] {
    max-height: var(--mobile-compose-input-max, 140px) !important;
    overflow-y: auto !important;
    overscroll-behavior-y: contain;
    scrollbar-width: thin;
    flex-shrink: 1;
    min-height: 44px !important;
    width: calc(100% - 96px) !important;
  }
  html [data-phase="hero"] [data-composer-card][data-mobile-workbench-composer="true"] [data-input-scroll] {
    min-height: 52px !important;
  }
  /* Exceptional attachment chrome may exceed even the minimum editor budget.
     Scroll the whole card only then; ordinary anchored menus remain unclipped. */
  html [data-composer-card][data-mobile-workbench-composer="true"][data-mobile-compose-overflow="true"]:not([data-mobile-compose-expanded="true"]) {
    overflow-y: auto !important;
    overscroll-behavior-y: contain;
  }
  [data-composer-card][data-mobile-workbench-composer="true"] [data-mobile-compose-toggle] {
    appearance: none;
    position: absolute;
    top: 4px;
    right: 8px;
    z-index: 1;
    height: 44px;
    min-height: 44px;
    align-self: flex-end;
    margin: 0;
    padding: 0 14px;
    border: 1px solid rgb(128 128 128 / 22%);
    border-radius: 12px;
    background: transparent;
    color: inherit;
    font: inherit;
    font-size: 13px;
    font-weight: 600;
    touch-action: manipulation;
    cursor: pointer;
  }
  [data-mobile-compose-toggle]:active {
    background: rgb(128 128 128 / 12%);
  }
  [data-mobile-compose-toggle]:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }
  /* Two compact lanes retain every official control and reveal the model name.
     Do not put overflow on lanes: host-owned anchored menus need to escape. */
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] [class*="_row"]:has([class*="_trailing"]) {
    flex-wrap: wrap !important;
    gap: 4px 8px !important;
    padding: 2px 8px !important;
    --dsh-composer-model-text-display: block;
    --dsh-composer-model-icon-display: none;
  }
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] [class*="_row"] > [class*="_tools"],
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] [class*="_row"] > [class*="_trailing"] {
    flex: 1 0 100% !important;
    min-width: 0;
    max-width: 100%;
    gap: 8px;
    overflow: visible;
  }
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] [class*="_standardControls"] {
    flex: 1 1 auto !important;
    min-width: 0;
  }
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] [data-slot="conversation.input.model"] [class*="_trigger"] {
    padding: 0 8px !important;
    gap: 4px !important;
    max-width: 100%;
  }
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] [data-slot="conversation.input.model"] [class*="_triggerLabel"] {
    display: block !important;
    max-width: min(180px, 42vw);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  /* Reposition only: the editor remains inside its original React parent. */
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"][data-mobile-compose-expanded="true"] {
    position: fixed !important;
    z-index: 900 !important;
    top: var(--mobile-compose-vv-top, 0px) !important;
    left: var(--mobile-compose-vv-left, 0px) !important;
    width: var(--mobile-compose-vv-width, 100vw) !important;
    height: var(--mobile-compose-vv-height, 100dvh) !important;
    max-height: var(--mobile-compose-vv-height, 100dvh) !important;
    margin: 0 !important;
    padding: max(12px, env(safe-area-inset-top, 0px)) 8px max(8px, env(safe-area-inset-bottom, 0px)) !important;
    box-sizing: border-box;
    border-radius: 0;
    background: var(--dsw-alias-bg-base, Canvas);
    display: flex !important;
    flex-direction: column;
    gap: 12px !important;
    box-shadow: 0 0 0 100vmax rgb(0 0 0 / 20%);
  }
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"][data-mobile-compose-expanded="true"] [data-input-scroll] {
    flex: 1 1 auto !important;
    width: 100% !important;
    height: auto !important;
    min-height: 52px !important;
    max-height: none !important;
  }
  [data-composer-card][data-mobile-workbench-composer="true"][data-mobile-compose-expanded="true"] > [data-mobile-compose-toggle] {
    position: static;
    flex: 0 0 44px;
    order: -1;
    margin-top: 0;
    margin-bottom: 0;
  }
  [data-composer-card][data-mobile-workbench-composer="true"][data-mobile-compose-expanded="true"] > :not([data-input-scroll]) {
    flex-shrink: 0;
  }
}
@media (min-width: 1024px), (pointer: fine), (pointer: none) {
  [data-mobile-compose-toggle] {
    display: none !important;
  }
}
`
