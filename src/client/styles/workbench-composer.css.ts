// The native card owns both daily and expanded editing surfaces.
export const WORKBENCH_COMPOSER_CSS = `@media (max-width: 1023px) and (pointer: coarse) {
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] {
    max-height: var(--mobile-compose-card-max, 320px) !important;
    gap: 6px !important;
    padding: 8px 0 0 !important;
    position: relative;
    border-radius: 18px;
    box-shadow: 0 4px 18px rgb(0 0 0 / 5%);
  }
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-input-scroll] {
    max-height: var(--mobile-compose-input-max, 140px) !important;
    min-height: 44px !important;
    width: 100% !important;
    box-sizing: border-box;
    overflow-y: auto !important;
    overscroll-behavior-y: contain;
    scrollbar-width: thin;
    flex-shrink: 1;
  }
  html [data-phase="hero"] [data-composer-card][data-mobile-workbench-composer="true"] > [data-input-scroll] {
    min-height: 52px !important;
  }
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] [data-composer-placeholder] {
    white-space: normal !important;
    overflow: visible;
    text-overflow: clip;
  }
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"][data-mobile-compose-overflow="true"]:not([data-mobile-compose-expanded="true"]) {
    overflow-y: auto !important;
    overscroll-behavior-y: contain;
  }
  /* Metrics live in the header. Hide the whole native row, not just its contents. */
  html [data-composer-dock] {
    display: none !important;
  }
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-bar] {
    display: flex !important;
    align-items: center;
    flex-wrap: nowrap !important;
    flex: 0 0 48px;
    height: 48px;
    min-height: 48px;
    gap: 4px !important;
    padding: 2px 8px !important;
    justify-content: flex-start !important;
    box-sizing: border-box;
    overflow: visible;
    --dsh-composer-model-text-display: block;
    --dsh-composer-model-icon-display: none;
  }
  /* Keep the native permission Menu's nonzero anchor rect. */
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-bar] [data-slot="conversation.input.permission"] > span {
    display: inline-flex !important;
    flex: 0 1 auto;
    max-width: clamp(60px, 20vw, 76px);
    min-width: 44px;
    order: 10;
    position: relative;
  }
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-bar] > [class*="_tools"],
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-bar] > [class*="_tools"] > [class*="_modes"],
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-bar] > [class*="_trailing"],
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-bar] > [class*="_trailing"] > [class*="_standardControls"],
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-bar] [data-slot="conversation.input.permission"] {
    display: contents !important;
  }
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-bar] [data-mobile-nav="file-upload"] {
    display: none !important;
  }
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-bar] > [class*="_tools"] > button[class*="_add"],
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-bar] > [class*="_trailing"] > button[class*="_primary"],
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-bar] > [data-mobile-compose-toggle] {
    flex: 0 0 44px !important;
    width: 44px !important;
    height: 44px !important;
    min-height: 44px;
    margin: 0 !important;
    padding: 0 !important;
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-bar] > [class*="_tools"] > button[class*="_add"],
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-bar] > [data-mobile-compose-toggle] {
    appearance: none;
    border: 0 !important;
    background: transparent !important;
    border-radius: 10px !important;
    color: var(--dsw-alias-label-secondary);
    touch-action: manipulation;
    cursor: pointer;
  }
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-bar] > [class*="_tools"] > button[class*="_add"] svg,
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-bar] > [data-mobile-compose-toggle] svg {
    width: 20px;
    height: 20px;
  }
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-bar] > [data-mobile-compose-toggle] svg {
    fill: none;
    stroke: currentColor;
    stroke-width: 1.6;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-bar] > [class*="_trailing"] > button[class*="_primary"] {
    order: 50;
    border: 4px solid var(--dsw-alias-bg-base) !important;
    border-radius: 14px !important;
    background-clip: padding-box;
    transform: none !important;
  }
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-bar] [data-slot="conversation.input.permission"] button {
    display: inline-flex !important;
    align-items: center;
    justify-content: flex-start;
    gap: 4px !important;
    width: 100%;
    min-width: 0;
    height: 44px;
    min-height: 44px;
    padding: 0 2px !important;
    margin: 0;
    box-sizing: border-box;
    border: 0;
    background: transparent;
    color: var(--dsw-alias-label-secondary);
  }
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-bar] [data-slot="conversation.input.permission"] button [class*="_triggerIcon"] {
    flex: none;
  }
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-bar] [data-slot="conversation.input.permission"] button [class*="_triggerIcon"] svg {
    width: 16px !important;
    height: 16px !important;
  }
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-bar] [data-slot="conversation.input.permission"] button [class*="_triggerLabel"] {
    display: block !important;
    min-width: 0;
    overflow: hidden;
    white-space: nowrap !important;
    text-overflow: ellipsis;
    font-size: 12px;
    line-height: 16px;
  }
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-bar] [data-slot="conversation.input.permission"] button [class*="_chevron"],
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-bar] [data-slot="conversation.input.model"] button[aria-haspopup="menu"] > svg:not([class*="_chevron"]) {
    display: none !important;
  }
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-bar] [data-slot="conversation.input.plan"],
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-bar] [data-slot="conversation.input.left"],
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-bar] [data-slot="conversation.input.right"] {
    order: 20;
    min-width: 0;
    flex: 0 1 auto;
    margin: 0 !important;
  }
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-bar] [data-slot="conversation.input.model"] {
    display: flex !important;
    align-items: center;
    flex: 1 1 0 !important;
    min-width: 0;
    order: 30;
    overflow: visible;
  }
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-bar] [data-slot="conversation.input.model"] [class*="_root"]:has(> button[aria-haspopup="menu"]) {
    width: 100%;
    min-width: 0;
    flex: 1 1 auto !important;
    margin: 0 !important;
    overflow: visible;
  }
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-bar] [data-slot="conversation.input.model"] [class*="_root"] > button[aria-haspopup="menu"] {
    display: flex !important;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    width: 100%;
    height: 44px;
    min-height: 44px;
    min-width: 0;
    padding: 0 14px 0 2px !important;
    gap: 0 !important;
    overflow: visible;
    border: 0;
    background: transparent;
    color: var(--dsw-alias-label-secondary);
    position: relative;
    box-sizing: border-box;
  }
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-bar] [data-slot="conversation.input.model"] button[aria-haspopup="menu"] [class*="_chevron"] {
    display: block !important;
    position: absolute;
    right: 1px;
    top: 50%;
    width: 12px;
    height: 12px;
    margin: 0;
    transform: translateY(-50%);
    pointer-events: none;
  }
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-bar] [data-slot="conversation.input.model"] button[aria-haspopup="menu"] > [class*="_triggerLabel"],
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-bar] [data-slot="conversation.input.model"] button[aria-haspopup="menu"] > [class*="_triggerEffort"] {
    display: -webkit-box !important;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    flex: 0 1 auto;
    min-width: 0;
    max-width: 100%;
    max-height: 30px;
    white-space: normal !important;
    overflow-wrap: anywhere;
    overflow: hidden;
    font-size: 12px;
    line-height: 15px;
    color: var(--dsw-alias-label-secondary);
    opacity: 1;
  }
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-bar] [data-slot="conversation.input.model"] button[aria-haspopup="menu"]:has(> [class*="_triggerEffort"]:not(:empty)) > [class*="_triggerLabel"],
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-bar] [data-slot="conversation.input.model"] button[aria-haspopup="menu"] > [class*="_triggerEffort"] {
    -webkit-line-clamp: 1;
    max-height: 15px;
  }
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-bar] > [class*="_trailing"] > [class*="_activity"] {
    order: 35;
    margin: 0 !important;
  }
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-bar] > [class*="_trailing"] > [class*="_activity"]:not([class*="_activityExpanded"]):has(> [data-slot="conversation.input.activity"]:only-child:empty) {
    display: none !important;
  }
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-bar] > [data-mobile-compose-toggle] {
    order: 40;
    margin-left: auto !important;
  }
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-bar] > [data-mobile-compose-toggle]:active {
    background: var(--dsw-alias-interactive-bg-hover) !important;
  }
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] [data-mobile-compose-toggle]:focus-visible,
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-header] button:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: -2px;
  }
  /* Native command/menu geometry remains host-owned. */
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] [data-trigger-menu] {
    display: flex !important;
    flex-direction: column;
    overflow: hidden !important;
    min-height: 0;
  }
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] [data-trigger-menu] > [role="listbox"] {
    flex: 1 1 auto !important;
    min-height: 0 !important;
    overflow-y: auto !important;
    overscroll-behavior-y: contain;
    touch-action: pan-y pinch-zoom;
    -webkit-overflow-scrolling: touch;
  }
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] [data-trigger-menu] [role="option"] {
    flex-shrink: 0 !important;
  }
  html body [role="menu"][class*="_menu"]:has([class*="_cellValue"], [class*="_modelName"]) {
    box-sizing: border-box;
    max-width: calc(100vw - 24px) !important;
  }
  html body [role="menu"][class*="_menu"]:has([class*="_cellValue"], [class*="_modelName"]) :is([class*="_cellValue"], [class*="_modelName"]) {
    white-space: normal !important;
    overflow: visible !important;
    text-overflow: clip !important;
    overflow-wrap: anywhere;
    word-break: normal;
    max-width: 100% !important;
    min-width: 0;
    -webkit-line-clamp: unset;
    max-height: none;
  }
  html body [role="menu"][class*="_menu"]:has([class*="_cellValue"], [class*="_modelName"]) [class*="_optionCopy"] {
    min-width: 0;
    max-width: 100%;
  }
  html body [role="menu"][class*="_menu"]:has([class*="_cellValue"], [class*="_modelName"]) button[role] {
    height: auto;
    min-height: 44px;
  }
  /* The native trigger anchor is above the full-height card;
    expanded menus use its viewport. */
  html [data-composer-card][data-mobile-compose-expanded="true"] [data-trigger-menu] {
    position: fixed !important;
    top: auto !important;
    bottom: calc(100dvh - var(--mobile-compose-vv-top, 0px) - var(--mobile-compose-vv-height, 100dvh) + 60px) !important;
    left: calc(var(--mobile-compose-vv-left, 0px) + 16px) !important;
    width: calc(var(--mobile-compose-vv-width, 100vw) - 32px) !important;
    max-width: calc(var(--mobile-compose-vv-width, 100vw) - 32px) !important;
    max-height: min(400px, calc(var(--mobile-compose-vv-height, 100dvh) - 132px)) !important;
    z-index: 905;
  }
  /* A 12px cross keeps a 32px target within the image cell and its 8px gap. */
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] div:has(> button > img):has(> button[class*="_remove"]) {
    overflow: visible;
  }
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] div:has(> button > img) > button[class*="_remove"] {
    width: 32px;
    height: 32px;
    top: -4px;
    right: -4px;
    border: 0;
    background: transparent;
  }
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] div:has(> button > img) > button[class*="_remove"]::before {
    content: '';
    position: absolute;
    inset: 7px;
    border-radius: 50%;
    background: var(--dsw-alias-bg-mask-1, rgb(0 0 0 / 50%));
    pointer-events: none;
  }
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] div:has(> button > img) > button[class*="_remove"] svg {
    position: relative;
    width: 12px;
    height: 12px;
    pointer-events: none;
  }
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-header] {
    display: none;
  }
  html[data-mobile-compose-expanded="true"] [data-mobile-nav="frame"] [class*="_toBottomSlot"] {
    visibility: hidden !important;
    pointer-events: none !important;
  }
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"][data-mobile-compose-expanded="true"] {
    position: fixed !important;
    z-index: 900 !important;
    top: var(--mobile-compose-vv-top, 0px) !important;
    left: var(--mobile-compose-vv-left, 0px) !important;
    width: var(--mobile-compose-vv-width, 100vw) !important;
    max-width: var(--mobile-compose-vv-width, 100vw) !important;
    height: var(--mobile-compose-vv-height, 100dvh) !important;
    max-height: var(--mobile-compose-vv-height, 100dvh) !important;
    margin: 0 !important;
    padding: max(8px, env(safe-area-inset-top, 0px)) 8px max(8px, env(safe-area-inset-bottom, 0px)) !important;
    box-sizing: border-box;
    border-radius: 0;
    background: var(--dsw-alias-bg-base, Canvas);
    display: flex !important;
    flex-direction: column;
    gap: 12px !important;
    box-shadow: 0 0 0 100vmax rgb(0 0 0 / 20%);
  }
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"][data-mobile-compose-expanded="true"] > [data-mobile-compose-header] {
    display: flex;
    align-items: center;
    justify-content: space-between;
    order: -1;
    flex: 0 0 44px;
    min-height: 44px;
    padding: 0 8px;
    font-size: 16px;
    border-bottom: 1px solid var(--dsw-alias-border-l2);
  }
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-header] button {
    min-width: 60px;
    height: 44px;
    padding: 0 12px;
    border: 0;
    border-radius: 10px;
    font: inherit;
    font-size: 14px;
    font-weight: 600;
    background: transparent;
    color: inherit;
    touch-action: manipulation;
    cursor: pointer;
  }
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"][data-mobile-compose-expanded="true"] > [data-mobile-compose-bar] > [data-mobile-compose-toggle] {
    display: none !important;
  }
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"][data-mobile-compose-expanded="true"] > [data-input-scroll] {
    flex: 1 1 auto !important;
    height: auto !important;
    min-height: 52px !important;
    max-height: none !important;
  }
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"][data-mobile-compose-expanded="true"] > :not([data-input-scroll]) {
    flex-shrink: 0;
  }
}
@media (min-width: 1024px), (pointer: fine), (pointer: none) {
  [data-mobile-compose-toggle], [data-mobile-compose-header] {
    display: none !important;
  }
}
`
