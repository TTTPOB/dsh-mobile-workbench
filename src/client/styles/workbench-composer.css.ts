// Append after base → layout → compat → misc. The official card owns the editor.
export const WORKBENCH_COMPOSER_CSS = `@media (max-width: 1023px) and (pointer: coarse) {
  /* Full-width writing surface above a single, shared 44px control baseline. */
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] {
    max-height: var(--mobile-compose-card-max, 320px) !important;
    gap: 6px !important;
    padding-top: 8px !important;
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
  /* Only exceptional attachment chrome scrolls the whole card. Ordinary menus escape. */
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"][data-mobile-compose-overflow="true"]:not([data-mobile-compose-expanded="true"]) {
    overflow-y: auto !important;
    overscroll-behavior-y: contain;
  }
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-bar] {
    display: flex !important;
    align-items: center;
    flex-wrap: nowrap !important;
    flex: 0 0 44px;
    height: 44px;
    min-height: 44px;
    gap: 2px !important;
    padding: 0 4px !important;
    box-sizing: border-box;
    overflow: visible;
    --dsh-composer-model-text-display: block;
    --dsh-composer-model-icon-display: none;
  }
  /* Flatten layout wrappers, not React ownership. No menus or plugin controls are removed. */
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-bar] > [class*="_tools"],
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-bar] > [class*="_tools"] > [class*="_modes"],
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-bar] > [class*="_trailing"],
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-bar] > [class*="_trailing"] > [class*="_standardControls"],
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-bar] [data-slot="conversation.input.permission"],
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-bar] [data-slot="conversation.input.permission"] > span {
    display: contents !important;
  }
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-bar] [data-mobile-nav="file-upload"],
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-bar] [data-mobile-nav="stats-ring-reserve"] {
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
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-bar] [data-slot="conversation.input.permission"] button {
    display: inline-flex !important;
    align-items: center;
    justify-content: center;
    gap: 4px !important;
    height: 44px;
    min-height: 44px;
    padding: 0 4px !important;
    order: 10;
    flex: 0 0 auto;
    margin: 0;
    border-radius: 10px;
    box-sizing: border-box;
    background: color-mix(in srgb, currentColor 4%, transparent);
    border: 1px solid color-mix(in srgb, currentColor 8%, transparent);
  }
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-bar] [data-slot="conversation.input.permission"] button [class*="_triggerIcon"] svg {
    width: 16px !important;
    height: 16px !important;
  }
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-bar] [data-slot="conversation.input.permission"] button [class*="_triggerLabel"] {
    display: block !important;
    white-space: normal !important;
    overflow: visible;
    text-overflow: clip;
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
    min-width: 40px;
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
    padding: 0 18px 0 6px !important;
    gap: 0 !important;
    overflow: visible;
    border-radius: 10px;
    position: relative;
    box-sizing: border-box;
    background: color-mix(in srgb, currentColor 4%, transparent);
    border: 1px solid color-mix(in srgb, currentColor 8%, transparent);
  }
  /* The native chevron identifies the menu without spending a second text lane. */
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-bar] [data-slot="conversation.input.model"] [class*="_root"] > button[aria-haspopup="menu"] [class*="_chevron"] {
    display: block !important;
    position: absolute;
    right: 5px;
    top: 50%;
    width: 12px;
    height: 12px;
    margin: 0;
    transform: translateY(-50%);
    opacity: .55;
    pointer-events: none;
  }
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-bar] [data-slot="conversation.input.model"] [class*="_root"] > button[aria-haspopup="menu"] > [class*="_triggerLabel"],
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-bar] [data-slot="conversation.input.model"] [class*="_root"] > button[aria-haspopup="menu"] > [class*="_triggerEffort"] {
    display: block !important;
    flex: 0 1 auto;
    min-width: 0;
    max-width: 100%;
    white-space: normal !important;
    overflow-wrap: anywhere;
    overflow: visible;
    text-overflow: clip;
    font-size: 12px;
    line-height: 15px;
  }
  /* Only the compact model preview is bounded; the official menu retains full names. */
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-bar] [data-slot="conversation.input.model"] [class*="_root"] > button[aria-haspopup="menu"] > [class*="_triggerLabel"] {
    display: -webkit-box !important;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    max-height: 30px;
    overflow: hidden;
    flex-shrink: 0;
  }
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-bar] [data-slot="conversation.input.model"] [class*="_root"] > button[aria-haspopup="menu"]:has(> [class*="_triggerEffort"]:not(:empty)) > [class*="_triggerLabel"] {
    -webkit-line-clamp: 1;
    max-height: 15px;
  }
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-bar] [data-slot="conversation.input.model"] [class*="_root"] > button[aria-haspopup="menu"] > [class*="_triggerEffort"] {
    display: -webkit-box !important;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    max-height: 15px;
    overflow: hidden;
    flex-shrink: 0;
    font-size: 10px;
    opacity: .65;
  }
  /* The accessible original text stays in the host node; only known display names change. */
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-bar] [data-slot] button [class*="_triggerLabel"][data-mobile-compose-label] {
    font-size: 0 !important;
    line-height: 0 !important;
  }
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-bar] [data-slot] button [class*="_triggerLabel"][data-mobile-compose-label]::after {
    content: attr(data-mobile-compose-label);
    display: block;
    font-size: 12px;
    line-height: 15px;
    white-space: normal;
    overflow-wrap: anywhere;
  }
  /* Known display-name replacements use the same line budget as verbatim labels. */
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-bar] [data-slot="conversation.input.model"] [class*="_root"] > button[aria-haspopup="menu"] > [class*="_triggerLabel"][data-mobile-compose-label]::after {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    max-height: 30px;
    overflow: hidden;
  }
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-bar] [data-slot="conversation.input.model"] [class*="_root"] > button[aria-haspopup="menu"]:has(> [class*="_triggerEffort"]:not(:empty)) > [class*="_triggerLabel"][data-mobile-compose-label]::after {
    -webkit-line-clamp: 1;
    max-height: 15px;
  }
  /* Portal scope recognizes both levels of the official model menu, not other menus. */
  html body [role="menu"][class*="_menu"]:has([class*="_cellValue"], [class*="_modelName"]) {
    box-sizing: border-box;
    max-width: calc(100vw - 24px) !important;
  }
  html body [role="menu"][class*="_menu"]:has([class*="_cellValue"], [class*="_modelName"]) [class*="_cellValue"],
  html body [role="menu"][class*="_menu"]:has([class*="_cellValue"], [class*="_modelName"]) [class*="_modelName"] {
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
  html body [role="menu"][class*="_menu"]:has([class*="_cellValue"], [class*="_modelName"]) button[role="menuitem"]:has([class*="_cellValue"]),
  html body [role="menu"][class*="_menu"]:has([class*="_cellValue"], [class*="_modelName"]) button[role="menuitemradio"]:has([class*="_modelName"]) {
    height: auto;
    min-height: 44px;
  }
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-bar] > [class*="_trailing"] > [class*="_activity"] {
    order: 35;
    margin: 0 !important;
  }
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-bar] > [data-mobile-compose-toggle] {
    order: 40;
    appearance: none;
    border: 0;
    border-radius: 12px;
    background: transparent;
    color: inherit;
    touch-action: manipulation;
    cursor: pointer;
  }
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-bar] > [data-mobile-compose-toggle] svg {
    width: 18px;
    height: 18px;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.6;
    stroke-linecap: round;
    stroke-linejoin: round;
    opacity: .65;
  }
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-bar] > [class*="_trailing"] > button[class*="_primary"] {
    order: 50;
    border-radius: 14px;
    /* rc.2's desktop primary has translateY(-2px); the shared bar needs no offset. */
    transform: none !important;
  }
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-bar] > [data-mobile-compose-toggle]:active {
    background: rgb(128 128 128 / 12%);
  }
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] [data-mobile-compose-toggle]:focus-visible,
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-header] button:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: -2px;
  }
  /* Keep the live host percentage and context details in the native footer. */
  html [data-mobile-nav="frame"] [data-phase] [data-mobile-nav="stats-ring"] {
    position: static !important;
    width: auto !important;
    height: 28px;
  }
  html [data-mobile-nav="frame"] [data-phase] [data-mobile-nav="stats-ring"] > button {
    width: auto !important;
    height: 28px;
    gap: 4px !important;
    font-size: 11px !important;
    line-height: 16px;
  }
  html [data-mobile-nav="frame"] [data-phase] [data-mobile-nav="stats-ring"] > button > svg {
    width: 14px !important;
    height: 14px !important;
  }
  html [data-mobile-nav="frame"] [data-phase] [data-mobile-nav="stats-ring"] > button > span {
    display: inline !important;
    font-size: 11px !important;
    line-height: 16px;
  }
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-header] {
    display: none;
  }
  /* Chat navigation is unrelated to the full-screen draft editor. */
  html[data-mobile-compose-expanded="true"] [data-mobile-nav="frame"] [class*="_toBottomSlot"] {
    visibility: hidden !important;
    pointer-events: none !important;
  }
  /* Reposition the same card; never move the Lexical node or mirror its draft. */
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"][data-mobile-compose-expanded="true"] {
    position: fixed !important;
    z-index: 900 !important;
    top: var(--mobile-compose-vv-top, 0px) !important;
    left: var(--mobile-compose-vv-left, 0px) !important;
    width: var(--mobile-compose-vv-width, 100vw) !important;
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
    border-bottom: 1px solid rgb(128 128 128 / 16%);
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
  [data-mobile-compose-toggle],
  [data-mobile-compose-header] {
    display: none !important;
  }
}
`
