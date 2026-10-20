window.__ModuleLoader__.load({ id: "dsh-web-mobile", factory: (require) => {
var __modules = {};
__modules["core/icon-compat.js"] = function (require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IconFolderOpen = exports.IconPanelLeft = exports.IconDownload = exports.IconPaperclip = void 0;
/** Native rc.1 icon names; missing exports fail type checking instead of hiding controls. */
var dsh_client_ui_primitives_1 = require("@deepseek-ai/dsh-client-ui-primitives");
Object.defineProperty(exports, "IconPaperclip", { enumerable: true, get: function () { return dsh_client_ui_primitives_1.IconPaperclipOutlineRegular; } });
Object.defineProperty(exports, "IconDownload", { enumerable: true, get: function () { return dsh_client_ui_primitives_1.IconDownloadOutlineRegular; } });
Object.defineProperty(exports, "IconPanelLeft", { enumerable: true, get: function () { return dsh_client_ui_primitives_1.IconPanelLeftOutlineRegular; } });
Object.defineProperty(exports, "IconFolderOpen", { enumerable: true, get: function () { return dsh_client_ui_primitives_1.IconFolderOpenOutlineRegular; } });
};
__modules["components/ComposerFileButton.js"] = function (require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComposerFileButton = ComposerFileButton;
const jsx_runtime_1 = require("react/jsx-runtime");
const icon_compat_ts_1 = require("./core/icon-compat.js");
/**
 * Mobile-only composer file entry, kept visible outside the "+" command menu.
 *
 * The 0.1.6-alpha.2 host deleted the composer's paperclip attach button: the
 * only file entry left is the 「文件」row inside the "+" listbox (the trigger's
 * aria-label is 「添加文件或调用指令」). The host still mounts its own hidden
 * `input[type=file]` in the composer tool row and its own command opens the
 * native dialog with exactly `fileInputRef.current?.click()`, so this control
 * triggers that same input instead of reimplementing intake: file validation,
 * upload and the availability policy all stay host-owned.
 *
 * The control is contributed to the host-declared `conversation.input.left`
 * list slot ("Compact controls at the left of the composer tool row"), which
 * keeps it inside the tools lane beside the plus button without touching
 * host-owned React DOM. The seat is session-scoped, so the hero/blank phase
 * (no session) keeps the "+" menu as its only file entry.
 *
 * Availability mirrors the host's `canAcceptDrop` as far as it is observable:
 * a non-plain input phase (adjudicating/claimed/submitting = the machine is
 * busy) and a subagent session both refuse attachments. The host's own
 * `locked` / `addFiles === undefined` arms are package-private, so a missing
 * session seat also disables the control. Hidden entirely on wide screens
 * (CSS media query, and the shared desktop hide block in misc.css.ts).
 */
function ComposerFileButton({ useInput, useSession, t }) {
    const busy = useInput((state) => state.phase !== 'plain');
    const subagent = useSession((state) => state.subagent !== null);
    const disabled = busy || subagent;
    const openPicker = (event) => {
        if (disabled)
            return;
        const card = event.currentTarget.closest('[data-composer-card]');
        const input = card === null ? null : card.querySelector('input[type=file]');
        if (input !== null)
            input.click();
    };
    return ((0, jsx_runtime_1.jsx)("button", { type: "button", "data-mobile-nav": "file-upload", "aria-label": t('fileUpload'), title: t('fileUpload'), disabled: disabled, onClick: openPicker, children: (0, jsx_runtime_1.jsx)(icon_compat_ts_1.IconPaperclip, { size: 16 }) }));
}
};
__modules["styles/base.css.js"] = function (require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BASE_CSS = void 0;
/* Native modal and menu layout; host portal layers remain authoritative. */
const SETTINGS = '[role="dialog"][aria-modal="true"][data-shortcut-modal="settings"]';
exports.BASE_CSS = `@media (max-width: 1023px) and (pointer: coarse) {
  [role="dialog"][aria-modal="true"] {
    box-sizing: border-box;
    max-width: calc(100vw - 16px) !important;
  }
  ${SETTINGS} {
    position: absolute !important;
    left: 8px !important;
    top: calc(env(safe-area-inset-top, 0px) + 12px) !important;
    width: calc(100vw - 16px) !important;
    height: auto;
    max-height: min(800px, calc(var(--dsh-web-mobile-vh, 100dvh) - 24px - env(safe-area-inset-top, 0px)));
    flex-direction: column !important;
    border-radius: var(--dsw-radius-panel) !important;
    animation: dsh-web-mobile-modal-enter var(--ds-transition-duration, .2s) var(--ds-ease-in-out, ease-in-out);
  }
  ${SETTINGS} > nav {
    width: 100%;
    flex-direction: row !important;
    align-items: center;
    gap: 6px;
    padding: 10px 12px 8px;
  }
  ${SETTINGS} > nav > :first-child { display: none !important; }
  ${SETTINGS} [class*="_navList"] {
    flex: 1 1 auto;
    min-width: 0;
    flex-direction: row !important;
    flex-wrap: nowrap !important;
    overflow-x: auto !important;
    gap: 6px;
    margin-right: 44px;
    scrollbar-width: thin;
  }
  ${SETTINGS} [class*="_navCell"] {
    flex: 0 0 auto !important;
    min-height: 44px;
    white-space: nowrap !important;
    padding: 6px 8px !important;
    font-size: 13px !important;
  }
  ${SETTINGS} > [class*="_content"] { flex: 1 1 auto; min-height: 0; }
  ${SETTINGS} > [class*="_content"] > [class*="_header"]:not([class*="_headerActions"]) {
    position: absolute;
    top: 10px;
    right: 12px;
    z-index: 10;
    padding: 0;
    height: 44px;
    min-height: 44px;
  }
  ${SETTINGS} > [class*="_content"] > [class*="_header"] > :last-child {
    width: 44px;
    height: 44px;
    display: inline-flex !important;
    align-items: center;
    justify-content: center;
  }
  ${SETTINGS} > [class*="_content"] > [class*="_header"] [class*="_actions"] { display: none !important; }
  ${SETTINGS} > [class*="_content"] > :last-child { padding: 0 12px 24px; }
  [aria-modal="true"] [class*="_tabs"],
  [role="dialog"][aria-modal="true"] [class*="_footer"] { flex-wrap: wrap !important; }
  [aria-modal="true"] details[class*="_customized"]:not([open]) > [class*="_customizedBody"] { display: none !important; }
  [aria-modal="true"] [class*="_cubeRow"] { gap: 6px; }
  [aria-modal="true"] [class*="_cubeRow"] > * {
    flex: 1 1 0;
    min-width: 0;
    padding: 10px 8px;
  }
  /* Stable height avoids resizing the card during keyboard focus transfer. */
  [aria-modal="true"][data-shortcut-modal="shortcuts"] {
    position: absolute !important;
    left: 8px !important;
    top: calc(env(safe-area-inset-top, 0px) + 12px) !important;
    width: calc(100vw - 16px) !important;
    max-height: min(760px, calc(var(--dsh-web-mobile-vh, 100dvh) - 24px - env(safe-area-inset-top, 0px))) !important;
    transform: none !important;
    border-radius: var(--dsw-radius-panel) !important;
    animation: none !important;
  }
  :has(> [aria-modal="true"][data-shortcut-modal="shortcuts"]) > [class*="_mask"]::after {
    animation: none !important;
    background: transparent !important;
  }
  @media (max-width: 767px) {
    [aria-modal="true"][data-shortcut-modal="shortcuts"] [class*="_searchRow"] { display: none !important; }
  }
  @keyframes dsh-web-mobile-modal-enter {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @media (prefers-reduced-motion: reduce) {
    ${SETTINGS} { animation: none !important; }
  }
}
@media (min-width: 768px) and (max-width: 1023px) and (pointer: coarse) {
  ${SETTINGS},
  [aria-modal="true"][data-shortcut-modal="shortcuts"] {
    left: 0 !important;
    right: 0 !important;
    margin-left: auto !important;
    margin-right: auto !important;
    width: min(calc(100vw - 32px), 720px) !important;
  }
}
`;
};
__modules["styles/layout.css.js"] = function (require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LAYOUT_CSS = void 0;
/** Frame and native conversation surfaces on touch-primary screens. */
exports.LAYOUT_CSS = `@media (max-width: 1023px) and (pointer: coarse) {
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
  [data-workbench-agent-menu] :is([class*="_disclosure"], [class*="_disclosureSpace"], [class*="_aside"]) {
    width: 44px !important;
    min-width: 44px !important;
    height: 44px !important;
    flex: 0 0 44px !important;
    box-sizing: border-box;
  }
  [data-workbench-agent-menu] :is([class*="_disclosure"], [class*="_sidebarButton"]) svg { width: 12px; height: 12px; }
  [data-workbench-agent-menu] [class*="_clickarea"] { margin-left: 0 !important; }
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
`;
};
__modules["styles/compat.css.js"] = function (require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.COMPAT_CSS = void 0;
/** Native workspace portal layering and plugin management. */
exports.COMPAT_CSS = `@media (max-width: 1023px) and (pointer: coarse) {
  /* Native AppFrame portals clear fullscreen workspace cells (dock layer 40). */
  body:has([data-sidebar-right-open][data-sidebar-right-panel="fullscreen"]) [class*="_overlayLayer"] {
    z-index: 50 !important;
  }
  [role="dialog"]:has([data-dsh-market-root]) > nav { display: flex !important; }
  [data-dsh-market-root] [class*="_titleRow"] { flex-wrap: wrap !important; }
  [data-dsh-market-root] [class*="_titleRow"] [class*="_title"] { min-width: 0; overflow-wrap: anywhere; }
  [data-dsh-market-root] [class*="_opPanel"] { max-width: calc(100vw - 24px); }

  [data-dsh-market-root] [class*="irow"]:not([class*="irowActions"]):not([class*="irowTrailing"]) > div > [class*="spec"] {
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    max-width: 100% !important;
    font-size: 12px !important;
  }
  [data-dsh-market-root] [class*="irow"]:not([class*="irowActions"]):not([class*="irowTrailing"]) > div > [class*="nm"] {
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    max-width: 100% !important;
  }
  [data-dsh-market-root] [class*="irow"]:not([class*="irowActions"]):not([class*="irowTrailing"]) {
    flex-wrap: wrap !important;
    align-items: center !important;
    gap: 4px 10px !important;
  }
  [data-dsh-market-root] [class*="irow"]:not([class*="irowActions"]):not([class*="irowTrailing"]) > div:first-child {
    flex: 1 1 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
  }
  [data-dsh-market-root] [class*="irow"]:not([class*="irowActions"]):not([class*="irowTrailing"]) > [class*="grow"] {
    flex: 1 1 auto !important;
    order: 0 !important;
  }
  [data-dsh-market-root] [class*="irow"]:not([class*="irowActions"]):not([class*="irowTrailing"]) > button {
    flex: 0 0 auto !important;
  }
  [data-dsh-market-root] [class*="irow"]:not([class*="irowActions"]):not([class*="irowTrailing"]) > button[class*="switch"] {
    order: 3 !important;
  }
  [data-dsh-market-root] [class*="irow"]:not([class*="irowActions"]):not([class*="irowTrailing"]) > button:not([class*="switch"]) {
    order: 2 !important;
  }
  [data-dsh-market-root] [class*="irow"]:not([class*="irowActions"]):not([class*="irowTrailing"]) > [class*="owner"] {
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
`;
};
__modules["styles/misc.css.js"] = function (require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MISC_CSS = void 0;
/** Browser input geometry and desktop isolation. */
exports.MISC_CSS = `@media (max-width: 1023px) and (pointer: coarse) {
  /* Text entry and its mirror share the iOS 16px focus-zoom floor. */
  html[data-mobile-nav-ios] textarea,
  html[data-mobile-nav-ios] [contenteditable]:not([contenteditable="false"]),
  html[data-mobile-nav-ios] [data-input-mirror],
  html[data-mobile-nav-ios] [data-input-backdrop],
  html[data-mobile-nav-ios] input:not([type="button"]):not([type="checkbox"]):not([type="color"]):not([type="file"]):not([type="hidden"]):not([type="image"]):not([type="radio"]):not([type="range"]):not([type="reset"]):not([type="submit"]) {
    font-size: max(16px, var(--dsw-font-markdown-base-font-size, var(--dsh-content-font-size, 16px))) !important;
  }
}
@media (min-width: 1024px), (pointer: fine), (pointer: none) {
  [data-mobile-nav="toggle"],
  [data-mobile-nav="files"],
  [data-mobile-nav="file-upload"] { display: none !important; }
}
`;
};
__modules["styles/workbench-composer.css.js"] = function (require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WORKBENCH_COMPOSER_CSS = void 0;
// The native card owns both daily and expanded editing surfaces.
exports.WORKBENCH_COMPOSER_CSS = `@media (max-width: 1023px) and (pointer: coarse) {
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] {
    max-height: var(--mobile-compose-card-max, 320px) !important;
    margin: 0 !important;
    width: 100% !important;
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
  /* Remove the native 16px/4px inner wrapper padding before applying one outer gap. */
  html [data-mobile-nav="frame"] [data-composer-seat] [class*="_root"]:has(> [data-composer-card]) {
    padding: 0 !important;
  }
  /* The frame/navigation own safe-area insets; this is only the content gap. */
  html [data-mobile-nav="frame"] [data-composer-seat] {
    padding: 0 8px 8px !important;
    box-sizing: border-box;
  }
  html [data-mobile-nav="frame"] [data-composer-card][data-mobile-workbench-composer="true"] [class*="_grow"]:has(> [data-composer-input]) {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
  }
  html [data-mobile-nav="frame"] [data-composer-card][data-mobile-workbench-composer="true"] [class*="_grow"] > [data-composer-input],
  html [data-mobile-nav="frame"] [data-composer-card][data-mobile-workbench-composer="true"] [class*="_grow"] > [data-composer-placeholder] {
    grid-area: 1 / 1;
    min-width: 0;
    padding-left: 25px !important;
    padding-right: 48px !important;
  }
  html [data-mobile-nav="frame"] [data-composer-card][data-mobile-workbench-composer="true"] [class*="_grow"] > [data-composer-placeholder] {
    position: static !important;
    inset: auto !important;
    width: auto !important;
    box-sizing: border-box;
    padding-top: 4px;
    pointer-events: none;
  }
  /* Metrics live in the header. Hide the whole native row, not just its contents. */
  html [data-composer-dock] {
    display: none !important;
  }
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-bar] {
    display: flex !important;
    align-items: center;
    flex-wrap: nowrap !important;
    flex: 0 0 50px;
    height: 50px;
    min-height: 50px;
    gap: 4px !important;
    padding: 0 !important;
    justify-content: flex-start !important;
    box-sizing: border-box;
    overflow: visible;
    --dsh-composer-model-text-display: block;
    --dsh-composer-model-icon-display: none;
  }
  /* Keep the native permission Menu's nonzero anchor rect. */
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-bar] [data-slot="conversation.input.permission"] > span {
    display: inline-flex !important;
    flex: 0 0 50px;
    width: 50px;
    max-width: 50px;
    min-width: 50px;
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
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-toggle] {
    margin: 0 !important;
    padding: 0 !important;
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-bar] > [class*="_tools"] > button[class*="_add"],
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-bar] > [class*="_trailing"] > button[class*="_primary"] {
    flex: 0 0 50px !important;
    width: 50px !important;
    height: 50px !important;
    min-height: 50px;
  }
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-bar] > [class*="_tools"] > button[class*="_add"],
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-toggle] {
    appearance: none;
    border: 0 !important;
    background: transparent !important;
    border-radius: 10px !important;
    color: var(--dsw-alias-label-secondary);
    touch-action: manipulation;
    cursor: pointer;
  }
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-toggle] svg {
    width: 18px;
    height: 18px;
  }
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-toggle] svg {
    fill: none;
    stroke: currentColor;
    stroke-width: 1.6;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-bar] > [class*="_tools"] > button[class*="_add"] svg {
    width: 22.5px;
    height: 22.5px;
  }
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-bar] > [class*="_trailing"] > button[class*="_primary"] svg {
    width: 20px;
    height: 20px;
  }
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-bar] > [class*="_trailing"] > button[class*="_primary"] {
    order: 50;
    border: 6px solid transparent !important;
    border-radius: 17.5px !important;
    background-clip: padding-box;
    transform: none !important;
  }
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-bar] [data-slot="conversation.input.permission"] button {
    display: inline-flex !important;
    align-items: center;
    justify-content: center;
    gap: 4px !important;
    width: 100%;
    min-width: 0;
    height: 50px;
    min-height: 50px;
    padding: 0 !important;
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
    width: 20px !important;
    height: 20px !important;
  }
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-bar] [data-slot="conversation.input.permission"] button [class*="_triggerLabel"] {
    display: none !important;
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
    height: 50px;
    min-height: 50px;
    min-width: 0;
    max-width: none;
    text-align: left;
    padding: 0 17px 0 2px !important;
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
    width: 15px;
    height: 15px;
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
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-toggle] {
    position: absolute;
    top: 0;
    right: 5px;
    width: 40px !important;
    height: 40px !important;
    min-height: 40px;
    z-index: 2;
  }
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"] > [data-mobile-compose-toggle]:active {
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
    bottom: calc(100dvh - var(--mobile-compose-vv-top, 0px) - var(--mobile-compose-vv-height, 100dvh) + 62px) !important;
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
  html [data-mobile-nav="frame"] [data-phase] [data-composer-card][data-mobile-workbench-composer="true"][data-mobile-compose-expanded="true"] > [data-mobile-compose-toggle] {
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
`;
};
__modules["styles/index.js"] = function (require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MOBILE_CSS = void 0;
const base_css_ts_1 = require("./styles/base.css.js");
const layout_css_ts_1 = require("./styles/layout.css.js");
const compat_css_ts_1 = require("./styles/compat.css.js");
const misc_css_ts_1 = require("./styles/misc.css.js");
const workbench_composer_css_ts_1 = require("./styles/workbench-composer.css.js");
/** Region styles share one tag: frame, overlays, integrations, browser inputs, composer. */
exports.MOBILE_CSS = [layout_css_ts_1.LAYOUT_CSS, base_css_ts_1.BASE_CSS, compat_css_ts_1.COMPAT_CSS, misc_css_ts_1.MISC_CSS, workbench_composer_css_ts_1.WORKBENCH_COMPOSER_CSS].join('\n');
};
__modules["workbench/page-history.js"] = function (require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.installPageHistory = installPageHistory;
/** Own at most one same-document entry above the session page; panel history stays independent. */
function installPageHistory(window, restorePage, panelActive) {
    let owned = false;
    let consuming = false;
    const pop = (event) => {
        if (event.state?.mobilePanelExit || panelActive())
            return;
        const page = event.state?.mobileWorkbenchPage;
        // Native global-panel navigation collapses its sidebar; restore the underlying page on pop.
        if (owned && (page === 'sessions' || page === 'files')) {
            restorePage(page);
            return;
        }
        if (owned && !page) {
            owned = false;
            consuming = false;
            restorePage('session');
        }
    };
    const sync = (page) => {
        if (!owned || consuming || panelActive() || window.history.state?.mobilePanelExit)
            return;
        if (page === 'session') {
            consuming = true;
            window.history.back();
        }
    };
    const enter = (page) => {
        if (panelActive() || window.history.state?.mobilePanelExit || consuming)
            return;
        if (page === 'session') {
            sync(page);
            return;
        }
        const state = { ...window.history.state, mobileWorkbenchPage: page };
        if (owned)
            window.history.replaceState(state, '');
        else {
            window.history.pushState(state, '');
            owned = true;
        }
    };
    window.addEventListener('popstate', pop);
    return { enter, sync, dispose: () => { window.removeEventListener('popstate', pop); } };
}
};
__modules["core/layout-compat.js"] = function (require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.panelSelectorOf = panelSelectorOf;
/** Return the public rc.1 panel command used to reveal the session page. */
function panelSelectorOf(layout) {
    return () => { layout.selectPanel(null); };
}
};
__modules["core/sessions-compat.js"] = function (require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.currentSessionIdOf = currentSessionIdOf;
/** The public main-view retain count identifies the visible session. */
function currentSessionIdOf(list) {
    const snapshot = list;
    return Object.values(snapshot?.byId ?? {}).find(summary => (summary.retainedBy?.mainView ?? 0) > 0)?.id;
}
};
__modules["effects/phone-viewport.js"] = function (require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STABLE_VIEWPORT_VAR = void 0;
exports.detectIosWebKit = detectIosWebKit;
exports.installPhoneChrome = installPhoneChrome;
const phone_chrome_ts_1 = require("./effects/phone-chrome.js");
/** iOS text fields need the stylesheet font-size floor to avoid focus zoom. */
function detectIosWebKit(nav, supports) {
    if (supports !== null) {
        try {
            if (supports('(font: -apple-system-body) and (-webkit-touch-callout: none)'))
                return true;
        }
        catch {
            // Fall back to the UA when the CSS probe is unavailable.
        }
    }
    if (/iP(hone|ad|od)/.test(nav.userAgent))
        return true;
    return /Macintosh/.test(nav.userAgent) && nav.maxTouchPoints > 1;
}
const IOS_MARKER = 'data-mobile-nav-ios';
// Safe-area support must not disable user pinch zoom.
const VIEWPORT_CONTENT = 'width=device-width, initial-scale=1, viewport-fit=cover';
exports.STABLE_VIEWPORT_VAR = '--dsh-web-mobile-vh';
const findViewportMeta = () => document.querySelector('meta[name="viewport"]');
/** Own viewport-fit and keyboard-less modal height; the Host owns theme-color. */
function installPhoneChrome(ctx) {
    (0, phone_chrome_ts_1.installMobileEffect)(ctx, 'dsh-web-mobile: viewport + zoom guard', () => {
        const root = document.documentElement;
        let originalViewport = null;
        let observedMeta = null;
        const assertViewport = () => {
            const viewport = findViewportMeta();
            if (viewport === null)
                return;
            if (originalViewport === null)
                originalViewport = viewport.content;
            if (viewport.content !== VIEWPORT_CONTENT)
                viewport.content = VIEWPORT_CONTENT;
        };
        const metaObserver = new MutationObserver(assertViewport);
        const attachMetaObserver = () => {
            const viewport = findViewportMeta();
            if (viewport === observedMeta)
                return;
            metaObserver.disconnect();
            observedMeta = viewport;
            if (viewport !== null)
                metaObserver.observe(viewport, { attributes: true, attributeFilter: ['content'] });
        };
        // The host may rewrite or replace its viewport meta after initial mount.
        const headObserver = new MutationObserver(() => { attachMetaObserver(); assertViewport(); });
        headObserver.observe(document.head, { childList: true });
        attachMetaObserver();
        assertViewport();
        const cssSupports = typeof CSS !== 'undefined' && typeof CSS.supports === 'function'
            ? (condition) => CSS.supports(condition) : null;
        if (detectIosWebKit(navigator, cssSupports))
            root.setAttribute(IOS_MARKER, '');
        // Android adjustResize changes all viewport units with the keyboard.
        // Keep modal height stable until growth or a real width/rotation change.
        let stableVh = 0;
        let stableWidth = 0;
        const syncStableViewport = () => {
            const height = window.innerHeight;
            const width = window.innerWidth;
            if (stableVh === 0 || height > stableVh || width !== stableWidth) {
                stableVh = height;
                stableWidth = width;
                root.style.setProperty(exports.STABLE_VIEWPORT_VAR, `${height}px`);
            }
        };
        syncStableViewport();
        window.addEventListener('resize', syncStableViewport);
        return () => {
            window.removeEventListener('resize', syncStableViewport);
            root.style.removeProperty(exports.STABLE_VIEWPORT_VAR);
            metaObserver.disconnect();
            headObserver.disconnect();
            const viewport = findViewportMeta();
            if (viewport !== null && originalViewport !== null && viewport.content === VIEWPORT_CONTENT) {
                viewport.content = originalViewport;
            }
            root.removeAttribute(IOS_MARKER);
        };
    });
}
};
__modules["effects/phone-chrome.js"] = function (require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TOUCH_QUERY = exports.DESKTOP_QUERY = exports.MOBILE_QUERY = exports.STABLE_VIEWPORT_VAR = exports.installPhoneChrome = exports.detectIosWebKit = void 0;
exports.installMobileEffect = installMobileEffect;
exports.findFrame = findFrame;
exports.getFrame = getFrame;
exports.toggleDrawer = toggleDrawer;
var phone_viewport_ts_1 = require("./effects/phone-viewport.js");
Object.defineProperty(exports, "detectIosWebKit", { enumerable: true, get: function () { return phone_viewport_ts_1.detectIosWebKit; } });
Object.defineProperty(exports, "installPhoneChrome", { enumerable: true, get: function () { return phone_viewport_ts_1.installPhoneChrome; } });
Object.defineProperty(exports, "STABLE_VIEWPORT_VAR", { enumerable: true, get: function () { return phone_viewport_ts_1.STABLE_VIEWPORT_VAR; } });
/** Mobile adaptation is restricted to touch-primary viewports below 1024px. */
exports.MOBILE_QUERY = '(max-width: 1023px) and (pointer: coarse)';
exports.DESKTOP_QUERY = '(min-width: 1024px)';
exports.TOUCH_QUERY = '(pointer: coarse)';
/** Own a breakpoint-scoped effect and dispose it before rearming. */
function installMobileEffect(ctx, label, install, query = exports.MOBILE_QUERY) {
    ctx.effect(() => {
        const narrow = window.matchMedia(query);
        let cleanup;
        const arm = () => {
            cleanup?.();
            cleanup = narrow.matches ? install(narrow) : undefined;
        };
        arm();
        narrow.addEventListener('change', arm);
        return () => {
            narrow.removeEventListener('change', arm);
            cleanup?.();
        };
    }, label);
}
function findFrame() {
    return document.querySelector('[data-shell-overlay]')?.parentElement ?? null;
}
function getFrame() {
    return document.querySelector('[data-mobile-nav="frame"]') ?? findFrame();
}
/** Workbench pages use the host sidebar state, with no drawer animation. */
function toggleDrawer(ctx) {
    ctx.layout.toggleSidebar();
}
};
__modules["styles/workbench.css.js"] = function (require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WORKBENCH_CSS = void 0;
exports.WORKBENCH_CSS = `
/* Workbench contributes chrome, not a second conversation implementation. */
[data-mobile-workbench="navigation"] { display: none; }
@media (max-width: 1023px) and (pointer: coarse) {
  html[data-mobile-workbench-active="true"] {
    --mobile-workbench-nav-size: calc(56px + env(safe-area-inset-bottom, 0px));
    --mobile-workbench-nav-height: max(0px, calc(var(--mobile-workbench-nav-size) - var(--mobile-compose-nav-release, 0px)));
  }
  html[data-mobile-workbench-active="true"] [data-mobile-nav="frame"] {
    padding-bottom: var(--mobile-workbench-nav-height) !important;
    box-sizing: border-box;
  }
  [data-mobile-workbench="navigation"] {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    position: fixed;
    inset: auto 0 0;
    height: var(--mobile-workbench-nav-size);
    padding: 4px 8px calc(4px + env(safe-area-inset-bottom, 0px));
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
  [data-mobile-workbench="navigation"] button > span { white-space: nowrap; font-size: 12px; line-height: 16px; }
  [data-mobile-workbench="navigation"] button[aria-current="page"] {
    color: var(--dsw-alias-label-primary);
    background: var(--dsw-alias-interactive-bg-hover);
    font-weight: 600;
  }
  [data-mobile-workbench="navigation"] button:disabled { opacity: .42; cursor: default; }
  [data-mobile-workbench="navigation"] button:focus-visible {
    outline: 2px solid var(--dsw-static-deepseek-500);
    outline-offset: -2px;
  }
  /* Native sessions content fills the page; bottom tools share one grid row. */
  html[data-mobile-workbench-active="true"] [data-mobile-nav="frame"] > :first-child [class*="_root"]:has(> [class*="_regionArea"]) {
    display: grid !important;
    position: relative;
    width: 100% !important;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    grid-template-rows: auto auto minmax(0, 1fr) auto;
  }
  html[data-mobile-workbench-active="true"] [data-mobile-nav="frame"] > :first-child [class*="_logoRow"] { grid-column: 1 / -1; grid-row: 1; }
  html[data-mobile-workbench-active="true"] [data-mobile-nav="frame"] > :first-child [class*="_newSession"] { grid-column: 1 / -1; grid-row: 2; }
  html[data-mobile-workbench-active="true"] [data-mobile-nav="frame"] > :first-child [class*="_regionArea"] { grid-column: 1 / -1; grid-row: 3; min-height: 0; }
  html[data-mobile-workbench-active="true"] [data-mobile-nav="frame"] > :first-child [class*="_panelList"] { grid-column: 1; grid-row: 4; align-self: end; margin: 0 !important; }
  html[data-mobile-workbench-active="true"] [data-mobile-nav="frame"] > :first-child [class*="_footArea"] { grid-column: 2; grid-row: 4; align-self: end; margin: 0 !important; }
  /* Bottom tools share the same row height, without Settings' native 4px margins. */
  html[data-mobile-workbench-active="true"] [data-mobile-nav="frame"] > :first-child [class*="_settingsArea"] [class*="_triggerRow"] { margin: 0 !important; width: 100% !important; }
  html[data-mobile-workbench-active="true"] [data-mobile-nav="frame"] > :first-child [class*="_panelList"] button[class*="_panelRow"],
  html[data-mobile-workbench-active="true"] [data-mobile-nav="frame"] > :first-child [class*="_settingsArea"] [class*="_triggerRow"] button[class*="_trigger"] {
    height: 44px !important;
    min-height: 44px !important;
    margin: 0 !important;
    padding: 0 8px !important;
    align-items: center;
    box-sizing: border-box;
  }
  html[data-mobile-workbench-active="true"] [data-mobile-nav="frame"] > :first-child [class*="_wide"] { animation: none !important; }
  /* Native lateral slides stay off; only content fades when its page enters. */
  html[data-mobile-workbench-active="true"] [data-sidebar-right-toggle] { display: none !important; }
  html[data-mobile-workbench-active="true"][data-mobile-workbench-page="sessions"] [data-mobile-nav="frame"] > :first-child,
  html[data-mobile-workbench-active="true"][data-mobile-workbench-page="session"] [data-mobile-nav="frame"] [data-phase]:has(> [data-slot="conversation.header"]),
  html[data-mobile-workbench-active="true"][data-mobile-workbench-page="files"] [data-sidebar-right-panel][data-sidebar-right-open]:not([data-sidebar-right-open="false"]) {
    animation: mobile-workbench-page-enter var(--ds-transition-duration, 0.16s) var(--ds-ease-in-out, ease) !important;
  }
  @keyframes mobile-workbench-page-enter { from { opacity: 0; } to { opacity: 1; } }
  @media (prefers-reduced-motion: reduce) {
    html[data-mobile-workbench-active="true"][data-mobile-workbench-page="sessions"] [data-mobile-nav="frame"] > :first-child,
    html[data-mobile-workbench-active="true"][data-mobile-workbench-page="session"] [data-mobile-nav="frame"] [data-phase]:has(> [data-slot="conversation.header"]),
    html[data-mobile-workbench-active="true"][data-mobile-workbench-page="files"] [data-sidebar-right-panel] { animation: none !important; }
  }
  html[data-mobile-workbench-active="true"] [data-sidebar-right-panel] :is([data-dockkit-host="dock"], [data-dockkit-empty], [data-dockkit-divider]) { transition: none !important; }
  /* Keyboard visibility never changes layout clearance in a discrete step. */
  html[data-mobile-compose-expanded="true"],
  html[data-mobile-workbench-keyboard="true"]:has([aria-modal="true"]) {
    --mobile-workbench-nav-height: 0px !important;
  }
  html:has([aria-modal="true"]) [data-mobile-workbench="navigation"],
  html[data-mobile-workbench-keyboard="true"] [data-mobile-workbench="navigation"],
  html[data-mobile-compose-expanded="true"] [data-mobile-workbench="navigation"] {
    display: none !important;
  }
  /* Normal editing uses the same visual viewport as the composer budget.
     Do not translate after the browser has already panned to the caret. */
  html[data-mobile-workbench-active="true"]:not([data-mobile-compose-expanded="true"]):not(:has([aria-modal="true"])) [data-mobile-nav="frame"]:has([data-mobile-workbench-composer="true"]) {
    max-height: min(100%, var(--mobile-compose-frame-max, 100%)) !important;
  }
  /* Only a coarse keyboard return gets a short theme motion; live viewport frames do not. */
  html[data-mobile-workbench-active="true"][data-mobile-compose-returning="true"]:not([data-mobile-compose-expanded="true"]):not(:has([aria-modal="true"])) [data-mobile-nav="frame"]:has([data-mobile-workbench-composer="true"]) {
    transition: max-height var(--ds-transition-duration, 0.2s) var(--ds-ease-in-out, ease), padding-bottom var(--ds-transition-duration, 0.2s) var(--ds-ease-in-out, ease) !important;
  }
  @media (prefers-reduced-motion: reduce) {
    html[data-mobile-compose-returning="true"] [data-mobile-nav="frame"] { transition: none !important; }
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
    padding-top: env(safe-area-inset-top, 0px) !important;
    box-sizing: border-box;
  }
}
@media (min-width: 1024px), (pointer: fine), (pointer: none) {
  [data-mobile-workbench="navigation"] { display: none !important; }
}
`;
};
__modules["styles/workbench-header.css.js"] = function (require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WORKBENCH_HEADER_CSS = void 0;
const H = 'html[data-mobile-workbench-active="true"] [data-mobile-nav="frame"] [data-phase] header[data-mobile-workbench-header]';
// The host background-task chip is a class-less wrapper directly under the header
// actions slot; the old `_root` arm stopped matching when the host dropped that
// wrapper class, so the chip fell out of the first row. Anchor on the slot and on
// the count inside the trigger instead, and keep the team chip out of the match.
const TASKS = '[data-slot="conversation.session.header.actions"] > div:has(> button[class*="_trigger"] > [class*="_count"])';
exports.WORKBENCH_HEADER_CSS = `@media (max-width: 1023px) and (pointer: coarse) {
  ${H} {
    position: relative !important;
    display: block !important;
    padding: 8px 12px !important;
    width: 100% !important;
    min-height: 108px !important;
    box-sizing: border-box !important;
    flex-shrink: 0;
  }
  ${H} [data-mobile-nav="toggle"],
  ${H} [data-conversation-header-leading],
  ${H} [data-conversation-header-corner],
  ${H}[data-workbench-tabs-owned] [data-conversation-tabs],
  ${H} nav[class*="_crumbs"],
  ${H} [data-workbench-agent-count],
  ${H} [data-slot="conversation.session.header.actions"] > span[title],
  ${H} [data-slot="conversation.session.header.utilities"] > :has([data-open-target]) { display: none !important; }
  ${H} [class*="_titleRow"], ${H} [class*="_titleCluster"], ${H} [class*="_headerActions"] {
    width: 100% !important;
    max-width: none !important;
    min-width: 0 !important;
    padding: 0 !important;
    margin: 0 !important;
    overflow: visible !important;
  }
  ${H} [class*="_titleRow"], ${H} [class*="_titleCluster"] { display: block !important; }
  /* Host nodes and the plugin nodes are siblings under the display:contents slot,
     so the actions row is a grid: row one keeps the title and the reserve for the
     absolutely positioned native utilities, row two holds the view tabs, the
     background-task chip, the host team chip and the downstream directory. */
  ${H} [class*="_headerActions"] {
    display: grid !important;
    grid-template-columns: auto minmax(0, 1fr) auto auto;
    grid-template-rows: 44px 44px;
    grid-template-areas:
      "main main main main"
      "views tasks team agents";
    column-gap: 4px;
    row-gap: 4px;
    align-items: center;
  }
  ${H} [data-workbench-header-main] {
    grid-area: main;
    display: flex;
    align-items: center;
    min-width: 0;
    height: 44px;
    padding-right: 44px;
  }
  /* The plugin owns this wrapper, so it can dissolve into the grid without
     touching either host node or the plugin controls inside it. */
  ${H} [data-workbench-header-secondary] { display: contents !important; }
  ${H} button[data-workbench-context-control] {
    appearance: none;
    box-sizing: border-box;
    display: inline-flex !important;
    align-items: center;
    justify-content: center;
    flex: none;
    height: 44px !important;
    min-height: 44px !important;
    min-width: 44px !important;
    padding: 0 4px !important;
    border: 0;
    border-radius: 8px;
    background: transparent;
    color: var(--dsw-alias-label-secondary);
    font: inherit;
    font-size: 12px;
    line-height: 16px;
    touch-action: manipulation;
  }
  ${H} button[data-workbench-context-control]:focus-visible { outline: 2px solid currentColor; outline-offset: -2px; }
  ${H} button[data-workbench-context-control] > svg { width: 20px; height: 20px; flex: none; }
  ${H} button[data-workbench-title-info] {
    flex: 1 1 0;
    min-width: 0 !important;
    justify-content: flex-start;
    text-align: left;
    color: var(--dsw-alias-label-primary);
    font-size: 15px;
    line-height: 20px;
    font-weight: 600;
  }
  ${H} [data-workbench-title-info] span {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    word-break: normal;
    overflow-wrap: anywhere;
  }
  ${H} button[data-mobile-workbench="parent"] { width: 44px; }
  ${H} button[data-mobile-workbench="stats"] { width: 56px; min-width: 56px !important; gap: 3px; font-size: 11px; }
  ${H} button[data-mobile-workbench="stats"] > svg { width: 16px; height: 16px; }
  ${H} [data-mobile-workbench="views"] { grid-area: views; display: flex; flex: none; }
  ${H} [data-workbench-view] { position: relative; border-radius: 0 !important; padding: 0 8px !important; }
  ${H} [data-workbench-view][aria-selected="true"] { color: var(--dsw-alias-label-primary); font-weight: 600; }
  ${H} [data-workbench-view][aria-selected="true"]::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 4px;
    right: 4px;
    height: 2px;
    background: var(--dsw-static-deepseek-500);
  }
  ${H} [data-workbench-mode] { flex: 1 1 0; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 11px; color: var(--dsw-alias-label-secondary); }
  ${H} [data-mobile-workbench="agents"] { grid-area: agents; justify-self: end; gap: 4px; }
  ${H} [data-team-action] { grid-area: team; justify-self: end; }
  /* The host hides the team label below 480px, so the icon-only phone trigger
     reaches 44px through min-width while tablets keep the visible label. */
  ${H} [data-team-action] > button {
    box-sizing: border-box;
    min-width: 44px !important;
    height: 44px !important;
    min-height: 44px !important;
    padding: 0 6px !important;
    justify-content: center;
    touch-action: manipulation;
  }
  ${H} ${TASKS} {
    grid-area: tasks;
    justify-self: start;
    align-items: center;
    min-width: 0;
    max-width: 100%;
    overflow: hidden;
  }
  ${H} ${TASKS} > button {
    box-sizing: border-box;
    height: 44px !important;
    min-height: 44px !important;
    min-width: 0 !important;
    max-width: 100% !important;
    touch-action: manipulation;
  }
  ${H} ${TASKS} > button [class*="_count"] {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  ${H} [data-workbench-count] { background: transparent; font-size: 11px; padding: 0; margin: 0; }
  ${H} button[data-mobile-workbench="agents"] > svg { width: 16px; height: 16px; }
  /* Touch feedback remains visible without permanently filling every control. */
  ${H} :is(button[data-workbench-context-control], [class*="_headerUtilities"] button[aria-haspopup="menu"])[aria-expanded="true"]:not(:disabled) {
    background: var(--dsw-alias-interactive-bg-hover);
    color: var(--dsw-alias-label-primary);
  }
  @media (hover: hover) {
    ${H} :is(button[data-workbench-context-control], [class*="_headerUtilities"] button[aria-haspopup="menu"]):hover:not(:disabled) {
      background: var(--dsw-alias-interactive-bg-hover);
      color: var(--dsw-alias-label-primary);
    }
  }
  ${H} :is(button[data-workbench-context-control], [class*="_headerUtilities"] button[aria-haspopup="menu"]):active:not(:disabled) {
    background: var(--dsw-alias-interactive-bg-active);
    color: var(--dsw-alias-label-primary);
  }
  ${H} [class*="_headerUtilities"] button[aria-haspopup="menu"]:focus-visible { outline: 2px solid currentColor; outline-offset: -2px; }
  ${H} [class*="_headerUtilities"] { display: flex !important; position: absolute !important; top: 8px !important; right: 12px !important; width: 44px !important; height: 44px !important; padding: 0 !important; margin: 0 !important; }
  ${H} [class*="_headerUtilities"] button[aria-haspopup="menu"] { display: flex !important; align-items: center; justify-content: center; width: 44px !important; min-width: 44px !important; height: 44px !important; min-height: 44px !important; padding: 0 !important; }
  [data-workbench-stats-panel] {
    position: fixed;
    z-index: 100;
    width: min(336px, calc(100vw - 24px));
    max-height: 60dvh;
    overflow-y: auto;
    padding: 12px;
    box-sizing: border-box;
    border-radius: var(--dsw-radius-lg);
    border: 1px solid var(--dsw-alias-border-l1);
    box-shadow: var(--dsw-elevation-prominent);
    color: var(--dsw-alias-label-primary);
  }
  [data-workbench-stats-panel] h2 { display: flex; justify-content: space-between; font-size: 14px; margin: 8px 0; }
  [data-workbench-stats-panel] dl { margin: 0 0 12px; font-size: 13px; }
  [data-workbench-stats-panel] dl > div { display: flex; justify-content: space-between; gap: 12px; padding: 4px 0; }
  [data-workbench-stats-panel] dt { color: var(--dsw-alias-label-secondary); min-width: 0; }
  [data-workbench-stats-panel] dd { margin: 0; flex: none; text-align: right; white-space: nowrap; }
  .mobile-workbench-session-info { width: min(400px, calc(100vw - 24px)); overflow-wrap: anywhere; }
  .mobile-workbench-session-info button { min-width: 44px; min-height: 44px; }
  /* Native catalog behaves as a readable sheet, not a tiny header popover. */
  html[data-mobile-workbench-active="true"] [data-workbench-agent-menu] {
    position: fixed !important;
    top: auto !important;
    left: 12px !important;
    right: 12px !important;
    bottom: calc(var(--mobile-workbench-nav-height) + 10px) !important;
    width: auto !important;
    max-width: none !important;
    max-height: min(65dvh, 520px) !important;
    border-radius: var(--dsw-radius-lg) !important;
    padding: 10px !important;
    box-shadow: var(--dsw-elevation-prominent);
    border: 1px solid var(--dsw-alias-border-l1);
    box-sizing: border-box;
  }
  /* Keep the native absolute background pseudo-element out of the title layout. */
  [data-workbench-agent-menu] > [data-workbench-agent-heading] {
    flex: none;
    margin: 0;
    padding: 4px 6px 10px;
    font-size: 14px;
    font-weight: 600;
    line-height: 22px;
    max-height: 25dvh;
    overflow-y: auto;
    overflow-wrap: anywhere;
  }
  [data-workbench-agent-heading] h2 { font-size: 16px; line-height: 22px; margin: 0; }
  [data-workbench-agent-heading] p { font-size: 12px; line-height: 18px; margin: 4px 0 0; color: var(--dsw-alias-label-secondary); }
  [data-workbench-agent-menu] > [role="tree"] {
    flex: 1 1 auto !important;
    min-height: 0 !important;
    max-height: none !important;
    overflow-y: auto !important;
    padding: 4px 2px;
    overscroll-behavior-y: contain;
  }
  [data-workbench-agent-menu] [class*="_content"] { min-width: 0 !important; }
  [data-workbench-agent-menu] [class*="_metrics"] { flex: none !important; }
  [data-workbench-agent-menu] [class*="_label"],
  [data-workbench-agent-menu] [class*="_summary"] {
    white-space: normal !important;
    overflow-wrap: anywhere;
    text-overflow: clip !important;
    line-height: 1.5 !important;
  }
  [data-workbench-agent-menu] [class*="_label"] { font-size: 14px; }
  [data-workbench-agent-menu] [class*="_summary"] { font-size: 11px; }
  [data-workbench-agent-menu] [class*="_sidebarButton"] { width: 44px; height: 44px; }
}
`;
};
__modules["styles/workbench-trajectory.css.js"] = function (require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WORKBENCH_TRAJECTORY_CSS = void 0;
exports.WORKBENCH_TRAJECTORY_CSS = `@media (max-width: 1023px) and (pointer: coarse) {
  /* Trace uses its own scrollers; hide only the resident composer, not its React tree. */
  html[data-mobile-workbench-active="true"] [data-conversation-scroll]:has([data-workbench-trajectory]) > [data-composer-seat] {
    display: none !important;
  }
  [data-workbench-trajectory] { --dsh-trajectory-bottom-clearance: 0px; }
  /* Keep virtual ledger row geometry intact. Make the native inspector readable. */
  html[data-mobile-workbench-active="true"] [data-workbench-trajectory]:has(aside[class*="_details"]) {
    /* Match the zero clearance used by the resident ledger and inspector. */
    padding-bottom: var(--dsh-trajectory-bottom-clearance) !important;
    box-sizing: border-box;
  }
  html[data-mobile-workbench-active="true"] [data-workbench-trajectory] [class*="_split"]:has(> aside[class*="_details"]) {
    display: grid !important;
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: minmax(0, 2fr) minmax(0, 3fr);
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
  /* Keep previews in document flow instead of squeezing them between tab jumps. */
  [data-workbench-trajectory] aside[class*="_details"] [role="tabpanel"][aria-labelledby="trajectory-detail-overview"] {
    display: block !important;
    overflow-y: auto !important;
  }
  [data-workbench-trajectory] aside[class*="_details"] [role="tabpanel"][aria-labelledby="trajectory-detail-overview"] > dl,
  [data-workbench-trajectory] aside[class*="_details"] [class*="_overviewSections"],
  [data-workbench-trajectory] aside[class*="_details"] section[class*="_overviewSection"] {
    display: block !important;
    min-height: 0 !important;
    max-height: none !important;
    overflow: visible !important;
  }
  [data-workbench-trajectory] aside[class*="_details"] [class*="_overviewPreview"] {
    overflow: visible !important;
    mask-image: none !important;
  }
  /* Other heading actions, including copy and source controls, remain available. */
  [data-workbench-trajectory] aside[class*="_details"] [class*="_overviewHeading"] > button[class*="_overviewTitle"],
  [data-workbench-trajectory] aside[class*="_details"] [class*="_overviewHeading"]:has(> button[class*="_overviewTitle"]:only-child) {
    display: none !important;
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
`;
};
__modules["workbench/navigation.js"] = function (require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveDestination = resolveDestination;
exports.destinationAvailable = destinationAvailable;
exports.viewIndex = viewIndex;
/** Derive the page independently of the native conversation view. */
function resolveDestination(evidence) {
    if (evidence.sessionsOpen)
        return 'sessions';
    if (evidence.filesOpen)
        return 'files';
    return 'session';
}
/** Keep missing host capabilities explicit rather than simulating their content. */
function destinationAvailable(destination, evidence) {
    switch (destination) {
        case 'sessions': return evidence.hasSessions === true;
        case 'session': return evidence.hasSessionPage === true;
        case 'agents': return evidence.hasAgents;
        case 'files': return evidence.hasFiles;
    }
}
/** Map the official ordered view ledger onto its rendered tab strip. */
function viewIndex(ids, view, tabCount) {
    if (ids.length !== tabCount)
        return -1;
    return ids.indexOf(view);
}
};
__modules["workbench/dom-observation.js"] = function (require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.COMPOSER_BOUNDARY = exports.NAVIGATION_BOUNDARY = exports.PRESENTATION_BOUNDARY = exports.PRESENTATION_LOCAL = void 0;
exports.boundaryMutation = boundaryMutation;
// Only inspect changed boundary nodes, never the streamed conversation subtree.
exports.PRESENTATION_LOCAL = 'header:has([data-conversation-tabs]), [role="tree"][class*="_menuBody"]';
exports.PRESENTATION_BOUNDARY = 'header:has([data-conversation-tabs]), [data-trajectory-scroll], tr[data-selected="true"][data-trajectory-row-key], aside[class*="_details"], [role="tree"][class*="_menuBody"]';
exports.NAVIGATION_BOUNDARY = 'header:has([data-conversation-tabs]), [data-sidebar-right-panel], [data-sidebar-right-toggle], [data-mobile-workbench="navigation"]';
exports.COMPOSER_BOUNDARY = '[data-composer-card], [data-composer-seat], [data-chain-overlay-fallback="conversation.composer"], [aria-modal="true"]';
/** Recognize local changes and boundary mounts/removals without reading message text. */
function boundaryMutation(record, selector, localSelector = selector) {
    const target = record.target instanceof Element ? record.target : record.target.parentElement;
    if (!target)
        return false;
    if (target.closest('[data-mobile-workbench="navigation"], [data-workbench-context-control], [data-workbench-agent-heading], [data-mobile-workbench-session-copy]'))
        return false;
    if (record.type === 'attributes')
        return target.closest(selector) !== null;
    if (record.type === 'characterData')
        return target.closest(localSelector) !== null;
    // Descendant commits matter only inside the boundary itself, not its broad ancestors.
    if (target.closest(localSelector) !== null)
        return true;
    return [...record.addedNodes, ...record.removedNodes].some(node => node instanceof Element
        && (node.matches(selector) || node.querySelector(selector) !== null));
}
};
__modules["workbench/agent-counts.js"] = function (require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.missingDescendantCatalogs = missingDescendantCatalogs;
exports.subagentCounts = subagentCounts;
const sessions_compat_ts_1 = require("./core/sessions-compat.js");
/** Discover only missing baselines reachable from the current session's own catalog. */
function missingDescendantCatalogs(snapshot) {
    const root = (0, sessions_compat_ts_1.currentSessionIdOf)(snapshot);
    if (root === undefined)
        return [];
    const list = snapshot;
    const missing = [];
    const visit = (id) => {
        const projection = list.projectionsBySession?.[id];
        if (projection?.state === 'error')
            return;
        const catalog = projection?.values.subagentCatalog;
        if (catalog === undefined) {
            if (projection?.state === undefined || projection.state === 'idle')
                missing.push(id);
            return;
        }
        for (const child of catalog)
            visit(child.id);
    };
    visit(root);
    return missing;
}
/** Count only this session's descendants, never substituting a parent's sibling catalog. */
function subagentCounts(snapshot, statuses) {
    const root = (0, sessions_compat_ts_1.currentSessionIdOf)(snapshot);
    if (root === undefined)
        return undefined;
    const list = snapshot;
    const visit = (id) => {
        const projection = list.projectionsBySession?.[id];
        if (projection?.state === 'error')
            return { agentCountsState: 'unavailable' };
        const catalog = projection?.values.subagentCatalog;
        if (projection?.state === 'loading' || catalog === undefined) {
            return { agentCountsState: projection?.state === 'ready' ? 'unavailable' : 'loading' };
        }
        let active = 0;
        let total = 0;
        for (const child of catalog) {
            const descendants = visit(child.id);
            if (descendants.agentCountsState !== 'ready')
                return descendants;
            total += 1 + (descendants.agentTotalCount ?? 0);
            active += (statuses?.get(child.id)?.running ?? list.byId?.[child.id]?.running) === true ? 1 : 0;
            active += descendants.agentActiveCount ?? 0;
        }
        return { agentActiveCount: active, agentTotalCount: total, agentCountsState: 'ready' };
    };
    return visit(root);
}
};
__modules["workbench/agent-catalog-loader.js"] = function (require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.installAgentCatalogLoader = installAgentCatalogLoader;
const agent_counts_ts_1 = require("./workbench/agent-counts.js");
/** Fill reachable projection baselines with at most two concurrent owner reads, without opening history. */
function installAgentCatalogLoader(source, refresh, enabled) {
    let disposed = false;
    const inflight = new Set();
    const update = () => {
        if (disposed || !enabled())
            return;
        // Re-read current membership rather than retaining an old root's work queue.
        for (const id of (0, agent_counts_ts_1.missingDescendantCatalogs)(source.getSnapshot())) {
            if (inflight.size >= 2)
                break;
            if (inflight.has(id))
                continue;
            inflight.add(id);
            void refresh(id).catch((_error) => {
                // The sessions owner exposes failures in projectionsBySession; counts stay unknown.
            }).finally(() => {
                inflight.delete(id);
                update();
            });
        }
    };
    const stop = source.subscribe(update);
    update();
    return { update, dispose: () => { disposed = true; stop(); } };
}
};
__modules["workbench/presentation.js"] = function (require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWorkbenchPresentation = createWorkbenchPresentation;
/** Mark presentation boundaries without moving React-owned elements. */
function createWorkbenchPresentation() {
    let marked = new Map();
    const menuHeadings = new Map();
    let selectedPane = null;
    let selectedRowKey = null;
    const clear = () => {
        for (const [element, attributes] of marked) {
            for (const attribute of attributes)
                element.removeAttribute(attribute);
        }
        marked.clear();
        for (const heading of menuHeadings.values())
            heading.element.remove();
        menuHeadings.clear();
        selectedPane = null;
        selectedRowKey = null;
    };
    const update = (viewIds, scope = document) => {
        const next = new Map();
        const mark = (element, attribute) => {
            if (!element)
                return;
            if (!element.hasAttribute(attribute))
                element.setAttribute(attribute, '');
            const attributes = next.get(element) ?? new Set();
            attributes.add(attribute);
            next.set(element, attributes);
        };
        const header = scope.querySelector('header:has([data-conversation-tabs])');
        mark(header, 'data-mobile-workbench-header');
        // Extra third-party views keep their native tab strip available.
        if (viewIds.length === 2 && viewIds.includes('chat') && viewIds.includes('trajectory')) {
            mark(header, 'data-workbench-tabs-owned');
        }
        const trajectory = scope.querySelector('[data-trajectory-scroll]');
        mark(trajectory?.parentElement?.parentElement ?? null, 'data-workbench-trajectory');
        const inspecting = trajectory?.parentElement?.querySelector('aside[class*="_details"]');
        if (!trajectory || !inspecting) {
            selectedPane = null;
            selectedRowKey = null;
        }
        else {
            const row = trajectory.querySelector('tr[data-selected="true"][data-trajectory-row-key]');
            const key = row?.getAttribute('data-trajectory-row-key') ?? null;
            if (row && key !== null && (selectedPane !== trajectory || selectedRowKey !== key)) {
                selectedPane = trajectory;
                selectedRowKey = key;
                // Only selection changes reveal the row; later stream updates and user scrolls win.
                const paneRect = trajectory.getBoundingClientRect();
                const rowRect = row.getBoundingClientRect();
                const headHeight = trajectory.querySelector('thead')?.getBoundingClientRect().height ?? 0;
                const top = paneRect.top + trajectory.clientTop + headHeight;
                const bottom = paneRect.top + trajectory.clientTop + trajectory.clientHeight;
                const delta = rowRect.top < top ? rowRect.top - top
                    : rowRect.bottom > bottom ? rowRect.bottom - bottom : 0;
                if (delta !== 0)
                    trajectory.scrollTop += delta;
            }
        }
        const count = header?.querySelector('[data-slot="conversation.session.header.actions"] button[aria-haspopup="tree"]:not([class*="_switcherTrigger"]):not([data-mobile-workbench="agents"])');
        mark(count?.parentElement ?? null, 'data-workbench-agent-count');
        const menus = new Set();
        for (const tree of document.querySelectorAll('[role="tree"][class*="_menuBody"]')) {
            const menu = tree.parentElement;
            if (!menu)
                continue;
            menus.add(menu);
            mark(menu, 'data-workbench-agent-menu');
            if (!menuHeadings.has(menu)) {
                const element = document.createElement('div');
                element.setAttribute('data-workbench-agent-heading', '');
                const name = document.createElement('h2');
                const mode = document.createElement('p');
                element.append(name, mode);
                menu.prepend(element);
                menuHeadings.set(menu, { element, name, mode });
            }
            const heading = menuHeadings.get(menu);
            const name = header?.querySelector('[data-workbench-title-info]')?.textContent ?? '';
            const mode = header?.querySelector('[data-workbench-mode]')?.textContent ?? '';
            if (heading.name.textContent !== name)
                heading.name.textContent = name;
            if (heading.mode.textContent !== mode)
                heading.mode.textContent = mode;
        }
        for (const [menu, heading] of menuHeadings) {
            if (!menus.has(menu)) {
                heading.element.remove();
                menuHeadings.delete(menu);
            }
        }
        for (const [element, attributes] of marked) {
            for (const attribute of attributes) {
                if (!next.get(element)?.has(attribute))
                    element.removeAttribute(attribute);
            }
        }
        marked = next;
    };
    return { update, clear };
}
};
__modules["components/open-files-panel.js"] = function (require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HOST_FILES_CLOSER = exports.HOST_FILES_OPENER = void 0;
exports.openFilesPanel = openFilesPanel;
/** Native rc.2 right-workspace controls. */
exports.HOST_FILES_OPENER = '[data-sidebar-right-expand]';
exports.HOST_FILES_CLOSER = '[data-sidebar-right-toggle]';
/** Delegate to the native control; absent workspace support stays unavailable. */
function openFilesPanel(doc = document) {
    const opener = doc.querySelector(exports.HOST_FILES_OPENER);
    const closer = doc.querySelector(exports.HOST_FILES_CLOSER);
    const control = typeof opener?.click === 'function' ? opener : closer;
    if (typeof control?.click !== 'function')
        return false;
    control.click();
    return true;
}
};
__modules["workbench/host-bridge.js"] = function (require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHostBridge = createHostBridge;
const phone_chrome_ts_1 = require("./effects/phone-chrome.js");
const open_files_panel_ts_1 = require("./components/open-files-panel.js");
const navigation_ts_1 = require("./workbench/navigation.js");
/** Native navigation actions and evidence; host nodes stay in their React-owned parents. */
function createHostBridge(viewIds, agentCounts = () => ({}), closeDrawer = () => { }, openSessions = () => { }, conversation = { show: () => { }, hasSession: () => true }) {
    let pendingFrame;
    let focusObserver;
    const ownedTrigger = () => document.querySelector('[data-mobile-workbench="agents"]');
    const focusAgents = () => {
        focusObserver?.disconnect();
        const focus = () => {
            const item = document.querySelector('[role="tree"][class*="_menuBody"] [role="treeitem"]:not([aria-disabled="true"])');
            if (!item)
                return false;
            item.focus({ preventScroll: true });
            focusObserver?.disconnect();
            return true;
        };
        if (focus())
            return;
        focusObserver = new MutationObserver(() => { focus(); });
        focusObserver.observe(document.body, { childList: true, subtree: true });
    };
    const clear = () => {
        if (pendingFrame !== undefined)
            window.cancelAnimationFrame(pendingFrame);
        pendingFrame = undefined;
        focusObserver?.disconnect();
    };
    const header = () => (0, phone_chrome_ts_1.getFrame)()?.querySelector('header:has([role="tablist"]), header:has(button[aria-haspopup="tree"])') ?? null;
    const tabs = () => Array.from(header()?.querySelectorAll('[data-conversation-tabs] > button[role="tab"]') ?? []);
    const agentTrigger = () => {
        const buttons = Array.from(header()?.querySelectorAll('button[aria-haspopup="tree"]:not([class*="_switcherTrigger"]):not([data-mobile-workbench="agents"])') ?? []);
        // Own count only; switchers are rooted at the parent and include siblings.
        return buttons.at(-1) ?? null;
    };
    const officialFilesOpen = () => {
        // Fullscreen panels keep the grid track collapsed even while visibly open.
        // The panel's own open marker is authoritative; its closer stays mounted.
        return document.querySelector('[data-sidebar-right-panel][data-sidebar-right-open]:not([data-sidebar-right-open="false"])') !== null;
    };
    const filesOpen = officialFilesOpen;
    const evidence = () => {
        const ids = viewIds();
        const buttons = tabs();
        const selected = buttons.findIndex(button => button.getAttribute('aria-selected') === 'true');
        const trigger = agentTrigger();
        return {
            sessionsOpen: (0, phone_chrome_ts_1.getFrame)() !== null && (0, phone_chrome_ts_1.getFrame)()?.hasAttribute('data-sidebar-collapsed') === false,
            hasSessions: (0, phone_chrome_ts_1.getFrame)() !== null,
            hasSessionPage: (0, phone_chrome_ts_1.getFrame)() !== null,
            hasParent: conversation.parentId?.() !== undefined,
            selectedView: ids.length === buttons.length ? ids[selected] : undefined,
            filesOpen: filesOpen(),
            agentsOpen: trigger?.getAttribute('aria-expanded') === 'true',
            hasChat: ids.includes('chat') || !conversation.hasSession(),
            hasTrajectory: conversation.hasSession() && ids.includes('trajectory'),
            ...agentCounts(),
            hasAgents: trigger !== null,
            hasFiles: (0, phone_chrome_ts_1.getFrame)()?.querySelector(`${open_files_panel_ts_1.HOST_FILES_OPENER}, ${open_files_panel_ts_1.HOST_FILES_CLOSER}`) != null,
        };
    };
    const closeFiles = () => {
        if (officialFilesOpen())
            document.querySelector(open_files_panel_ts_1.HOST_FILES_CLOSER)?.click();
    };
    const closeAgents = (restoreFocus = true) => {
        focusObserver?.disconnect();
        if (agentTrigger()?.getAttribute('aria-expanded') !== 'true')
            return;
        const previous = document.activeElement;
        document.querySelector('[role="tree"][class*="_menuBody"]')?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        if (restoreFocus)
            ownedTrigger()?.focus({ preventScroll: true });
        else if (previous instanceof HTMLElement)
            previous.focus({ preventScroll: true });
    };
    const selectView = (view) => {
        const buttons = tabs();
        buttons[(0, navigation_ts_1.viewIndex)(viewIds(), view, buttons.length)]?.click();
    };
    const returnParent = () => {
        const id = conversation.parentId?.();
        if (id)
            conversation.openSession?.(id);
    };
    const activate = (destination, pointerStartedOpen = false) => {
        clear();
        if (destination === 'sessions') {
            closeAgents();
            closeFiles();
            openSessions();
            return;
        }
        closeDrawer();
        if (destination === 'agents') {
            const trigger = agentTrigger();
            if (pointerStartedOpen || trigger?.getAttribute('aria-expanded') === 'true')
                closeAgents();
            // The rc.2 own-count click pins the catalog and cancels hover-close timers.
            else
                trigger?.click();
            return;
        }
        conversation.show();
        const enter = () => {
            if (destination === 'files') {
                closeAgents();
                if (!filesOpen())
                    (0, open_files_panel_ts_1.openFilesPanel)();
                return;
            }
            closeFiles();
            closeAgents();
            // The session page preserves the native chat/trajectory view.
        };
        // A global panel unmounts the header; let the native Conversation remount once.
        if (destination === 'session' || header())
            enter();
        else
            pendingFrame = window.requestAnimationFrame(() => { pendingFrame = undefined; enter(); });
    };
    return { evidence, activate, selectView, returnParent, closeAgents, focusAgents, clear };
}
};
__modules["workbench/stats.js"] = function (require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contextPercent = contextPercent;
exports.statNumber = statNumber;
exports.pressureLabel = pressureLabel;
exports.decodeTokensPerSecond = decodeTokensPerSecond;
exports.averageTtftMs = averageTtftMs;
exports.totalTokens = totalTokens;
exports.cacheHitLabel = cacheHitLabel;
exports.statRate = statRate;
exports.statDuration = statDuration;
/** Missing measurements stay missing; a provider-reported zero remains a real zero. */
function contextPercent(pressure) {
    const tokens = pressure?.projectedTokens ?? pressure?.pressureTokens;
    const capacity = pressure?.contextWindow;
    return tokens === undefined || capacity === undefined || capacity <= 0
        ? undefined : Math.round(tokens / capacity * 100);
}
function statNumber(value) {
    return value === undefined ? '—' : value.toLocaleString();
}
function pressureLabel(pressure) {
    const percent = contextPercent(pressure);
    return percent === undefined ? '—' : percent + '%';
}
/** Match the Host's paired, whole-session decode samples, excluding first-token wait. */
function decodeTokensPerSecond(activity) {
    return activity === undefined || activity.decodeMs <= 0 ? undefined : activity.decodeTokens / (activity.decodeMs / 1000);
}
function averageTtftMs(activity) {
    return activity === undefined || activity.ttftSteps === 0 ? undefined : activity.ttftMs / activity.ttftSteps;
}
/** The four billing buckets are disjoint; reasoning is already included in output. */
function totalTokens(usage) {
    return usage === undefined ? undefined : usage.uncachedInputTokens + usage.cacheReadTokens + usage.cacheWriteTokens + usage.outputTokens;
}
/** Keep partial cache hits below 100%, even when ordinary integer rounding would hide misses. */
function cacheHitLabel(usage) {
    if (usage === undefined)
        return '—';
    const input = usage.uncachedInputTokens + usage.cacheReadTokens + usage.cacheWriteTokens;
    if (input === 0)
        return '—';
    const missed = input - usage.cacheReadTokens;
    if (missed === 0)
        return '100%';
    const percent = usage.cacheReadTokens / input * 100;
    const precision = Math.round(percent) < 100 ? 0 : Math.max(1, Math.ceil(-Math.log10(missed / input * 100)));
    return Number(percent.toFixed(precision)) + '%';
}
/** Use the native throughput precision without adding a misleading missing zero. */
function statRate(value) {
    return value === undefined ? '—' : String(value >= 10 ? Math.round(value) : Math.round(value * 10) / 10);
}
function statDuration(ms, t) {
    if (ms === undefined)
        return '—';
    const seconds = ms / 1000;
    if (seconds < 60)
        return t('durationSeconds', { seconds: Math.round(seconds * 10) / 10 });
    const whole = Math.round(seconds);
    return t('durationMinutes', { minutes: Math.floor(whole / 60), seconds: whole % 60 });
}
};
__modules["workbench/WorkbenchStatsDetails.js"] = function (require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkbenchStatsDetails = WorkbenchStatsDetails;
const jsx_runtime_1 = require("react/jsx-runtime");
const stats_ts_1 = require("./workbench/stats.js");
/** Present session-bound public projections; the parent owns panel placement and dismissal. */
function WorkbenchStatsDetails({ pressure, breakdown, activity, usage, t }) {
    const speed = (0, stats_ts_1.decodeTokensPerSecond)(activity);
    const rows = (items) => (0, jsx_runtime_1.jsx)("dl", { children: items.map(([key, value]) => (0, jsx_runtime_1.jsxs)("div", { "data-workbench-stat": key, children: [(0, jsx_runtime_1.jsx)("dt", { children: t(key) }), (0, jsx_runtime_1.jsx)("dd", { children: value })] }, key)) });
    return (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("h2", { children: [t('context'), " ", (0, jsx_runtime_1.jsx)("span", { children: (0, stats_ts_1.pressureLabel)(pressure) })] }), rows([
                ['usedTokens', (0, stats_ts_1.statNumber)(pressure?.projectedTokens ?? pressure?.pressureTokens)],
                ['capacity', (0, stats_ts_1.statNumber)(pressure?.contextWindow)],
                ...(breakdown ? [
                    ['system', (0, stats_ts_1.statNumber)(breakdown.systemTokens)],
                    ['tools', (0, stats_ts_1.statNumber)(breakdown.toolsTokens)],
                    ['messages', (0, stats_ts_1.statNumber)(breakdown.messageTokens)],
                ] : []),
            ]), (0, jsx_runtime_1.jsx)("h2", { children: t('activity') }), rows([
                ['turns', (0, stats_ts_1.statNumber)(activity?.turns)],
                ['steps', (0, stats_ts_1.statNumber)(activity?.steps)],
                ['decodeSpeed', speed === undefined ? '—' : t('tokensPerSecond', { value: (0, stats_ts_1.statRate)(speed) })],
                ['ttft', (0, stats_ts_1.statDuration)((0, stats_ts_1.averageTtftMs)(activity), t)],
                ['llmTime', (0, stats_ts_1.statDuration)(activity?.llmMs, t)],
                ['toolTime', (0, stats_ts_1.statDuration)(activity?.toolMs, t)],
            ]), (0, jsx_runtime_1.jsx)("h2", { children: t('tokens') }), rows([
                ['total', (0, stats_ts_1.statNumber)((0, stats_ts_1.totalTokens)(usage))],
                ['cacheHit', (0, stats_ts_1.cacheHitLabel)(usage)],
                ['input', (0, stats_ts_1.statNumber)(usage?.uncachedInputTokens)],
                ['output', (0, stats_ts_1.statNumber)(usage?.outputTokens)],
                ['cacheRead', (0, stats_ts_1.statNumber)(usage?.cacheReadTokens)],
                ['cacheWrite', (0, stats_ts_1.statNumber)(usage?.cacheWriteTokens)],
            ])] });
}
};
__modules["workbench/WorkbenchNav.js"] = function (require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkbenchNav = WorkbenchNav;
exports.WorkbenchAgents = WorkbenchAgents;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_dom_1 = require("react-dom");
const dsh_client_ui_primitives_1 = require("@deepseek-ai/dsh-client-ui-primitives");
const stats_ts_1 = require("./workbench/stats.js");
const WorkbenchStatsDetails_tsx_1 = require("./workbench/WorkbenchStatsDetails.js");
const navigation_ts_1 = require("./workbench/navigation.js");
const destinations = ['sessions', 'session', 'files'];
const views = ['chat', 'trajectory'];
const paths = {
    sessions: 'M8 5h13M8 12h13M8 19h13M3 5h1M3 12h1M3 19h1',
    session: 'M4 4h16v12H9l-5 4V4Z',
    files: 'M3 6h7l2 2h9v12H3V6Z',
};
/** Render page navigation without owning the native page trees. */
function WorkbenchNav({ useWorkbench, activate, t }) {
    const state = useWorkbench(value => value);
    if (!state.mobile)
        return null;
    const selected = (0, navigation_ts_1.resolveDestination)(state);
    return ((0, jsx_runtime_1.jsx)("nav", { "data-mobile-workbench": "navigation", "aria-label": t('navigation'), children: destinations.map(destination => {
            const available = (0, navigation_ts_1.destinationAvailable)(destination, state);
            const label = t(destination);
            return ((0, jsx_runtime_1.jsxs)("button", { type: "button", "data-workbench-destination": destination, "aria-current": !state.managementOpen && selected === destination ? 'page' : undefined, "aria-label": available ? label : label + ' · ' + t('unavailable'), title: available ? label : t('unavailable'), disabled: !available, onClick: () => { activate(destination); }, children: [(0, jsx_runtime_1.jsx)("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.7", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: (0, jsx_runtime_1.jsx)("path", { d: paths[destination] }) }), (0, jsx_runtime_1.jsx)("span", { children: label })] }, destination));
        }) }));
}
/** Header content uses public session summaries and session-bound projections. */
function WorkbenchAgents({ useWorkbench, useSessions, useProjection, sessionId, activate, selectView, returnParent, closeAgents, focusAgents, resolvePreset, t, tStats }) {
    const state = useWorkbench(value => value);
    const summary = useSessions(value => sessionId ? value.byId[sessionId] : undefined);
    const parent = useSessions(value => summary?.parentId ? value.byId[summary.parentId] : undefined);
    const pressure = useProjection('contextPressure');
    const breakdown = useProjection('contextBreakdown');
    const activity = useProjection('sessionStats');
    const usage = useProjection('tokenUsage');
    const title = summary?.displayTitle ?? sessionId ?? '';
    const preset = summary?.projectionValues?.agentPreset;
    const unavailable = t('modeUnavailable');
    const [resolvedMode, setResolvedMode] = (0, react_1.useState)();
    const mode = resolvedMode?.session === sessionId && resolvedMode?.preset === preset && resolvedMode?.locale === unavailable ? resolvedMode.name : unavailable;
    const [overlay, setOverlay] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        if (overlay !== 'info')
            return;
        let active = true;
        void resolvePreset(preset).then(name => { if (active)
            setResolvedMode({ session: sessionId, preset, locale: unavailable, name }); });
        return () => { active = false; };
    }, [overlay, sessionId, preset, unavailable, resolvePreset]);
    const pointerStartedOpen = (0, react_1.useRef)(false);
    const statsRef = (0, react_1.useRef)(null);
    const panelRef = (0, react_1.useRef)(null);
    const panelId = (0, react_1.useId)();
    const statsOpen = overlay === 'stats' && state.mobile;
    const position = (0, dsh_client_ui_primitives_1.useAnchoredPosition)({ open: statsOpen, anchorRef: statsRef, panelRef, align: 'end', gap: 4, margin: 12 });
    const closeStats = () => { setOverlay(null); statsRef.current?.focus({ preventScroll: true }); };
    (0, react_1.useEffect)(() => { setOverlay(null); }, [sessionId, state.mobile]);
    (0, react_1.useEffect)(() => { if (state.agentsOpen)
        setOverlay(null); }, [state.agentsOpen]);
    (0, react_1.useEffect)(() => {
        if (!statsOpen)
            return;
        const outside = (event) => {
            if (event.target instanceof Node && !panelRef.current?.contains(event.target) && !statsRef.current?.contains(event.target)) {
                event.preventDefault();
                closeStats();
            }
        };
        const escape = (event) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                event.stopImmediatePropagation();
                closeStats();
            }
        };
        document.addEventListener('pointerdown', outside, true);
        document.addEventListener('keydown', escape, true);
        return () => {
            document.removeEventListener('pointerdown', outside, true);
            document.removeEventListener('keydown', escape, true);
        };
    }, [statsOpen]);
    if (!state.mobile)
        return null;
    const counts = state.agentCountsState === 'ready'
        ? state.agentActiveCount + '/' + state.agentTotalCount
        : t(state.agentCountsState === 'unavailable' ? 'unavailable' : 'loading');
    const percent = (0, stats_ts_1.contextPercent)(pressure);
    return (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { "data-workbench-header-main": true, children: [summary?.parentId && (0, jsx_runtime_1.jsx)("button", { type: "button", "data-mobile-workbench": "parent", "data-workbench-context-control": true, "aria-label": t('parentSession') + ' · ' + (parent?.displayTitle ?? summary.parentId), onClick: returnParent, children: (0, jsx_runtime_1.jsx)("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.7", "aria-hidden": "true", children: (0, jsx_runtime_1.jsx)("path", { d: "m10 5-7 7 7 7M3 12h18" }) }) }), (0, jsx_runtime_1.jsx)("button", { type: "button", "data-workbench-title-info": true, "data-workbench-context-control": true, "aria-label": title + ' · ' + t('viewSessionInfo'), "aria-haspopup": "dialog", "aria-expanded": overlay === 'info', onClick: event => { event.currentTarget.focus({ preventScroll: true }); closeAgents(false); setOverlay('info'); }, children: (0, jsx_runtime_1.jsx)("span", { children: title }) }), (0, jsx_runtime_1.jsxs)("button", { ref: statsRef, type: "button", "data-mobile-workbench": "stats", "data-workbench-context-control": true, "aria-label": t('statistics') + ' · ' + (0, stats_ts_1.pressureLabel)(pressure), "aria-haspopup": "dialog", "aria-expanded": statsOpen, "aria-controls": statsOpen ? panelId : undefined, onClick: () => { if (statsOpen)
                            closeStats();
                        else {
                            closeAgents(false);
                            setOverlay('stats');
                        } }, children: [(0, jsx_runtime_1.jsxs)("svg", { viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true", children: [(0, jsx_runtime_1.jsx)("circle", { cx: "12", cy: "12", r: "9", stroke: "currentColor", opacity: ".2", strokeWidth: "2" }), percent !== undefined && (0, jsx_runtime_1.jsx)("circle", { cx: "12", cy: "12", r: "9", stroke: "currentColor", strokeWidth: "2", pathLength: "100", strokeDasharray: Math.min(100, Math.max(0, percent)) + ' 100', transform: "rotate(-90 12 12)" })] }), (0, jsx_runtime_1.jsx)("span", { children: (0, stats_ts_1.pressureLabel)(pressure) })] })] }), (0, jsx_runtime_1.jsxs)("div", { "data-workbench-header-secondary": true, children: [(0, jsx_runtime_1.jsx)("div", { "data-mobile-workbench": "views", role: "tablist", "aria-label": t('sessionView'), children: views.map(view => (0, jsx_runtime_1.jsx)("button", { type: "button", role: "tab", "data-workbench-context-control": true, "data-workbench-view": view, "aria-selected": state.selectedView === view, disabled: view === 'chat' ? !state.hasChat : !state.hasTrajectory, onClick: () => { selectView(view); }, children: t(view) }, view)) }), (0, jsx_runtime_1.jsxs)("button", { type: "button", "data-mobile-workbench": "agents", "data-workbench-context-control": true, "aria-label": t('agentCatalog') + ' · ' + counts, title: state.agentTotalCount === 0 ? t('emptyAgents') : t('agentCatalog'), "aria-haspopup": "tree", "aria-expanded": state.agentsOpen, disabled: !state.hasAgents || state.agentTotalCount === 0, onMouseDown: event => { event.preventDefault(); }, onPointerDownCapture: () => { pointerStartedOpen.current = state.agentsOpen; }, onPointerCancel: () => { pointerStartedOpen.current = false; }, onKeyDown: event => {
                            if (event.key === 'Escape') {
                                event.preventDefault();
                                closeAgents();
                                return;
                            }
                            if (['Enter', ' ', 'ArrowDown'].includes(event.key)) {
                                event.preventDefault();
                                setOverlay(null);
                                if (!state.agentsOpen)
                                    activate('agents');
                                focusAgents();
                            }
                        }, onClick: event => { setOverlay(null); activate('agents', event.detail > 0 && pointerStartedOpen.current); pointerStartedOpen.current = false; }, children: [(0, jsx_runtime_1.jsxs)("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.7", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [(0, jsx_runtime_1.jsx)("rect", { x: "9", y: "3", width: "6", height: "4", rx: "1" }), (0, jsx_runtime_1.jsx)("rect", { x: "3", y: "17", width: "6", height: "4", rx: "1" }), (0, jsx_runtime_1.jsx)("rect", { x: "15", y: "17", width: "6", height: "4", rx: "1" }), (0, jsx_runtime_1.jsx)("path", { d: "M12 7v6M5 17v-4h14v4" })] }), (0, jsx_runtime_1.jsx)("small", { "data-workbench-count": true, children: counts })] })] }), (0, jsx_runtime_1.jsxs)(dsh_client_ui_primitives_1.Modal, { open: overlay === 'info', title: t('sessionInfo'), closeLabel: t('close'), className: "mobile-workbench-session-info", onClose: () => { setOverlay(null); }, children: [(0, jsx_runtime_1.jsx)("p", { children: title }), (0, jsx_runtime_1.jsx)("p", { children: t('presetReadOnly', { name: mode }) }), (0, jsx_runtime_1.jsx)("button", { type: "button", "data-modal-autofocus": true, onClick: () => { setOverlay(null); }, children: t('close') })] }), statsOpen && (0, react_dom_1.createPortal)((0, jsx_runtime_1.jsx)(dsh_client_ui_primitives_1.MenuSurface, { ref: panelRef, id: panelId, role: "dialog", "aria-label": t('statistics'), "data-workbench-stats-panel": true, style: { top: position?.top, right: 12, visibility: position ? 'visible' : 'hidden' }, children: (0, jsx_runtime_1.jsx)(WorkbenchStatsDetails_tsx_1.WorkbenchStatsDetails, { pressure: pressure, breakdown: breakdown, activity: activity, usage: usage, t: tStats }) }), document.body)] });
}
};
__modules["workbench/locales.js"] = function (require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.en = exports.zh = exports.WORKBENCH_NS = void 0;
exports.WORKBENCH_NS = 'mobileWorkbench';
exports.zh = {
    close: '关闭',
    backToSessions: '返回会话列表',
    backToPrevious: '返回上一页',
    presetReadOnly: '模式：{name}',
    modeUnavailable: '不可用',
    viewSessionInfo: '查看会话信息',
    statistics: '会话统计',
    context: '上下文占用',
    usedTokens: '已用 token',
    activity: '会话活动',
    turns: '轮',
    steps: '步',
    tokens: 'Token',
    input: '输入',
    output: '输出',
    cacheRead: '缓存读取',
    cacheWrite: '缓存写入',
    mode: '模式',
    capacity: '上下文窗口',
    system: '系统（估算）',
    tools: '工具（估算）',
    messages: '消息（估算）',
    navigation: '工作台导航',
    sessions: '会话列表',
    session: '会话',
    sessionView: '会话视图',
    agentCatalog: '下游智能体目录',
    parentSession: '返回父会话',
    loading: '加载中',
    sessionInfo: '会话信息',
    chat: '对话',
    trajectory: '轨迹',
    agents: '智能体',
    files: '工作区',
    emptyAgents: '暂无下游智能体',
    unavailable: '当前不可用',
    copySessionId: '复制会话ID',
    copySessionIdSuccess: '已复制会话ID',
    copySessionIdFailure: '复制失败，请检查浏览器剪贴板权限',
};
exports.en = {
    close: 'Close',
    backToSessions: 'Back to sessions',
    backToPrevious: 'Back',
    presetReadOnly: 'Mode: {name}',
    modeUnavailable: 'Unavailable',
    viewSessionInfo: 'View session information',
    statistics: 'Session statistics',
    context: 'Context occupancy',
    usedTokens: 'Used tokens',
    activity: 'Session activity',
    turns: 'Turns',
    steps: 'Steps',
    tokens: 'Tokens',
    input: 'Input',
    output: 'Output',
    cacheRead: 'Cache read',
    cacheWrite: 'Cache write',
    mode: 'Mode',
    capacity: 'Context window',
    system: 'System (estimate)',
    tools: 'Tools (estimate)',
    messages: 'Messages (estimate)',
    navigation: 'Workbench navigation',
    sessions: 'Sessions',
    session: 'Session',
    sessionView: 'Conversation view',
    agentCatalog: 'Descendant agents',
    parentSession: 'Return to parent session',
    loading: 'Loading',
    sessionInfo: 'Session information',
    chat: 'Chat',
    trajectory: 'Trace',
    agents: 'Agents',
    files: 'Workspace',
    emptyAgents: 'No subagents yet',
    unavailable: 'Currently unavailable',
    copySessionId: 'Copy session ID',
    copySessionIdSuccess: 'Session ID copied',
    copySessionIdFailure: 'Copy failed; check browser clipboard permissions',
};
};
__modules["workbench/stats-locales.js"] = function (require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.statsEn = exports.statsZh = exports.STATS_NS = void 0;
exports.STATS_NS = 'mobileWorkbenchStats';
exports.statsZh = {
    context: '上下文占用',
    usedTokens: '已用 token（参考）',
    capacity: '上下文窗口',
    system: '系统（估算）',
    tools: '工具（估算）',
    messages: '消息（估算）',
    activity: '会话活动',
    turns: '轮',
    steps: '步',
    decodeSpeed: '输出生成速率（会话平均）',
    ttft: '平均首 token 等待',
    llmTime: '模型用时',
    toolTime: '工具用时',
    tokens: 'Token',
    total: '总计',
    cacheHit: '缓存命中率',
    input: '输入',
    output: '输出',
    cacheRead: '缓存读取',
    cacheWrite: '缓存写入',
    tokensPerSecond: '{value} tok/s',
    durationSeconds: '{seconds}秒',
    durationMinutes: '{minutes}分{seconds}秒',
};
exports.statsEn = {
    context: 'Context occupancy',
    usedTokens: 'Used tokens (reference)',
    capacity: 'Context window',
    system: 'System (estimate)',
    tools: 'Tools (estimate)',
    messages: 'Messages (estimate)',
    activity: 'Session activity',
    turns: 'Turns',
    steps: 'Steps',
    decodeSpeed: 'Output speed (session average)',
    ttft: 'Average time to first token',
    llmTime: 'Model time',
    toolTime: 'Tool time',
    tokens: 'Tokens',
    total: 'Total',
    cacheHit: 'Cache hit',
    input: 'Input',
    output: 'Output',
    cacheRead: 'Cache read',
    cacheWrite: 'Cache write',
    tokensPerSecond: '{value} tok/s',
    durationSeconds: '{seconds}s',
    durationMinutes: '{minutes}m{seconds}s',
};
};
__modules["workbench/session-menu.js"] = function (require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.copyCurrentSessionId = copyCurrentSessionId;
exports.currentSessionPreset = currentSessionPreset;
exports.installWorkbenchSessionMenu = installWorkbenchSessionMenu;
const sessions_compat_ts_1 = require("./core/sessions-compat.js");
const phone_chrome_ts_1 = require("./effects/phone-chrome.js");
const locales_ts_1 = require("./workbench/locales.js");
/** Read the selection at activation time, including a selected child session. */
async function copyCurrentSessionId(snapshot, clipboard) {
    const id = (0, sessions_compat_ts_1.currentSessionIdOf)(snapshot);
    if (!id || !clipboard)
        return false;
    try {
        await clipboard.writeText(id);
        return true;
    }
    catch {
        // Clipboard permission and insecure-origin failures are visible in the menu.
        return false;
    }
}
/** Read immutable preset metadata from the selected public summary. */
function currentSessionPreset(snapshot) {
    const id = (0, sessions_compat_ts_1.currentSessionIdOf)(snapshot);
    const preset = id ? snapshot.byId[id]?.projectionValues?.agentPreset : undefined;
    return typeof preset === 'string' ? preset : '—';
}
/** Extend only the official, in-place Session Header menu; keep its native rows intact. */
function installWorkbenchSessionMenu(ctx, resolvePreset) {
    (0, phone_chrome_ts_1.installMobileEffect)(ctx, 'dsh-web-mobile: copy session id', () => {
        const t = ctx.locale.bind(locales_ts_1.WORKBENCH_NS);
        // The public raw-namespace overload reads the native download menu label.
        const hostNamespace = 'session-log-download';
        const hostT = ctx.locale.bind(hostNamespace);
        let frame = 0;
        let disposed = false;
        let menu = null;
        let row = null;
        let presetInfo = null;
        let presetRead = null;
        let presetName = '—';
        let removeClick;
        let wrapper = null;
        const observer = new MutationObserver(() => schedule());
        const release = () => {
            removeClick?.();
            removeClick = undefined;
            row?.remove();
            presetInfo?.remove();
            row = null;
            presetInfo = null;
            presetRead = null;
            menu = null;
        };
        const ensure = () => {
            frame = 0;
            // HeaderAction does not portal this menu. The wrapper is the ownership
            // check; a download label in some unrelated menu is never sufficient.
            const trigger = document.querySelector('header button[class*="_moreButton"][aria-haspopup="menu"][aria-expanded="true"]');
            const nextWrapper = trigger?.parentElement ?? null;
            if (nextWrapper !== wrapper) {
                observer.disconnect();
                wrapper = nextWrapper;
                if (wrapper)
                    observer.observe(wrapper, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-expanded'] });
            }
            const next = nextWrapper?.querySelector(':scope > [role="menu"]') ?? null;
            const native = next ? Array.from(next.querySelectorAll('button[role="menuitem"]')).find(item => item.textContent?.trim() === hostT('menu.download')) : undefined;
            if (!next || !native) {
                release();
                return;
            }
            const snapshot = ctx.sessions.list.getSnapshot();
            const preset = currentSessionPreset(snapshot);
            const session = (0, sessions_compat_ts_1.currentSessionIdOf)(snapshot);
            const locale = t('modeUnavailable');
            if (presetRead?.menu !== next || presetRead.session !== session || presetRead.preset !== preset || presetRead.locale !== locale) {
                const read = { menu: next, session, preset, locale };
                presetRead = read;
                presetName = '—';
                void resolvePreset(preset).then(name => {
                    if (!disposed && presetRead === read) {
                        presetName = name;
                        schedule();
                    }
                });
            }
            const presetText = t('presetReadOnly', { name: presetName });
            if (menu === next && row && presetInfo && next.contains(row) && next.contains(presetInfo)) {
                if (presetInfo && presetInfo.textContent !== presetText) {
                    presetInfo.textContent = presetText;
                    presetInfo.setAttribute('title', presetText);
                }
                return;
            }
            removeClick?.();
            row?.remove();
            presetInfo?.remove();
            menu = next;
            const labelTemplate = native.querySelector('[class*="_itemLabel"]');
            row = document.createElement('div');
            row.setAttribute('data-mobile-workbench-session-copy', '');
            row.className = native.parentElement?.className ?? '';
            const button = document.createElement('button');
            button.type = 'button';
            button.setAttribute('role', 'menuitem');
            button.className = native.className;
            const label = document.createElement('span');
            label.className = labelTemplate?.className ?? '';
            label.textContent = t('copySessionId');
            const icon = document.createElement('span');
            icon.className = native.querySelector('[class*="_itemIcon"]')?.className ?? '';
            icon.setAttribute('aria-hidden', 'true');
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('viewBox', '0 0 16 16');
            svg.setAttribute('width', '16');
            svg.setAttribute('height', '16');
            svg.setAttribute('fill', 'none');
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const copyPath = 'M5.5 5.5h8v8h-8zM10.5 5.5v-3h-8v8h3';
            path.setAttribute('d', copyPath);
            path.setAttribute('stroke', 'currentColor');
            path.setAttribute('stroke-width', '1.25');
            path.setAttribute('stroke-linejoin', 'round');
            svg.append(path);
            icon.append(svg);
            button.append(icon, label);
            const status = document.createElement('span');
            status.setAttribute('role', 'status');
            status.setAttribute('aria-live', 'polite');
            status.className = labelTemplate?.className ?? '';
            status.hidden = true;
            presetInfo = document.createElement('div');
            presetInfo.setAttribute('data-mobile-workbench-session-preset', '');
            presetInfo.setAttribute('role', 'note');
            presetInfo.textContent = presetText;
            presetInfo.setAttribute('title', presetText);
            row.append(button, status);
            // Append to the native row's items container, not its React-owned row.
            native.parentElement?.parentElement?.append(row, presetInfo);
            let pending = false;
            const onClick = async () => {
                if (pending)
                    return;
                pending = true;
                button.disabled = true;
                const copied = await copyCurrentSessionId(ctx.sessions.list.getSnapshot(), navigator.clipboard);
                pending = false;
                if (disposed || menu !== next || !row?.contains(button))
                    return;
                button.disabled = false;
                path.setAttribute('d', copied ? 'M3 8l3 3 7-7' : copyPath);
                button.setAttribute('aria-label', t(copied ? 'copySessionIdSuccess' : 'copySessionId'));
                status.textContent = copied ? '' : t('copySessionIdFailure');
                status.hidden = copied;
            };
            button.addEventListener('click', onClick);
            removeClick = () => button.removeEventListener('click', onClick);
        };
        const schedule = () => {
            if (!frame)
                frame = window.requestAnimationFrame(ensure);
        };
        // Observe the wrapper only while open. Schedule after native activation,
        // including ArrowDown; the host still owns all keyboard/menu state.
        const onClick = (event) => {
            if (event.target instanceof Element && event.target.closest('header button[class*="_moreButton"][aria-haspopup="menu"]'))
                schedule();
        };
        const onKey = (event) => {
            if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(event.key))
                onClick(event);
        };
        document.addEventListener('click', onClick, true);
        document.addEventListener('keydown', onKey, true);
        const stopSessions = ctx.sessions.list.subscribe(schedule);
        const stopLocale = ctx.locale.subscribe(schedule);
        schedule();
        return () => {
            disposed = true;
            observer.disconnect();
            document.removeEventListener('click', onClick, true);
            document.removeEventListener('keydown', onKey, true);
            stopSessions();
            stopLocale();
            window.cancelAnimationFrame(frame);
            release();
        };
    });
}
};
__modules["shared/host-preset-display.js"] = function (require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBuiltInPreset = isBuiltInPreset;
exports.presetDisplayText = presetDisplayText;
/**
 * Display resolution for roster presets, shared by every surface that renders
 * preset names: shipped presets resolve through locale dictionary keys, and
 * user-authored metadata is never translated. A pure fold with no imports, so
 * browser bundles inline it and the Host uses the same single home for which
 * shipped id carries which copy key.
 * @module @deepseek-ai/dsh-agent-preset-registry/display
 */
const BUILT_IN_PRESET_KEYS = {
    standard: { name: 'presetStandardName', description: 'presetStandardDescription' },
    ptc: { name: 'presetPtcName', description: 'presetPtcDescription' },
    minimal: { name: 'presetMinimalName', description: 'presetMinimalDescription' },
    cordis: { name: 'presetCordisName', description: 'presetCordisDescription' },
};
/**
 * Whether a roster row is one of the shipped presets whose copy the dictionaries carry.
 * A shipped preset publishes no `name`; a declaration that names itself owns its copy.
 * @param preset - roster row.
 * @returns true for a shipped preset id without a published name.
 */
function isBuiltInPreset(preset) {
    return preset.name === undefined && BUILT_IN_PRESET_KEYS[preset.id] !== undefined;
}
/**
 * Resolve preset display copy without making user-authored metadata translatable.
 * @param preset - roster row whose copy is being rendered.
 * @param t - active locale lookup covering {@link BuiltInPresetCopyKey}.
 * @returns localized copy for a known shipped preset, otherwise declaration metadata.
 */
function presetDisplayText(preset, t) {
    const keys = isBuiltInPreset(preset) ? BUILT_IN_PRESET_KEYS[preset.id] : undefined;
    if (keys !== undefined)
        return { name: t(keys.name), description: t(keys.description) };
    return {
        name: preset.name ?? preset.id,
        ...preset.description === undefined ? {} : { description: preset.description },
    };
}
//# sourceMappingURL=display.js.map

};
__modules["workbench/preset-display.js"] = function (require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.presetDisplayName = presetDisplayName;
exports.createPresetDisplayResolver = createPresetDisplayResolver;
const display_1 = require("./shared/host-preset-display.js");
const locales_ts_1 = require("./workbench/locales.js");
/** Resolve published names, never present an unregistered or unnamed id as a display name. */
function presetDisplayName(id, rows, translate, unavailable) {
    const row = rows.find(value => value.id === id);
    if (!row || row.broken !== undefined || (!row.name?.trim() && !(0, display_1.isBuiltInPreset)(row)))
        return unavailable;
    return (0, display_1.presetDisplayText)(row, translate).name;
}
/** Read the public roster per opening; no mirrored registry, private store or long-lived cache. */
function createPresetDisplayResolver(ctx) {
    const t = ctx.locale.bind(locales_ts_1.WORKBENCH_NS);
    const namespace = 'settings.agentPreset';
    const hostT = ctx.locale.bind(namespace);
    return async (id) => {
        const unavailable = t('modeUnavailable');
        if (!id)
            return unavailable;
        try {
            const presets = ctx.get('remote.agentPresets');
            if (!presets)
                return unavailable;
            const result = await presets.list();
            if (!result.ok)
                return unavailable;
            return presetDisplayName(id, result.value.presets, key => {
                const text = hostT(key);
                return text === key ? unavailable : text;
            }, unavailable);
        }
        catch (error) {
            // Transport failure leaves an explicitly unavailable label; the next opening retries.
            return unavailable;
        }
    };
}
};
__modules["styles/workbench-update-notice.css.js"] = function (require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WORKBENCH_UPDATE_NOTICE_CSS = void 0;
/** A mobile-only recovery action; native failure details and modal dialogs take precedence. */
exports.WORKBENCH_UPDATE_NOTICE_CSS = `
[data-mobile-workbench="update-notice"] { display: none; }
@media (max-width: 1023px) and (pointer: coarse) {
  [data-mobile-workbench="update-notice"] {
    position: fixed;
    top: calc(env(safe-area-inset-top, 0px) + 8px);
    left: 12px;
    right: 12px;
    z-index: 46;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    border: 1px solid var(--dsw-alias-border-l2);
    border-radius: 12px;
    background: var(--dsw-alias-bg-base);
    color: var(--dsw-alias-label-primary);
    font-size: 13px;
  }
  [data-mobile-workbench="update-notice"] span { flex: 1; min-width: 0; }
  [data-mobile-workbench="update-notice"] button {
    flex: none;
    min-height: 44px;
    min-width: 44px;
    padding: 6px 10px;
    border: 0;
    border-radius: 8px;
    background: var(--dsw-alias-interactive-bg-hover);
    color: inherit;
    font: inherit;
    touch-action: manipulation;
  }
  body:has([data-client-sync-failure]) [data-mobile-workbench="update-notice"],
  body:has([aria-modal="true"]) [data-mobile-workbench="update-notice"] { display: none; }
}
`;
};
__modules["workbench/update-notice-state.js"] = function (require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUpdateNoticeState = createUpdateNoticeState;
/** Ignore initial boot failures and keep dismissal until the next healthy settlement. */
function createUpdateNoticeState() {
    let dismissed = false;
    let sawSync = false;
    return {
        update(state) {
            if (state.syncing) {
                sawSync = true;
                return false;
            }
            if (state.failures.length === 0) {
                dismissed = false;
                return false;
            }
            return sawSync && !dismissed;
        },
        dismiss() { dismissed = true; },
    };
}
};
__modules["workbench/update-notice.js"] = function (require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.installWorkbenchUpdateNotice = installWorkbenchUpdateNotice;
const jsx_runtime_1 = require("react/jsx-runtime");
const phone_chrome_ts_1 = require("./effects/phone-chrome.js");
const workbench_update_notice_css_ts_1 = require("./styles/workbench-update-notice.css.js");
const update_notice_state_ts_1 = require("./workbench/update-notice-state.js");
const NS = 'mobileWorkbenchRecovery';
const zh = { failed: '组件更新未能应用', reload: '重新加载', dismiss: '关闭提示' };
const en = { failed: 'Component update could not be applied', reload: 'Reload', dismiss: 'Dismiss notice' };
function UpdateNotice({ useRecovery, dismiss, reload, t }) {
    const visible = useRecovery(value => value);
    if (!visible)
        return null;
    return (0, jsx_runtime_1.jsxs)("aside", { "data-mobile-workbench": "update-notice", role: "status", children: [(0, jsx_runtime_1.jsx)("span", { children: t('failed') }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: reload, children: t('reload') }), (0, jsx_runtime_1.jsx)("button", { type: "button", "aria-label": t('dismiss'), onClick: dismiss, children: "\u00D7" })] });
}
/** Add a manual recovery action without changing the native module replacement controller. */
function installWorkbenchUpdateNotice(ctx) {
    ctx.inject(['modules'], child => {
        const scoped = child;
        // The public entry status carries no private revision tables.
        const modules = scoped.get('modules');
        scoped.effect(() => scoped.locale.register(NS, { zh, en }), 'mobile-workbench: recovery dictionary');
        const state = (0, update_notice_state_ts_1.createUpdateNoticeState)();
        const mq = window.matchMedia(phone_chrome_ts_1.MOBILE_QUERY);
        let visible = false;
        const listeners = new Set();
        const refresh = () => {
            const next = state.update(modules.entries.state.getSnapshot()) && mq.matches;
            if (next === visible)
                return;
            visible = next;
            for (const listener of listeners)
                listener();
        };
        const source = {
            getSnapshot: () => visible,
            subscribe(listener) {
                listeners.add(listener);
                return () => { listeners.delete(listener); };
            },
        };
        scoped.effect(() => {
            const style = document.createElement('style');
            style.dataset.pluginCss = 'dsh-web-mobile/update-notice.css';
            style.textContent = workbench_update_notice_css_ts_1.WORKBENCH_UPDATE_NOTICE_CSS;
            document.head.appendChild(style);
            const stop = modules.entries.state.subscribe(refresh);
            mq.addEventListener('change', refresh);
            refresh();
            return () => {
                stop();
                mq.removeEventListener('change', refresh);
                style.remove();
                listeners.clear();
            };
        }, 'mobile-workbench: recovery status');
        scoped.slots.inject('shell.overlay', () => scoped.slots.register({
            name: 'shell.overlay', id: 'mobile-workbench-update-notice', order: 25, locale: NS,
            inject: () => ({
                hooks: { recovery: source },
                dismiss: () => { state.dismiss(); refresh(); },
                reload: () => { window.location.reload(); },
            }),
        }, UpdateNotice));
    });
}
};
__modules["workbench/management-menu.js"] = function (require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.managementEntries = managementEntries;
exports.decorateManagementMenu = decorateManagementMenu;
/** Public panel registrations supply menu labels; account rows remain native. */
function managementEntries(ctx) {
    return ctx.slots.entriesOfSlot('sidebar.panellist')
        .map(entry => ({ id: entry.options.id, label: entry.options.label === undefined ? entry.options.id ?? '' : typeof entry.options.label === 'function' ? entry.options.label() : ctx.locale.resolveText(entry.options.label), order: entry.options.order ?? 0 }))
        .filter(entry => Boolean(entry.id)).sort((a, b) => a.order - b.order);
}
/** Append only owned rows to this account menu; never clone native nodes or account state. */
function decorateManagementMenu(menu, entries, activate) {
    const viewport = menu.querySelector('[role="presentation"][class*="_viewport"]');
    const native = viewport?.querySelector('button[role="menuitem"]');
    if (!viewport || !native)
        return () => { };
    const nodes = [];
    for (const entry of entries) {
        const wrap = document.createElement('div');
        wrap.className = native.parentElement?.className ?? '';
        const button = document.createElement('button');
        button.type = 'button';
        button.className = native.className;
        button.setAttribute('role', 'menuitem');
        button.dataset.mobileManagementEntry = entry.id;
        const icon = document.createElement('span');
        icon.className = native.querySelector('[class*="_itemIcon"]')?.className ?? '';
        icon.setAttribute('aria-hidden', 'true');
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        for (const [key, value] of Object.entries({ viewBox: '0 0 16 16', width: '16', height: '16', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.2' }))
            svg.setAttribute(key, value);
        const path = document.createElementNS(svg.namespaceURI, 'path');
        path.setAttribute('d', entry.id === 'schedules' ? 'M8 2a6 6 0 1 0 0 12A6 6 0 0 0 8 2Zm0 2v4l3 2' : 'M2 2h5v5H2Zm7 0h5v5H9ZM2 9h5v5H2Zm7 0h5v5H9Z');
        svg.append(path);
        icon.append(svg);
        const label = document.createElement('span');
        label.className = native.querySelector('[class*="_itemLabel"]')?.className ?? '';
        label.textContent = entry.label;
        button.append(icon, label);
        button.addEventListener('click', () => { activate(entry.id); });
        wrap.append(button);
        nodes.push(wrap);
    }
    viewport.prepend(...nodes);
    menu.setAttribute('data-mobile-management-menu', '');
    return () => { for (const node of nodes)
        node.remove(); menu.removeAttribute('data-mobile-management-menu'); };
}
};
__modules["workbench/management.js"] = function (require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.installManagement = installManagement;
const dsh_client_ui_primitives_1 = require("@deepseek-ai/dsh-client-ui-primitives");
const phone_chrome_ts_1 = require("./effects/phone-chrome.js");
const management_menu_ts_1 = require("./workbench/management-menu.js");
const locales_ts_1 = require("./workbench/locales.js");
/** Mobile-only presentation of native account, plugin, settings and global-panel owners. */
function installManagement(ctx, restorePage, openSession, changed) {
    (0, phone_chrome_ts_1.installMobileEffect)(ctx, 'mobile-workbench: management navigation', () => {
        const t = ctx.locale.bind(locales_ts_1.WORKBENCH_NS);
        let anchor = null;
        let menu = null;
        let keyboardOpen = false;
        let releaseMenu = () => { };
        let surface = null;
        let kind = '';
        let currentPanelId = null;
        let chrome = null;
        let mask = null;
        let nativeSessionExit = false;
        let sessionFrame;
        let modalEntry = false;
        let frame;
        let origin = 'sessions';
        let savedScroll = [];
        const marked = new Set();
        const mark = (node, name) => { if (node) {
            node.setAttribute(name, '');
            marked.add(node);
        } };
        const launcher = () => (0, phone_chrome_ts_1.getFrame)()?.querySelector('[data-slot="settings.launcher"] button[aria-haspopup="menu"]') ?? null;
        const captureList = () => {
            const page = document.documentElement.getAttribute('data-mobile-workbench-page');
            origin = page === 'files' || page === 'session' ? page : 'sessions';
            savedScroll = Array.from((0, phone_chrome_ts_1.getFrame)()?.firstElementChild?.querySelectorAll('*') ?? []).filter(node => node.scrollHeight > node.clientHeight && /auto|scroll/.test(getComputedStyle(node).overflowY)).map(node => ({ node, top: node.scrollTop }));
        };
        const restore = () => {
            restorePage(origin);
            for (const { node, top } of savedScroll)
                if (node.isConnected)
                    node.scrollTop = top;
            const focus = origin === 'sessions' ? launcher() : document.querySelector('[data-workbench-destination="' + origin + '"]');
            focus?.focus({ preventScroll: true });
        };
        const close = () => {
            nativeSessionExit = false;
            if (ctx.layout.panelInfo.getSnapshot().activePanelId !== null && kind === 'panel')
                ctx.layout.selectPanel(null);
            else
                (0, dsh_client_ui_primitives_1.closeTopModal)(document);
            restore();
            schedule();
        };
        const clearSurface = () => {
            surface?.removeAttribute('data-mobile-management-surface');
            chrome?.remove();
            chrome = null;
            mask?.remove();
            mask = null;
            surface = null;
            kind = '';
            document.documentElement.removeAttribute('data-mobile-workbench-management');
            changed(false);
        };
        const addChrome = (node, title, type) => {
            surface = node;
            kind = type;
            nativeSessionExit = false;
            node.setAttribute('data-mobile-management-surface', type);
            chrome = document.createElement('div');
            chrome.dataset.mobileManagementChrome = '';
            const back = document.createElement('button');
            back.type = 'button';
            back.textContent = '←';
            back.setAttribute('aria-label', t(origin === 'sessions' ? 'backToSessions' : 'backToPrevious'));
            const heading = document.createElement('h2');
            heading.textContent = title;
            const exit = document.createElement('button');
            exit.type = 'button';
            exit.textContent = '×';
            exit.setAttribute('aria-label', t('close'));
            back.addEventListener('click', close);
            exit.addEventListener('click', close);
            chrome.append(back, heading, exit);
            node.prepend(chrome);
            if (type === 'panel') {
                mask = document.createElement('div');
                mask.dataset.mobileManagementMask = '';
                mask.setAttribute('aria-hidden', 'true');
                mask.addEventListener('click', close);
                node.parentNode?.insertBefore(mask, node);
            }
            else if (!modalEntry) {
                history.pushState({ ...history.state, mobileManagementModal: true }, '');
                modalEntry = true;
            }
            const focused = document.activeElement;
            if (type === 'panel' || (focused instanceof Element && focused.closest('[class*="_toolbar"], [class*="_header"]')))
                back.focus({ preventScroll: true });
            document.documentElement.setAttribute('data-mobile-workbench-management', type);
            changed(true);
        };
        const update = () => {
            frame = undefined;
            const trigger = launcher();
            if (trigger?.parentElement !== anchor) {
                anchor?.removeAttribute('data-mobile-management-anchor');
                anchor = trigger?.parentElement ?? null;
                mark(anchor, 'data-mobile-management-anchor');
            }
            mark((0, phone_chrome_ts_1.getFrame)()?.querySelector('[class*="_logoRow"] button[class*="_toggle"]') ?? null, 'data-mobile-management-toggle');
            mark((0, phone_chrome_ts_1.getFrame)()?.querySelector('[class*="_panelList"]') ?? null, 'data-mobile-management-panels');
            if (menu && (!menu.isConnected || trigger?.getAttribute('aria-expanded') !== 'true')) {
                releaseMenu();
                menu = null;
            }
            const dialogs = Array.from(document.querySelectorAll('[role="dialog"][aria-modal="true"]'));
            const settings = dialogs.find(node => node.getAttribute('data-shortcut-modal') === 'settings');
            const plugins = dialogs.find(node => node.querySelector('[data-plugin-panel]') !== null);
            const panelId = ctx.layout.panelInfo.getSnapshot().activePanelId;
            const panel = panelId ? (0, phone_chrome_ts_1.getFrame)()?.querySelector('[data-slot="main"]') : null;
            const next = settings ?? plugins ?? panel ?? null;
            if (surface === next && (kind !== 'panel' || panelId === currentPanelId))
                return;
            currentPanelId = panelId;
            if (!surface && (settings || plugins))
                captureList();
            const previousKind = kind;
            if (surface)
                clearSurface();
            if (previousKind && previousKind !== 'panel' && !next && modalEntry) {
                modalEntry = false;
                if (history.state?.mobileManagementModal)
                    history.back();
                restore();
            }
            if (previousKind === 'panel' && !next) {
                if (!nativeSessionExit)
                    restore();
                else if (!history.state?.mobilePanelExit) {
                    nativeSessionExit = false;
                    openSession();
                }
            }
            if (next) {
                const title = next.querySelector('h1')?.textContent ?? next.querySelector('[class*="_navTitle"]')?.textContent ?? (0, management_menu_ts_1.managementEntries)(ctx).find(entry => entry.id === panelId)?.label ?? '';
                addChrome(next, title, settings ? 'settings' : plugins ? 'plugins' : 'panel');
            }
        };
        function schedule() { if (frame === undefined)
            frame = requestAnimationFrame(update); }
        const activate = (id) => {
            menu?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
            captureList();
            const native = ctx.get('pluginNavigation');
            if (id === 'plugins' && native?.openModal)
                native.openModal();
            else
                ctx.layout.selectPanel(id);
            schedule();
        };
        const onClick = (event) => {
            if (!(event.target instanceof Element))
                return;
            const newTask = event.target.closest('[data-testid="task-manager-page"] button[class*="_newButton"], [data-testid="task-manager-page"] button[class*="_emptyAction"]');
            if (kind === 'panel' && newTask && surface?.contains(newTask)) {
                nativeSessionExit = true;
                return;
            }
            if (!launcher()?.contains(event.target))
                return;
            if (launcher()?.getAttribute('aria-expanded') !== 'true') {
                captureList();
                keyboardOpen = event.detail === 0;
            }
            schedule();
        };
        const portals = new MutationObserver(records => {
            if (launcher()?.getAttribute('aria-expanded') === 'true' && !menu) {
                const added = records.flatMap(record => Array.from(record.addedNodes)).filter((node) => node instanceof HTMLElement);
                menu = added.find(node => node.matches('[role="menu"]')) ?? null;
                if (menu) {
                    releaseMenu = (0, management_menu_ts_1.decorateManagementMenu)(menu, (0, management_menu_ts_1.managementEntries)(ctx), activate);
                    // Native autofocus may have targeted its first row before owned rows mounted.
                    if (keyboardOpen || menu.contains(document.activeElement))
                        menu.querySelector('[data-mobile-management-entry]')?.focus({ preventScroll: true });
                    keyboardOpen = false;
                }
            }
            schedule();
        });
        portals.observe(document.body, { childList: true });
        const sidebar = new MutationObserver(schedule);
        const bindSidebar = () => {
            sidebar.disconnect();
            const column = (0, phone_chrome_ts_1.getFrame)()?.firstElementChild;
            if (column)
                sidebar.observe(column, { childList: true, subtree: true });
        };
        const stopPanels = ctx.layout.panelInfo.subscribe(() => {
            const panelId = ctx.layout.panelInfo.getSnapshot().activePanelId;
            if (!surface && panelId !== null)
                captureList();
            schedule();
        });
        const refreshMenu = () => {
            if (!menu)
                return;
            const focused = document.activeElement?.getAttribute('data-mobile-management-entry');
            releaseMenu();
            releaseMenu = (0, management_menu_ts_1.decorateManagementMenu)(menu, (0, management_menu_ts_1.managementEntries)(ctx), activate);
            if (focused) {
                const rows = Array.from(menu.querySelectorAll('[data-mobile-management-entry]'));
                (rows.find(row => row.dataset.mobileManagementEntry === focused) ?? rows[0])?.focus({ preventScroll: true });
            }
        };
        const stopLedger = ctx.slots.subscribe('sidebar.panellist', () => { refreshMenu(); schedule(); });
        const stopLocale = ctx.locale.subscribe(() => { refreshMenu(); if (surface)
            clearSurface(); schedule(); });
        const back = (event) => {
            const key = modalEntry ? 'mobileManagementModal' : kind === 'panel' ? 'mobilePanelExit' : null;
            if (key && !event.state?.[key]) {
                const foreground = Array.from(document.querySelectorAll(dsh_client_ui_primitives_1.modalSelector)).at(-1);
                if (foreground && foreground !== surface) {
                    if (foreground.getAttribute('role') === 'menu') {
                        // Native Modal handles Escape before its younger Menu; outside-pointer dismisses only the menu.
                        const owner = surface?.querySelector('button[aria-expanded="true"]');
                        surface?.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch' }));
                        owner?.focus({ preventScroll: true });
                    }
                    else
                        (0, dsh_client_ui_primitives_1.closeTopModal)(document);
                    history.pushState({ ...event.state, [key]: true }, '');
                    event.stopImmediatePropagation();
                    return;
                }
            }
            if (nativeSessionExit && !event.state?.mobilePanelExit) {
                nativeSessionExit = false;
                sessionFrame = requestAnimationFrame(() => { sessionFrame = undefined; openSession(); });
            }
            if (modalEntry && !event.state?.mobileManagementModal) {
                modalEntry = false;
                (0, dsh_client_ui_primitives_1.closeTopModal)(document);
                restore();
            }
        };
        const escape = (event) => {
            if (kind !== 'panel' || event.key !== 'Escape' || event.defaultPrevented || event.isComposing)
                return;
            if (document.querySelector(dsh_client_ui_primitives_1.modalSelector))
                return;
            event.preventDefault();
            close();
        };
        document.addEventListener('click', onClick, true);
        document.addEventListener('keydown', escape);
        window.addEventListener('popstate', back, true);
        update();
        bindSidebar();
        // The first shell mount can follow effect installation.
        const mounts = new MutationObserver(() => { if (!anchor) {
            update();
            bindSidebar();
        } ; if (anchor)
            mounts.disconnect(); });
        if (!anchor)
            mounts.observe(document.body, { childList: true, subtree: true });
        return () => {
            if (frame !== undefined)
                cancelAnimationFrame(frame);
            if (sessionFrame !== undefined)
                cancelAnimationFrame(sessionFrame);
            mounts.disconnect();
            sidebar.disconnect();
            portals.disconnect();
            stopPanels();
            stopLedger();
            stopLocale();
            releaseMenu();
            document.removeEventListener('click', onClick, true);
            document.removeEventListener('keydown', escape);
            window.removeEventListener('popstate', back, true);
            if (modalEntry && history.state?.mobileManagementModal)
                history.back();
            clearSurface();
            for (const node of marked)
                for (const name of ['data-mobile-management-anchor', 'data-mobile-management-toggle', 'data-mobile-management-panels'])
                    node.removeAttribute(name);
        };
    });
}
};
__modules["styles/workbench-management.css.js"] = function (require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WORKBENCH_MANAGEMENT_CSS = void 0;
/** Management geometry is restricted to touch-primary viewports; native owners stay mounted. */
exports.WORKBENCH_MANAGEMENT_CSS = `@media (max-width: 1023px) and (pointer: coarse) {
  html[data-mobile-workbench-active="true"] [data-mobile-management-anchor] {
    position: fixed !important;
    top: calc(env(safe-area-inset-top, 0px) + 14px) !important;
    right: 8px !important;
    width: 44px !important; height: 44px !important;
    z-index: 15;
  }
  html[data-mobile-workbench-active="true"] [data-mobile-nav="frame"] > :first-child [class*="_settingsArea"] [class*="_triggerRow"] [data-mobile-management-anchor] > button {
    width: 44px !important; min-width: 44px !important; height: 44px !important;
    padding: 0 !important; justify-content: center !important;
  }
  [data-mobile-management-anchor] > button > [class*="_label"],
  [data-mobile-management-toggle], [data-mobile-management-panels] { display: none !important; }
  [data-mobile-management-menu][role="menu"] {
    top: calc(env(safe-area-inset-top, 0px) + 62px) !important;
    right: 12px !important; left: auto !important;
    width: min(256px, calc(100vw - 24px)); max-width: calc(100vw - 24px) !important;
    max-height: min(70dvh, 500px); overflow-y: auto;
  }
  html[data-mobile-workbench-management] [data-mobile-workbench="navigation"] { display: none !important; }
  html[data-mobile-workbench-management] { --mobile-workbench-nav-height: 0px !important; }
  html[data-mobile-workbench-management="panel"] [data-mobile-nav="frame"] > :first-child,
  html[data-mobile-workbench-management="panel"] [data-sidebar-right-panel] { visibility: hidden; }
  html[data-mobile-workbench-active="true"][data-mobile-workbench-management] [data-mobile-management-surface][data-mobile-management-surface] {
    position: fixed !important; left: 8px !important;
    top: calc(env(safe-area-inset-top, 0px) + 12px) !important;
    width: calc(100vw - 16px) !important; max-width: calc(100vw - 16px) !important;
    height: min(800px, calc(var(--dsh-web-mobile-vh, 100dvh) - 24px - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))) !important;
    max-height: min(800px, calc(var(--dsh-web-mobile-vh, 100dvh) - 24px - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))) !important;
    margin: 0 !important; transform: none !important; box-sizing: border-box;
    border-radius: var(--dsw-radius-panel); background: var(--dsw-alias-bg-layer-2);
    box-shadow: var(--dsw-elevation-prominent); overflow: hidden;
    display: flex !important; flex-direction: column !important; min-height: 0;
  }
  [data-mobile-management-surface="panel"] { z-index: 51; }
  [data-mobile-management-mask] { position: fixed; inset: 0; background: rgb(0 0 0 / .24); z-index: 50; }
  [data-mobile-management-chrome] { display: flex; align-items: center; flex: none; height: 56px; min-height: 56px; padding: 0 12px; gap: 8px; box-sizing: border-box; }
  [data-mobile-management-chrome] h2 { margin: 0; flex: 1; min-width: 0; font-size: 16px; line-height: 20px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  [data-mobile-management-chrome] button { flex: none; width: 44px; height: 44px; padding: 0; border: 0; border-radius: var(--dsw-radius-sm); background: transparent; color: var(--dsw-alias-label-secondary); font: inherit; font-size: 20px; cursor: pointer; }
  [data-mobile-workbench-session-preset] { padding: 10px 12px; margin-top: 4px; border-top: 1px solid var(--dsw-alias-border-l2); font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-secondary); white-space: normal; overflow-wrap: anywhere; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 3; overflow: hidden; cursor: text; user-select: text; }
  [data-mobile-management-chrome] button:hover { background: var(--dsw-alias-interactive-bg-hover); }
  [data-mobile-management-surface="plugins"] > [class*="_toolbar"],
  [data-mobile-management-surface="plugins"] [data-plugin-panel] h1,
  [data-mobile-management-surface="settings"] > [class*="_content"] > [class*="_header"],
  [data-mobile-management-surface="panel"] [data-testid="task-manager-page"] [class*="_pageHeading"] h1 { display: none !important; }
  [data-mobile-management-surface="panel"] > :not([data-mobile-management-chrome]) { flex: 1; min-height: 0; width: 100%; }
}`;
};
__modules["workbench/index.js"] = function (require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.installWorkbench = installWorkbench;
const page_history_ts_1 = require("./workbench/page-history.js");
const layout_compat_ts_1 = require("./core/layout-compat.js");
const sessions_compat_ts_1 = require("./core/sessions-compat.js");
const phone_chrome_ts_1 = require("./effects/phone-chrome.js");
const workbench_css_ts_1 = require("./styles/workbench.css.js");
const workbench_header_css_ts_1 = require("./styles/workbench-header.css.js");
const workbench_trajectory_css_ts_1 = require("./styles/workbench-trajectory.css.js");
const navigation_ts_1 = require("./workbench/navigation.js");
const dom_observation_ts_1 = require("./workbench/dom-observation.js");
const agent_catalog_loader_ts_1 = require("./workbench/agent-catalog-loader.js");
const presentation_ts_1 = require("./workbench/presentation.js");
const host_bridge_ts_1 = require("./workbench/host-bridge.js");
const agent_counts_ts_1 = require("./workbench/agent-counts.js");
const WorkbenchNav_tsx_1 = require("./workbench/WorkbenchNav.js");
const locales_ts_1 = require("./workbench/locales.js");
const stats_locales_ts_1 = require("./workbench/stats-locales.js");
const session_menu_ts_1 = require("./workbench/session-menu.js");
const preset_display_ts_1 = require("./workbench/preset-display.js");
const update_notice_tsx_1 = require("./workbench/update-notice.js");
const management_ts_1 = require("./workbench/management.js");
const workbench_management_css_ts_1 = require("./styles/workbench-management.css.js");
/** Install reversible mobile navigation using the official shell overlay slot. */
function installWorkbench(ctx) {
    ctx.effect(() => ctx.locale.register(locales_ts_1.WORKBENCH_NS, { zh: locales_ts_1.zh, en: locales_ts_1.en }), 'mobile-workbench: dictionaries');
    ctx.effect(() => ctx.locale.register(stats_locales_ts_1.STATS_NS, { zh: stats_locales_ts_1.statsZh, en: stats_locales_ts_1.statsEn }), 'mobile-workbench: statistics dictionaries');
    const resolvePreset = (0, preset_display_ts_1.createPresetDisplayResolver)(ctx);
    (0, session_menu_ts_1.installWorkbenchSessionMenu)(ctx, resolvePreset);
    (0, update_notice_tsx_1.installWorkbenchUpdateNotice)(ctx);
    ctx.effect(() => {
        const tag = document.createElement('style');
        tag.dataset.pluginCss = 'dsh-web-mobile/workbench.css';
        tag.textContent = workbench_css_ts_1.WORKBENCH_CSS + workbench_header_css_ts_1.WORKBENCH_HEADER_CSS + workbench_trajectory_css_ts_1.WORKBENCH_TRAJECTORY_CSS + workbench_management_css_ts_1.WORKBENCH_MANAGEMENT_CSS;
        document.head.appendChild(tag);
        return () => { tag.remove(); };
    }, 'mobile-workbench: styles');
    const mq = window.matchMedia(phone_chrome_ts_1.MOBILE_QUERY);
    const viewIds = () => ctx.slots.entriesOfSlot('conversation.view')
        .filter(entry => entry.options.label !== undefined)
        .map(entry => entry.options.id ?? '');
    const catalogs = ctx.sessions;
    ctx.effect(() => {
        if (catalogs.refreshProjections === undefined)
            return () => { };
        const loader = (0, agent_catalog_loader_ts_1.installAgentCatalogLoader)(ctx.sessions.list, catalogs.refreshProjections.bind(catalogs), () => mq.matches);
        mq.addEventListener('change', loader.update);
        return () => { mq.removeEventListener('change', loader.update); loader.dispose(); };
    }, 'mobile-workbench: reachable catalog baselines');
    const statusSource = () => ctx.get('uiSession')?.sessionStatus;
    let counts = (0, agent_counts_ts_1.subagentCounts)(ctx.sessions.list.getSnapshot(), statusSource()?.getSnapshot()) ?? {};
    let openSession = () => { };
    ctx.inject(['uiWorkspace'], child => {
        child.effect(() => {
            openSession = id => { child.uiWorkspace.openSession(id); };
            return () => { openSession = () => { }; };
        }, 'mobile-workbench: session navigation service');
    });
    const bridge = (0, host_bridge_ts_1.createHostBridge)(viewIds, () => counts, () => {
        const frame = (0, phone_chrome_ts_1.getFrame)();
        if (frame && !frame.hasAttribute('data-sidebar-collapsed'))
            (0, phone_chrome_ts_1.toggleDrawer)(ctx);
    }, () => {
        const frame = (0, phone_chrome_ts_1.getFrame)();
        if (frame?.hasAttribute('data-sidebar-collapsed'))
            (0, phone_chrome_ts_1.toggleDrawer)(ctx);
    }, {
        show: (0, layout_compat_ts_1.panelSelectorOf)(ctx.layout) ?? (() => { }),
        hasSession: () => (0, sessions_compat_ts_1.currentSessionIdOf)(ctx.sessions.list.getSnapshot()) !== undefined,
        parentId: () => {
            const list = ctx.sessions.list.getSnapshot();
            const id = (0, sessions_compat_ts_1.currentSessionIdOf)(list);
            return id ? list.byId[id]?.parentId : undefined;
        },
        openSession: id => { openSession(id); },
    });
    const presentation = (0, presentation_ts_1.createWorkbenchPresentation)();
    let snapshot = { ...bridge.evidence(), mobile: mq.matches };
    const listeners = new Set();
    const source = {
        getSnapshot: () => snapshot,
        subscribe: (listener) => {
            listeners.add(listener);
            return () => { listeners.delete(listener); };
        },
    };
    let refreshStatus = () => { };
    ctx.inject(['uiSession'], child => {
        child.effect(() => {
            const update = () => { refreshStatus(); };
            update();
            const stop = statusSource()?.subscribe(update);
            return () => { stop?.(); refreshStatus(); };
        }, 'mobile-workbench: live session status');
    });
    let managementOpen = false;
    let refreshManagement = () => { };
    let activate = bridge.activate;
    (0, management_ts_1.installManagement)(ctx, page => { bridge.activate(page); }, () => { activate('session'); }, active => { managementOpen = active; refreshManagement(); });
    ctx.effect(() => {
        const history = (0, page_history_ts_1.installPageHistory)(window, page => { bridge.activate(page); }, () => managementOpen || ctx.layout.panelInfo.getSnapshot().activePanelId !== null);
        activate = (destination, pointerStartedOpen) => {
            if (mq.matches && destination !== 'agents')
                history.enter(destination);
            bridge.activate(destination, pointerStartedOpen);
        };
        let raf;
        let presentationDirty = true;
        const refresh = () => {
            raf = undefined;
            if (presentationDirty || !mq.matches) {
                const frame = mq.matches ? (0, phone_chrome_ts_1.getFrame)() : null;
                if (frame)
                    presentation.update(viewIds(), frame);
                else
                    presentation.clear();
            }
            presentationDirty = false;
            const next = mq.matches
                ? { ...bridge.evidence(), managementOpen, mobile: true }
                : { ...snapshot, mobile: false };
            if ([...Object.keys(snapshot), ...Object.keys(next)].some(key => next[key] !== snapshot[key])) {
                snapshot = next;
                for (const listener of listeners)
                    listener();
            }
            if (mq.matches)
                history.sync((0, navigation_ts_1.resolveDestination)(next));
            if (mq.matches && document.querySelector('[data-mobile-workbench="navigation"]') !== null) {
                document.documentElement.setAttribute('data-mobile-workbench-active', 'true');
                document.documentElement.setAttribute('data-mobile-workbench-page', (0, navigation_ts_1.resolveDestination)(next));
            }
            else {
                document.documentElement.removeAttribute('data-mobile-workbench-active');
                document.documentElement.removeAttribute('data-mobile-workbench-page');
            }
        };
        const schedule = () => {
            if (raf === undefined)
                raf = window.requestAnimationFrame(refresh);
        };
        refreshManagement = schedule;
        const stopPanelInfo = ctx.layout.panelInfo.subscribe(schedule);
        const observer = new MutationObserver(records => {
            if (!mq.matches)
                return;
            const changedPresentation = records.some(record => (0, dom_observation_ts_1.boundaryMutation)(record, dom_observation_ts_1.PRESENTATION_BOUNDARY, dom_observation_ts_1.PRESENTATION_LOCAL));
            presentationDirty ||= changedPresentation;
            if (changedPresentation || records.some(record => (0, dom_observation_ts_1.boundaryMutation)(record, dom_observation_ts_1.NAVIGATION_BOUNDARY)
                || (record.type === 'attributes' && record.target === (0, phone_chrome_ts_1.getFrame)())))
                schedule();
        });
        observer.observe(document.body, {
            childList: true, subtree: true, characterData: true, attributes: true,
            attributeFilter: ['data-sidebar-collapsed', 'aria-label', 'aria-selected', 'aria-expanded', 'data-rightbar-collapsed', 'data-sidebar-right-open', 'data-selected', 'data-trajectory-row-key'],
        });
        const refreshPresentation = () => { presentationDirty = true; schedule(); };
        const refreshCounts = () => {
            counts = (0, agent_counts_ts_1.subagentCounts)(ctx.sessions.list.getSnapshot(), statusSource()?.getSnapshot()) ?? {};
            schedule();
        };
        const stopViews = ctx.slots.subscribe('conversation.view', refreshPresentation);
        const stopSessions = ctx.sessions.list.subscribe(refreshCounts);
        refreshStatus = refreshCounts;
        const escape = (event) => {
            if (!mq.matches || event.key !== 'Escape' || !event.isTrusted || !(event.target instanceof Element))
                return;
            if (!event.target.closest('[role="tree"][class*="_menuBody"], [data-mobile-workbench="agents"]'))
                return;
            event.preventDefault();
            event.stopImmediatePropagation();
            bridge.closeAgents();
        };
        document.addEventListener('keydown', escape, true);
        mq.addEventListener('change', refreshPresentation);
        refresh();
        return () => {
            observer.disconnect();
            stopViews();
            stopPanelInfo();
            refreshManagement = () => { };
            stopSessions();
            refreshStatus = () => { };
            history.dispose();
            document.removeEventListener('keydown', escape, true);
            bridge.clear();
            mq.removeEventListener('change', refreshPresentation);
            if (raf !== undefined)
                window.cancelAnimationFrame(raf);
            document.documentElement.removeAttribute('data-mobile-workbench-active');
            document.documentElement.removeAttribute('data-mobile-workbench-page');
            presentation.clear();
            listeners.clear();
        };
    }, 'mobile-workbench: host navigation evidence');
    ctx.slots.inject('conversation.session.header.actions', () => ctx.slots.register({
        name: 'conversation.session.header.actions',
        id: 'mobile-workbench-agents',
        order: 5,
        locale: locales_ts_1.WORKBENCH_NS,
        inject: () => ({ resolvePreset, tStats: ctx.locale.bind(stats_locales_ts_1.STATS_NS), hooks: { workbench: source }, activate: (destination, pointerStartedOpen) => { activate(destination, pointerStartedOpen); }, selectView: bridge.selectView, returnParent: bridge.returnParent, closeAgents: bridge.closeAgents, focusAgents: bridge.focusAgents }),
    }, WorkbenchNav_tsx_1.WorkbenchAgents));
    ctx.slots.inject('shell.overlay', () => ctx.slots.register({
        name: 'shell.overlay',
        id: 'mobile-workbench-navigation',
        order: 20,
        locale: locales_ts_1.WORKBENCH_NS,
        inject: () => ({ resolvePreset, tStats: ctx.locale.bind(stats_locales_ts_1.STATS_NS), hooks: { workbench: source }, activate: (destination, pointerStartedOpen) => { activate(destination, pointerStartedOpen); }, selectView: bridge.selectView, returnParent: bridge.returnParent, closeAgents: bridge.closeAgents, focusAgents: bridge.focusAgents }),
    }, WorkbenchNav_tsx_1.WorkbenchNav));
}
};
__modules["workbench/composer-geometry.js"] = function (require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.composerKeyboardOpen = composerKeyboardOpen;
exports.composerNavigationRelease = composerNavigationRelease;
exports.composerEndpointReturn = composerEndpointReturn;
exports.composerHeightBudget = composerHeightBudget;
// Visual viewport shrink, not focus, is keyboard evidence.
function composerKeyboardOpen(baseline, height, scale) {
    return composerNavigationRelease(baseline, height, scale) > 0;
}
function composerNavigationRelease(baseline, height, scale) {
    if (Math.abs(scale - 1) >= 0.05)
        return 0;
    return Math.max(0, baseline - height - Math.max(120, baseline * 0.18));
}
function composerEndpointReturn(previousHeight, height, baseline, scale) {
    return Math.abs(scale - 1) < 0.05 && height - previousHeight > Math.max(120, baseline * 0.18);
}
function composerHeightBudget(available, chrome) {
    const context = Math.min(150, Math.max(48, available - chrome - 44));
    const card = Math.max(80, available - context);
    return { input: Math.max(44, Math.min(160, available * 0.3, card - chrome)), card, context };
}
};
__modules["workbench/composer-locales.js"] = function (require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.en = exports.zh = exports.COMPOSER_NS = void 0;
exports.COMPOSER_NS = 'mobileComposer';
exports.zh = {
    expand: '展开编辑',
    collapse: '收起编辑',
    draft: '编辑草稿',
    done: '完成',
};
exports.en = {
    expand: 'Expand editor',
    collapse: 'Collapse editor',
    draft: 'Edit draft',
    done: 'Done',
};
};
__modules["workbench/composer-controls.js"] = function (require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createComposerControls = createComposerControls;
const composer_locales_ts_1 = require("./workbench/composer-locales.js");
let headingSequence = 0;
/** Only the plugin-owned controls are mounted or moved; the editor remains native. */
function createComposerControls(ctx, toggle) {
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('data-mobile-compose-toggle', '');
    button.setAttribute('aria-expanded', 'false');
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5M3 3l6 6m12-6-6 6M3 21l6-6m12 6-6-6');
    svg.append(path);
    button.append(svg);
    const header = document.createElement('div');
    header.setAttribute('data-mobile-compose-header', '');
    const heading = document.createElement('strong');
    heading.id = 'mobile-compose-heading-' + ++headingSequence;
    const done = document.createElement('button');
    done.type = 'button';
    header.append(heading, done);
    const t = ctx.locale.bind(composer_locales_ts_1.COMPOSER_NS);
    let expanded = false;
    const render = () => {
        const caption = t(expanded ? 'collapse' : 'expand');
        button.setAttribute('aria-label', caption);
        button.title = caption;
        button.setAttribute('aria-expanded', String(expanded));
        heading.textContent = t('draft');
        done.textContent = t('done');
        done.setAttribute('aria-label', t('collapse'));
        done.title = t('collapse');
    };
    const keepSelection = (event) => event.preventDefault();
    const onClick = (event) => {
        event.stopPropagation();
        toggle(event.detail === 0);
    };
    for (const control of [button, done]) {
        control.addEventListener('pointerdown', keepSelection);
        control.addEventListener('mousedown', keepSelection);
        control.addEventListener('click', onClick);
    }
    const unsubscribe = ctx.locale.subscribe(render);
    render();
    return {
        button, header, heading, done,
        update(value) { expanded = value; render(); },
        dispose() {
            unsubscribe();
            for (const control of [button, done]) {
                control.removeEventListener('pointerdown', keepSelection);
                control.removeEventListener('mousedown', keepSelection);
                control.removeEventListener('click', onClick);
            }
            button.remove();
            header.remove();
        },
    };
}
};
__modules["workbench/composer-focus.js"] = function (require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createComposerFocus = createComposerFocus;
/** A focus scope for the existing expanded card and its native menu portals. */
function createComposerFocus(card, heading, done) {
    let active = false;
    const originals = new Map(['role', 'aria-modal', 'aria-labelledby'].map(key => [key, card.getAttribute(key)]));
    const inert = new Map();
    const portals = () => Array.from(card.querySelectorAll('[aria-controls]'))
        .flatMap(trigger => (trigger.getAttribute('aria-controls') ?? '').split(' '))
        .map(id => document.getElementById(id))
        .filter((node) => node !== null && node.getBoundingClientRect().width > 0);
    const roots = () => [card, ...portals()];
    const nestedModal = () => Array.from(document.querySelectorAll('[aria-modal="true"]'))
        .some(node => node !== card && !card.contains(node) && node.getBoundingClientRect().width > 0);
    const restoreInert = () => {
        for (const [element, value] of inert)
            element.inert = value;
        inert.clear();
    };
    const sync = () => {
        restoreInert();
        // A native image viewer or modal temporarily owns its own focus scope.
        if (!active || nestedModal())
            return;
        const allowed = roots();
        const visit = (parent) => {
            for (const element of parent.children) {
                if (!(element instanceof HTMLElement) || element.matches('script, style, link'))
                    continue;
                if (allowed.includes(element))
                    continue;
                if (allowed.some(root => element.contains(root)))
                    visit(element);
                else {
                    inert.set(element, element.inert);
                    element.inert = true;
                }
            }
        };
        visit(document.body);
    };
    const focusable = () => roots().flatMap(root => Array.from(root.querySelectorAll('button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), a[href], [contenteditable="true"], [tabindex]:not([tabindex="-1"])'))).filter(element => !element.closest('[inert]') && (element.tabIndex >= 0 || element.isContentEditable)
        && element.getClientRects().length > 0 && getComputedStyle(element).visibility !== 'hidden');
    const onKey = (event) => {
        if (event.key !== 'Tab' || event.isComposing || nestedModal())
            return;
        const items = focusable();
        if (!items.length)
            return;
        const index = items.indexOf(document.activeElement);
        const next = event.shiftKey ? (index <= 0 ? items.length - 1 : index - 1) : (index + 1) % items.length;
        event.preventDefault();
        items[next]?.focus({ preventScroll: true });
    };
    const onFocus = (event) => {
        if (nestedModal() || !(event.target instanceof Node) || roots().some(root => root.contains(event.target)))
            return;
        done.focus({ preventScroll: true });
    };
    const observer = new MutationObserver(sync);
    const stop = () => {
        active = false;
        observer.disconnect();
        document.removeEventListener('keydown', onKey, true);
        document.removeEventListener('focusin', onFocus, true);
        restoreInert();
        for (const [key, value] of originals) {
            if (value === null)
                card.removeAttribute(key);
            else
                card.setAttribute(key, value);
        }
    };
    return {
        start(keyboard) {
            if (active)
                return;
            active = true;
            card.setAttribute('role', 'dialog');
            card.setAttribute('aria-modal', 'true');
            card.setAttribute('aria-labelledby', heading.id);
            observer.observe(document.body, { childList: true });
            observer.observe(card, { subtree: true, attributes: true, attributeFilter: ['aria-controls', 'aria-expanded'] });
            document.addEventListener('keydown', onKey, true);
            document.addEventListener('focusin', onFocus, true);
            sync();
            if (keyboard)
                done.focus({ preventScroll: true });
        },
        stop,
    };
}
};
__modules["workbench/composer-session.js"] = function (require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.composerScope = composerScope;
exports.composerTriggers = composerTriggers;
/** Borrow the current main-view generation; never retain or open a Session to inspect UI. */
function composerScope(ctx) {
    const current = Object.values(ctx.sessions.list.getSnapshot().byId)
        .find(row => (row.retainedBy.mainView ?? 0) > 0);
    return current === undefined ? undefined : ctx.sessions.scope(current.id);
}
/** Resolve on use, so delayed work cannot keep a disposed Session controller alive. */
function composerTriggers(ctx) {
    const scope = composerScope(ctx);
    return scope === undefined ? undefined : ctx.inputTriggers.sessionOf(scope);
}
};
__modules["workbench/composer.js"] = function (require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.installWorkbenchComposer = installWorkbenchComposer;
const phone_chrome_ts_1 = require("./effects/phone-chrome.js");
const dom_observation_ts_1 = require("./workbench/dom-observation.js");
const composer_geometry_ts_1 = require("./workbench/composer-geometry.js");
const composer_controls_ts_1 = require("./workbench/composer-controls.js");
const composer_focus_ts_1 = require("./workbench/composer-focus.js");
const composer_session_ts_1 = require("./workbench/composer-session.js");
const composer_locales_ts_1 = require("./workbench/composer-locales.js");
const CARD = '[data-composer-card]';
const INPUT = '[data-composer-input]';
const SCROLL = '[data-input-scroll]';
const MARKER = 'data-mobile-workbench-composer';
const EXPANDED = 'data-mobile-compose-expanded';
const KEYBOARD = 'data-mobile-workbench-keyboard';
const RETURNING = 'data-mobile-compose-returning';
/** Decorate the official Lexical card in place; never own draft or submit state. */
function installWorkbenchComposer(ctx) {
    ctx.effect(() => ctx.locale.register(composer_locales_ts_1.COMPOSER_NS, { zh: composer_locales_ts_1.zh, en: composer_locales_ts_1.en }), 'dsh-web-mobile: composer dictionaries');
    (0, phone_chrome_ts_1.installMobileEffect)(ctx, 'dsh-web-mobile: workbench composer', () => {
        const root = document.documentElement;
        const oldMarkers = new Map([EXPANDED, KEYBOARD, RETURNING].map(key => [key, root.getAttribute(key)]));
        const properties = ['--mobile-compose-vv-height', '--mobile-compose-vv-top', '--mobile-compose-vv-left', '--mobile-compose-vv-width', '--mobile-compose-nav-release', '--mobile-compose-frame-max'];
        const oldProperties = properties.map(key => [key, root.style.getPropertyValue(key), root.style.getPropertyPriority(key)]);
        let card = null;
        let button = null;
        let header = null;
        const decorations = new Map();
        const decorate = (element, key, value) => {
            if (element.getAttribute(key) === value)
                return;
            let previous = decorations.get(element);
            if (!previous)
                decorations.set(element, previous = new Map());
            if (!previous.has(key))
                previous.set(key, element.getAttribute(key));
            if (value === null)
                element.removeAttribute(key);
            else
                element.setAttribute(key, value);
        };
        let restoreCard;
        let controls;
        let focus;
        let expanded = false;
        let frame = 0;
        let width = window.innerWidth;
        let baseline = window.visualViewport?.height ?? window.innerHeight;
        const viewport = window.visualViewport;
        let previousHeight = baseline;
        let previousWidth = viewport?.width ?? window.innerWidth;
        let previousBottom = baseline + (viewport?.offsetTop ?? 0);
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        const resizeObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => schedule());
        const mark = (name, on) => {
            if (on) {
                if (root.getAttribute(name) !== 'true')
                    root.setAttribute(name, 'true');
            }
            else if (root.hasAttribute(name))
                root.removeAttribute(name);
        };
        const cancelReturning = () => {
            if (!root.hasAttribute(RETURNING))
                return;
            mark(RETURNING, false);
            for (const animation of card?.closest('[data-mobile-nav="frame"]')?.getAnimations() ?? []) {
                if ('transitionProperty' in animation
                    && (animation.transitionProperty === 'max-height' || animation.transitionProperty === 'padding-bottom'))
                    animation.cancel();
            }
        };
        const setStyle = (element, key, value) => {
            if (element.style.getPropertyValue(key) !== value)
                element.style.setProperty(key, value);
        };
        const setExpanded = (value, keyboard = false, restoreFocus = true) => {
            cancelReturning();
            expanded = value;
            mark(EXPANDED, value);
            if (card) {
                if (value)
                    card.setAttribute(EXPANDED, 'true');
                else
                    card.removeAttribute(EXPANDED);
            }
            controls?.update(value);
            if (value)
                focus?.start(keyboard);
            else {
                focus?.stop();
                if (restoreFocus && button?.isConnected)
                    button.focus({ preventScroll: true });
            }
            schedule();
        };
        const release = () => {
            cancelReturning();
            resizeObserver?.disconnect();
            focus?.stop();
            focus = undefined;
            controls?.dispose();
            controls = undefined;
            button?.remove();
            button = null;
            header?.remove();
            header = null;
            for (const [element, attributes] of decorations) {
                for (const [key, value] of attributes) {
                    if (value === null)
                        element.removeAttribute(key);
                    else
                        element.setAttribute(key, value);
                }
            }
            decorations.clear();
            restoreCard?.();
            restoreCard = undefined;
            card = null;
            setExpanded(false, false, false);
        };
        const attach = (next) => {
            release();
            card = next;
            const attributes = [MARKER, EXPANDED, 'data-mobile-compose-overflow'].map(key => [key, next.getAttribute(key)]);
            const styles = ['--mobile-compose-input-max', '--mobile-compose-card-max'].map(key => [key, next.style.getPropertyValue(key), next.style.getPropertyPriority(key)]);
            restoreCard = () => {
                for (const [key, value] of attributes) {
                    if (value === null)
                        next.removeAttribute(key);
                    else
                        next.setAttribute(key, value);
                }
                for (const [key, value, priority] of styles) {
                    if (value)
                        next.style.setProperty(key, value, priority);
                    else
                        next.style.removeProperty(key);
                }
            };
            next.setAttribute(MARKER, 'true');
            controls = (0, composer_controls_ts_1.createComposerControls)(ctx, keyboard => setExpanded(!expanded, keyboard));
            button = controls.button;
            header = controls.header;
            focus = (0, composer_focus_ts_1.createComposerFocus)(next, controls.heading, controls.done);
            next.append(header);
            resizeObserver?.observe(next);
            const seat = next.closest('[data-composer-seat]');
            if (seat)
                resizeObserver?.observe(seat);
            const layoutFrame = next.closest('[data-mobile-nav="frame"]');
            if (layoutFrame)
                resizeObserver?.observe(layoutFrame);
        };
        const ensureControls = () => {
            if (!card || !button || !header)
                return;
            const row = card.querySelector(':scope > [class*="_row"]:has([class*="_trailing"])');
            if (row) {
                decorate(row, 'data-mobile-compose-bar', 'true');
                // Reattach only plugin-owned children after a React lane replacement.
                if (button.parentElement !== card)
                    card.append(button);
            }
            else
                button.remove();
            if (header.parentElement !== card)
                card.append(header);
        };
        const update = () => {
            frame = 0;
            const next = Array.from(document.querySelectorAll(CARD)).find(candidate => candidate.querySelector(INPUT) && candidate.getBoundingClientRect().width > 0) ?? null;
            if (next !== card) {
                if (next)
                    attach(next);
                else
                    release();
            }
            ensureControls();
            const height = viewport?.height ?? window.innerHeight;
            const currentWidth = viewport?.width ?? window.innerWidth;
            const scale = viewport?.scale ?? 1;
            if (Math.abs(currentWidth - width) > 40 && Math.abs(scale - 1) < 0.05) {
                width = currentWidth;
                baseline = height;
            }
            if (Math.abs(scale - 1) < 0.05)
                baseline = Math.max(baseline, height, window.innerHeight);
            const keyboard = (0, composer_geometry_ts_1.composerKeyboardOpen)(baseline, height, scale);
            const bottom = height + (viewport?.offsetTop ?? 0);
            const layoutFrame = card?.closest('[data-mobile-nav="frame"]') ?? null;
            const normal = !!layoutFrame && !expanded && !document.querySelector('[aria-modal="true"]');
            const duration = getComputedStyle(root).getPropertyValue('--ds-transition-duration').trim();
            const coarseReturn = normal && root.hasAttribute(KEYBOARD) && !keyboard && currentWidth === previousWidth
                && (viewport?.offsetTop ?? 0) === previousBottom - previousHeight
                && (0, composer_geometry_ts_1.composerEndpointReturn)(previousHeight, height, baseline, scale) && !reducedMotion.matches
                && (!duration || parseFloat(duration) > 0);
            if (coarseReturn)
                mark(RETURNING, true);
            else if (!normal || reducedMotion.matches || Math.abs(scale - 1) >= 0.05 || keyboard || height !== previousHeight || bottom !== previousBottom || currentWidth !== previousWidth)
                cancelReturning();
            previousHeight = height;
            previousWidth = currentWidth;
            previousBottom = bottom;
            mark(KEYBOARD, keyboard);
            setStyle(root, properties[0], `${height}px`);
            setStyle(root, properties[1], `${viewport?.offsetTop ?? 0}px`);
            setStyle(root, properties[2], `${viewport?.offsetLeft ?? 0}px`);
            setStyle(root, properties[3], `${currentWidth}px`);
            setStyle(root, properties[4], `${(0, composer_geometry_ts_1.composerNavigationRelease)(baseline, height, scale)}px`);
            // Limit the normal frame to the visible bottom; browser panning already owns its top.
            setStyle(root, properties[5], Math.abs(scale - 1) < 0.05 ? `${height + (viewport?.offsetTop ?? 0)}px` : '100%');
            if (!card || expanded)
                return;
            const scroll = card.querySelector(SCROLL);
            if (!scroll)
                return;
            // Anchor the corner to writing, not the attachment rail above it.
            if (button)
                setStyle(button, 'top', `${Math.max(0, scroll.offsetTop - 8)}px`);
            const seat = card.closest('[data-composer-seat]');
            const conversation = card.closest('[data-conversation-content]');
            const top = Math.max(0, (conversation?.getBoundingClientRect().top ?? 80) - (viewport?.offsetTop ?? 0));
            const navValue = getComputedStyle(root).getPropertyValue('--mobile-workbench-nav-height');
            // The navigation effect owns padding. Resolve its possibly calc()-based variable.
            probeNode.style.height = navValue.trim() ? 'var(--mobile-workbench-nav-height)' : 'calc(56px + env(safe-area-inset-bottom, 0px))';
            const navHeight = probeNode.getBoundingClientRect().height;
            // During a coarse return, budget from the painted frame, not the final viewport.
            const nav = layoutFrame ? Math.max(0, parseFloat(getComputedStyle(layoutFrame).paddingBottom) || 0) : navHeight;
            const availableHeight = layoutFrame
                ? Math.min(height, Math.max(0, layoutFrame.getBoundingClientRect().bottom - (viewport?.offsetTop ?? 0))) : height;
            const cardHeight = card.getBoundingClientRect().height;
            const dock = Math.max(0, (seat?.getBoundingClientRect().height ?? cardHeight) - cardHeight);
            const chrome = Math.max(cardHeight, card.scrollHeight || cardHeight) - scroll.getBoundingClientRect().height;
            const budget = (0, composer_geometry_ts_1.composerHeightBudget)(Math.max(100, availableHeight - top - nav - dock - 12), chrome);
            setStyle(card, '--mobile-compose-input-max', `${Math.floor(budget.input)}px`);
            setStyle(card, '--mobile-compose-card-max', `${Math.floor(budget.card)}px`);
            const overflow = chrome + 44 > budget.card;
            if (overflow && !card.hasAttribute('data-mobile-compose-overflow'))
                card.setAttribute('data-mobile-compose-overflow', 'true');
            if (!overflow && card.hasAttribute('data-mobile-compose-overflow'))
                card.removeAttribute('data-mobile-compose-overflow');
        };
        function schedule() {
            if (!frame)
                frame = window.requestAnimationFrame(update);
        }
        // Observe host visibility changes too: the composer fallback can hide in place.
        // Idempotent CSS writes settle after one extra observer pass.
        const observer = new MutationObserver(records => {
            if (records.some(record => (0, dom_observation_ts_1.boundaryMutation)(record, dom_observation_ts_1.COMPOSER_BOUNDARY)
                || record.attributeName === 'data-workbench-trajectory'
                || (record.type === 'childList' && (0, dom_observation_ts_1.boundaryMutation)(record, '[data-workbench-trajectory], [data-trajectory-scroll]', dom_observation_ts_1.COMPOSER_BOUNDARY))
                || (record.type === 'attributes' && record.target instanceof Element
                    && (record.target.contains(card) || record.attributeName === 'aria-modal'
                        || (record.attributeName === 'data-phase' && record.target.querySelector(CARD) !== null)))))
                schedule();
        });
        // Outside body, so measurements cannot trigger the tree observer.
        const probeNode = document.createElement('div');
        probeNode.setAttribute('aria-hidden', 'true');
        probeNode.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;width:0';
        root.append(probeNode);
        observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'data-phase', 'aria-modal', 'class', 'data-workbench-trajectory'] });
        window.addEventListener('resize', schedule);
        viewport?.addEventListener('resize', schedule);
        viewport?.addEventListener('scroll', schedule);
        const onKey = (event) => {
            if (event.key !== 'Escape' || !expanded || event.isComposing)
                return;
            const triggers = (0, composer_session_ts_1.composerTriggers)(ctx);
            if (triggers?.menu.getSnapshot().open) {
                event.preventDefault();
                event.stopPropagation();
                triggers.dismiss();
                return;
            }
            if (!document.querySelector('[role="menu"], [role="listbox"]')
                && !Array.from(document.querySelectorAll('[role="dialog"][aria-modal="true"]')).some(dialog => dialog !== card)) {
                event.preventDefault();
                event.stopPropagation();
                setExpanded(false);
            }
        };
        const onTransitionEnd = (event) => {
            if ((event.propertyName === 'max-height' || event.propertyName === 'padding-bottom')
                && event.target === card?.closest('[data-mobile-nav="frame"]')) {
                mark(RETURNING, false);
                schedule();
            }
        };
        const onReducedMotion = () => {
            if (reducedMotion.matches)
                cancelReturning();
            schedule();
        };
        document.addEventListener('keydown', onKey, true);
        document.addEventListener('transitionend', onTransitionEnd, true);
        reducedMotion.addEventListener('change', onReducedMotion);
        schedule();
        return () => {
            observer.disconnect();
            probeNode.remove();
            window.removeEventListener('resize', schedule);
            viewport?.removeEventListener('resize', schedule);
            viewport?.removeEventListener('scroll', schedule);
            document.removeEventListener('keydown', onKey, true);
            document.removeEventListener('transitionend', onTransitionEnd, true);
            reducedMotion.removeEventListener('change', onReducedMotion);
            release();
            window.cancelAnimationFrame(frame);
            for (const [key, value] of oldMarkers) {
                if (value === null)
                    root.removeAttribute(key);
                else
                    root.setAttribute(key, value);
            }
            for (const [key, value, priority] of oldProperties) {
                if (value)
                    root.style.setProperty(key, value, priority);
                else
                    root.style.removeProperty(key);
            }
        };
    });
}
};
__modules["workbench/composer-model-label.js"] = function (require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.composerModelName = composerModelName;
/** Shorten catalog names only in the mobile trigger; menu and custom names stay intact. */
function composerModelName(owner, mobile) {
    if (!mobile || owner.placement !== 'trigger')
        return owner.model.name;
    let name = owner.model.name;
    for (const prefix of ['openai/', 'anthropic/', 'deepseek/']) {
        if (name.startsWith(prefix))
            name = name.slice(prefix.length);
    }
    if (name.startsWith('gpt-'))
        return 'GPT-' + name.slice(4);
    if (name.startsWith('claude-'))
        return 'Claude ' + name.slice(7);
    return name;
}
};
__modules["workbench/ModelLabel.js"] = function (require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelLabel = ModelLabel;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const phone_chrome_ts_1 = require("./effects/phone-chrome.js");
const composer_model_label_ts_1 = require("./workbench/composer-model-label.js");
const subscribe = (notify) => {
    const media = window.matchMedia(phone_chrome_ts_1.MOBILE_QUERY);
    media.addEventListener('change', notify);
    return () => media.removeEventListener('change', notify);
};
const mobileSnapshot = () => window.matchMedia(phone_chrome_ts_1.MOBILE_QUERY).matches;
/** The host owns selection, localization and catalog identity. This slot is text only. */
function ModelLabel(owner) {
    const mobile = (0, react_1.useSyncExternalStore)(subscribe, mobileSnapshot, () => false);
    return (0, jsx_runtime_1.jsx)("span", { title: owner.model.name, children: (0, composer_model_label_ts_1.composerModelName)(owner, mobile) });
}
};
__modules["effects/panel-back.js"] = function (require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPanelBack = createPanelBack;
const layout_compat_ts_1 = require("./core/layout-compat.js");
/** Own one global-panel entry above any workbench page entry. */
function createPanelBack(layout) {
    const selectPanel = (0, layout_compat_ts_1.panelSelectorOf)(layout);
    let armed = false;
    let selfBack = false;
    let disposed = false;
    let leaving = false;
    let timer;
    const clearEcho = () => {
        selfBack = false;
        if (timer !== undefined)
            window.clearTimeout(timer);
        timer = undefined;
    };
    const release = () => {
        armed = false;
        selfBack = true;
        timer = window.setTimeout(() => { clearEcho(); update(); }, 1200);
        history.back();
    };
    const update = () => {
        if (disposed)
            return;
        const open = layout.panelInfo.getSnapshot().activePanelId !== null;
        if (!open)
            leaving = false;
        if (leaving)
            return;
        if (open && !armed && !selfBack) {
            try {
                history.pushState({ ...history.state, mobilePanelExit: true }, '');
                armed = true;
            }
            catch {
                // Embedded browsers may disable history writes.
            }
        }
        else if (!open && armed)
            release();
    };
    const onBack = (event) => {
        if (selfBack) {
            clearEcho();
            update();
            return;
        }
        // Another entry above ours, or Forward into ours, has not consumed it.
        if (!armed || event.state?.mobilePanelExit === true)
            return;
        armed = false;
        leaving = true;
        if (layout.panelInfo.getSnapshot().activePanelId !== null)
            selectPanel();
    };
    const unsubscribe = layout.panelInfo.subscribe(update);
    window.addEventListener('popstate', onBack);
    update();
    return {
        update,
        dispose: () => {
            disposed = true;
            unsubscribe();
            window.removeEventListener('popstate', onBack);
            if (armed && history.state?.mobilePanelExit === true) {
                armed = false;
                history.back();
            }
            clearEcho();
        },
    };
}
};
__modules["effects/workbench-decoration.js"] = function (require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.installWorkbenchDecoration = installWorkbenchDecoration;
const phone_chrome_ts_1 = require("./effects/phone-chrome.js");
const panel_back_ts_1 = require("./effects/panel-back.js");
/** Mark the native frame without observing its streamed content. */
function installWorkbenchDecoration(ctx) {
    (0, phone_chrome_ts_1.installMobileEffect)(ctx, 'mobile-workbench: frame decoration and panel Back', () => {
        const panelBack = (0, panel_back_ts_1.createPanelBack)(ctx.layout);
        let frame = null;
        const refresh = () => {
            const next = (0, phone_chrome_ts_1.findFrame)();
            if (next === frame)
                return;
            frame?.removeAttribute('data-mobile-nav');
            frame = next;
            frame?.setAttribute('data-mobile-nav', 'frame');
            mounts.disconnect();
            if (frame?.parentElement)
                mounts.observe(frame.parentElement, { childList: true });
            else
                mounts.observe(document.body, { childList: true, subtree: true });
        };
        const mounts = new MutationObserver(refresh);
        mounts.observe(document.body, { childList: true, subtree: true });
        refresh();
        return () => {
            mounts.disconnect();
            panelBack.dispose();
            frame?.removeAttribute('data-mobile-nav');
        };
    });
}
};
__modules["effects/session-tap-fallback.js"] = function (require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTapFallback = createTapFallback;
exports.isTapWithinSlop = isTapWithinSlop;
/** One missing-click recovery per tap; native clicks always cancel it. */
function createTapFallback(later) {
    let stop;
    const cancel = () => { stop?.(); stop = undefined; };
    return {
        cancel,
        arm: activate => {
            cancel();
            stop = later(() => { stop = undefined; activate(); });
        },
    };
}
/** Per-axis slop distinguishes a row tap from scrolling. */
function isTapWithinSlop(from, to, slopPx) {
    return Math.abs(to.x - from.x) <= slopPx && Math.abs(to.y - from.y) <= slopPx;
}
};
__modules["workbench/plugin-modal.js"] = function (require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.openPluginsModal = openPluginsModal;
/** Use the optional public modal command before the original panel-row click changes pages. */
function openPluginsModal(ctx, event) {
    if (document.documentElement.getAttribute('data-mobile-workbench-active') !== 'true')
        return false;
    const navigation = ctx.get('pluginNavigation');
    if (navigation?.openModal === undefined || !(event.target instanceof Element))
        return false;
    const row = event.target.closest('button[class*="_panelRow"]');
    const panelList = document.querySelector('[data-mobile-nav="frame"] > :first-child [class*="_panelList"]');
    if (row === null || panelList === null || !panelList.contains(row))
        return false;
    const rows = Array.from(panelList.querySelectorAll(':scope > button[class*="_panelRow"]'));
    // SidebarRoot maps this public ledger in order; never identify a row by localized copy.
    const ids = ctx.slots.entriesOfSlot('sidebar.panellist')
        .map(entry => ({ id: entry.options.id, order: entry.options.order ?? 0 }))
        .sort((a, b) => a.order - b.order).map(entry => entry.id);
    if (rows.length !== ids.length || ids[rows.indexOf(row)] !== 'plugins')
        return false;
    event.preventDefault();
    event.stopImmediatePropagation();
    navigation.openModal();
    return true;
}
};
__modules["effects/sessions-touch.js"] = function (require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.installSessionsTouch = installSessionsTouch;
const sessions_compat_ts_1 = require("./core/sessions-compat.js");
const phone_chrome_ts_1 = require("./effects/phone-chrome.js");
const session_tap_fallback_ts_1 = require("./effects/session-tap-fallback.js");
const plugin_modal_ts_1 = require("./workbench/plugin-modal.js");
/** Native row actions remain authoritative; this effect only adapts touch input. */
function installSessionsTouch(ctx) {
    (0, phone_chrome_ts_1.installMobileEffect)(ctx, 'mobile-workbench: sessions touch', () => {
        const ios = (0, phone_chrome_ts_1.detectIosWebKit)(navigator, typeof CSS === 'undefined' ? null : CSS.supports.bind(CSS));
        const fallback = (0, session_tap_fallback_ts_1.createTapFallback)(run => {
            const timer = window.setTimeout(run, 350);
            return () => window.clearTimeout(timer);
        });
        let press;
        let timer;
        let swallow;
        let swallowUntil = 0;
        let pendingSession;
        let recoveredRow;
        let closeFrame;
        const syntheticRenames = new WeakSet();
        const sessionsVisible = () => document.documentElement.getAttribute('data-mobile-workbench-page') === 'sessions';
        const rowOf = (target) => {
            if (!sessionsVisible() || document.querySelector('[aria-modal="true"]'))
                return null;
            if (!(target instanceof Element) || target.closest('button, [class*="_rowActions"]'))
                return null;
            const row = target.closest('[class*="_sessionRow"]');
            return row && (0, phone_chrome_ts_1.getFrame)()?.firstElementChild?.contains(row) ? row : null;
        };
        const clearPress = () => {
            if (timer !== undefined)
                window.clearTimeout(timer);
            timer = undefined;
            press = undefined;
        };
        const closeSessions = () => {
            if (closeFrame !== undefined)
                window.cancelAnimationFrame(closeFrame);
            closeFrame = window.requestAnimationFrame(() => {
                closeFrame = undefined;
                if (sessionsVisible() && (0, phone_chrome_ts_1.getFrame)()?.hasAttribute('data-sidebar-collapsed') === false)
                    (0, phone_chrome_ts_1.toggleDrawer)(ctx);
            });
        };
        const sessionId = (row) => {
            const key = row.getAttribute('data-row-key');
            if (!key?.startsWith('session:'))
                return null;
            const id = key.slice('session:'.length);
            return Object.hasOwn(ctx.sessions.list.getSnapshot().byId, id) ? id : null;
        };
        const stopSessions = ctx.sessions.list.subscribe(() => {
            if (pendingSession && (0, sessions_compat_ts_1.currentSessionIdOf)(ctx.sessions.list.getSnapshot()) === pendingSession) {
                pendingSession = undefined;
                closeSessions();
            }
        });
        const onDown = (event) => {
            fallback.cancel();
            clearPress();
            pendingSession = undefined;
            recoveredRow = undefined;
            if (event.pointerType !== 'touch' && event.pointerType !== 'pen')
                return;
            const row = rowOf(event.target);
            if (!row)
                return;
            press = { row, x: event.clientX, y: event.clientY, fired: false };
            timer = window.setTimeout(() => {
                timer = undefined;
                if (!press)
                    return;
                press.fired = true;
                const title = row.querySelector('[class*="_title"]');
                if (title) {
                    const rename = new MouseEvent('dblclick', { bubbles: true, cancelable: true, view: window });
                    syntheticRenames.add(rename);
                    title.dispatchEvent(rename);
                }
                else
                    row.querySelector('[class*="_rowActions"] button')?.click();
            }, 500);
        };
        const onMove = (event) => {
            if (press && !(0, session_tap_fallback_ts_1.isTapWithinSlop)(press, { x: event.clientX, y: event.clientY }, 10))
                clearPress();
        };
        const onUp = (event) => {
            const finished = press;
            clearPress();
            if (!finished)
                return;
            if (finished.fired) {
                swallow = finished.row;
                swallowUntil = performance.now() + 800;
                return;
            }
            if (!(0, session_tap_fallback_ts_1.isTapWithinSlop)(finished, { x: event.clientX, y: event.clientY }, 12))
                return;
            // DSHA owns single-select / double-open. Never manufacture its clicks.
            if (!ios || finished.row.closest('[data-dsha-session-select]'))
                return;
            const id = sessionId(finished.row);
            if (!id)
                return;
            fallback.arm(() => {
                if (finished.row.isConnected && sessionsVisible()) {
                    recoveredRow = finished.row;
                    finished.row.click();
                }
            });
        };
        const onClick = (event) => {
            const target = event.target;
            // A late trusted click from the recovered tap must not activate twice.
            // The next physical pointerdown releases this guard.
            if (event.isTrusted && recoveredRow && target instanceof Element && recoveredRow.contains(target)) {
                event.preventDefault();
                event.stopPropagation();
                return;
            }
            if (swallow && performance.now() <= swallowUntil && target instanceof Element && swallow.contains(target)) {
                swallow = undefined;
                fallback.cancel();
                event.preventDefault();
                event.stopPropagation();
                return;
            }
            if (sessionsVisible() && (0, plugin_modal_ts_1.openPluginsModal)(ctx, event))
                return;
            const row = rowOf(target);
            if (!row) {
                // Navigation must reach React before the sessions pane is hidden.
                if (sessionsVisible() && target instanceof Element
                    && (0, phone_chrome_ts_1.getFrame)()?.firstElementChild?.contains(target)
                    && target.closest('[class*="newSession"], [class*="searchResultRow"], [class*="searchResultWorkspace"], [class*="panelRow"], button[data-dsh-taskboard-entry], button[data-dsh-ssh-entry]'))
                    closeSessions();
                return;
            }
            fallback.cancel();
            if (row.closest('[data-dsha-session-select]'))
                return;
            const id = sessionId(row);
            if (!id)
                return;
            if ((0, sessions_compat_ts_1.currentSessionIdOf)(ctx.sessions.list.getSnapshot()) === id)
                closeSessions();
            else
                pendingSession = id;
        };
        const onDoubleClick = (event) => {
            if (syntheticRenames.has(event) || !rowOf(event.target))
                return;
            if (!(event.target instanceof Element) || !event.target.closest('[class*="_title"]'))
                return;
            event.preventDefault();
            event.stopPropagation();
        };
        const onCancel = () => { clearPress(); fallback.cancel(); };
        document.addEventListener('pointerdown', onDown, true);
        document.addEventListener('pointermove', onMove, true);
        document.addEventListener('pointerup', onUp, true);
        document.addEventListener('pointercancel', onCancel, true);
        document.addEventListener('click', onClick, true);
        document.addEventListener('dblclick', onDoubleClick, true);
        document.addEventListener('dsha-session-open', closeSessions);
        return () => {
            onCancel();
            stopSessions();
            if (closeFrame !== undefined)
                window.cancelAnimationFrame(closeFrame);
            document.removeEventListener('pointerdown', onDown, true);
            document.removeEventListener('pointermove', onMove, true);
            document.removeEventListener('pointerup', onUp, true);
            document.removeEventListener('pointercancel', onCancel, true);
            document.removeEventListener('click', onClick, true);
            document.removeEventListener('dblclick', onDoubleClick, true);
            document.removeEventListener('dsha-session-open', closeSessions);
        };
    });
}
};
__modules["effects/composer-keyboard-guard.js"] = function (require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SHADOW_MARKER = void 0;
exports.installComposerKeyboardGuard = installComposerKeyboardGuard;
const phone_chrome_ts_1 = require("./effects/phone-chrome.js");
/**
 * iOS keyboard guard for the composer's fixed control cluster.
 *
 * Upstream `dsh-client-ui-conversation` (0.1.2-rc.1) hangs the same
 * `keepFocus` handler on the composer row's three buttons (send, stop, the
 * `+` commands trigger):
 *
 *   const keepFocus = (e) => {
 *     e.preventDefault()
 *     editor?.getRootElement()?.focus({ preventScroll: true })
 *   }
 *
 * `onMouseDown` keeps the caret in the editor across button clicks on
 * desktop. On iOS WebKit the same handler runs inside the tap's synthesized
 * mousedown, and that programmatic `focus()` call re-raises the on-screen
 * keyboard whenever it had closed (scroll-to-dismiss, keyboard dismissal,
 * PWA relaunch) while logical focus never left the contenteditable. The
 * user taps Send on a collapsed keyboard and the keyboard springs back up
 * over the running conversation — the message still sends, but the screen
 * is now half keyboard.
 *
 * Fix strategy, scoped to iOS WebKit (the engine that re-raises keyboards
 * from a programmatic focus; Android/desktop behavior is untouched):
 *
 * In the capture phase of every mousedown whose target sits inside the
 * composer card but is NOT the editing surface itself, temporarily install
 * an own no-op `focus` property on the `[data-composer-input]` element.
 * React's `keepFocus` then calls the shadow instead of the prototype
 * method, the keyboard stays down, and the shadow is removed on the next
 * macrotask so nothing outlives the tap:
 *
 *   capture mousedown → shadow focus → (bubbling) keepFocus → click →
 *   macrotask restore
 *
 * Why shadowing instead of intercepting the event: `keepFocus`'s own
 * `preventDefault()` must keep running (it stops the tap from blurring
 * the editor), and the editor's own tap-to-type path must never be
 * touched — only the button-initiated programmatic focus is undesirable
 * on iOS. A capture-phase `stopPropagation` would break both.
 *
 * DOM contract (verified against 0.1.2-rc.1 dsh-client-ui-conversation):
 * - `[data-composer-card]` — the composer card root (InputBar).
 * - `[data-composer-input]` — the Lexical contenteditable surface.
 * - The buttons carry hashed `_primary`/`_add` classes and no stable
 *   data marker, so the card boundary (not the buttons) is the anchor.
 * Audit both markers when the conversation package upgrades.
 */
/** The composer card root that owns the fixed control cluster. */
const COMPOSER_CARD_SELECTOR = '[data-composer-card]';
/** The Lexical editing surface (the only element allowed to raise the keyboard). */
const COMPOSER_INPUT_SELECTOR = '[data-composer-input]';
/** Re-arm marker kept on the editor element while its focus is shadowed.
 *  Exported: session-focus-guard.ts shares the same shadow slot (one marker,
 *  one own-property recipe) so both guards stay interoperable. */
exports.SHADOW_MARKER = 'data-mobile-nav-focus-shadow';
function installComposerKeyboardGuard(ctx) {
    (0, phone_chrome_ts_1.installMobileEffect)(ctx, 'dsh-web-mobile: composer keyboard guard', () => {
        // 2026-09-23 扩档（店主报"点加号会弹键盘、而且再点关不掉"）：
        // `+` 的 onClick 是宿主的 onToggleCommandMenu，它先 focusDraftEditor()
        // 再 toggleCommandMenu(caretSpan) —— 命令菜单需要光标，于是每次点 + 都
        // 把键盘顶起来。键盘一开，整行上移 ~283px（真机探针：composer y 687→404），
        // 店主第二次点的是"加号原来的位置"，自然关不掉，看起来像 toggle 坏了。
        // 同一段 focusDraftEditor 在 iOS 上就是本守卫要拦的调用，所以把启用条件
        // 从"仅 iOS WebKit"放宽到"触屏档（pointer: coarse）"：桌面（精细指针）保持
        // 原样，手机/平板上一律不让 composer 按钮去抢编辑器焦点。拦截的是**程序
        // 化** focus()，原生点输入框聚焦不受影响（点输入框的路径已被下面的 early
        // return 排除）。
        const ios = (0, phone_chrome_ts_1.detectIosWebKit)(navigator, typeof CSS !== 'undefined' && typeof CSS.supports === 'function' ? CSS.supports.bind(CSS) : null);
        const coarse = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
        if (!ios && !coarse) {
            return undefined;
        }
        /** 影子撤除计时器（每次按钮点按重置；见 onPointerDown 里的时间轴注释）。 */
        let shadowTimer = 0;
        /**
         * 撤影子 **并且关掉守卫窗口**。
         *
         * 2026-09-23 二次修订（店主报"点两下加号之后输入框动不了了"）：
         * 原来这里只删影子、不归零 `shadowTimer`，而下面 `onFocusIn` 的开关就是
         * `shadowTimer === 0` —— 于是**点过一次 composer 按钮之后守卫永久生效**：
         * 任何 focusin 都被当场 `blur()`，店主点输入框再也弹不出键盘。
         * 真机行为级取证（探针：先合成一次 composer 按钮 pointerdown，等过 700ms 窗口，
         * 再 blur + focus 编辑器）：
         *   修前 `shadowAttrLeft=false ownFocusLeft=false blurWorked=true focusHeld=false k=754`
         *   ⇒ 影子已撤、计时器却还挂着 ⇒ 守卫一直在，编辑器拿不回焦点。
         */
        const restore = () => {
            window.clearTimeout(shadowTimer);
            shadowTimer = 0;
            const el = document.querySelector(`[${exports.SHADOW_MARKER}]`);
            if (el === null)
                return;
            el.removeAttribute(exports.SHADOW_MARKER);
            const shadowed = el;
            if (Object.prototype.hasOwnProperty.call(el, 'focus'))
                delete shadowed.focus;
        };
        const onPointerDown = (event) => {
            const target = event.target;
            if (!(target instanceof Element))
                return;
            if (typeof target.closest !== 'function')
                return;
            const card = target.closest(COMPOSER_CARD_SELECTOR);
            if (card === null)
                return;
            const editor = card.querySelector(COMPOSER_INPUT_SELECTOR);
            if (editor === null)
                return;
            // 店主自己点编辑面：这是"我要打字"的正路，立刻解除守卫窗口，
            // 绝不让兜底 blur 打到这一下（窗口内点输入框也必须能弹键盘）。
            if (target.closest(COMPOSER_INPUT_SELECTOR) !== null) {
                restore();
                return;
            }
            // A button-area tap: shadow focus for the remainder of this dispatch.
            restore();
            editor.setAttribute(exports.SHADOW_MARKER, '');
            Object.defineProperty(editor, 'focus', {
                configurable: true,
                writable: true,
                value: function swallowedFocus() {
                    /* keepFocus called; keep the dismissed keyboard dismissed */
                },
            });
            // 影子的存活窗口 = 700ms 固定窗口，**不能**"click 后立刻撤"。
            // 2026-09-23 真机探针的事件轨迹（点一次 `+`）：
            //   51.5 clicks:添加文件或调用指令 / shadow:ON
            //   51.6 shadow:off          ← 旧的"click 后 setTimeout(0) 撤"
            //   51.7 vv 754→471          ← 键盘此时才弹 ⇒ 宿主是在"菜单打开后的 effect"
            //                              里再 focus 一次，撤早了等于白装。
            // 影子只拦**程序化** focus()；窗口内用户点输入框由上面那个 early return
            // 当场解除窗口，所以放宽到 700ms 是安全的；窗口内新的按钮点按会重置计时。
            window.clearTimeout(shadowTimer);
            shadowTimer = window.setTimeout(restore, 700);
        };
        // 2026-09-23：只挂 mousedown 会空转。Android WebView 上按钮的点击经常吃不到
        // 兼容性 mousedown（touchstart 被 preventDefault 时更甚），于是影子从没装上，
        // 宿主 click 里的 focusDraftEditor 照样把键盘顶起来 —— 店主实测"两个问题都还在"。
        // 三个入口都挂上，处理体是幂等的（每次先 restore 再重装影子）。
        // 兜底：万一"按钮点按 → 编辑器被聚焦"仍然把键盘顶起来（真机可能走
        // 我们拦不到的路径），在同一个 700ms 窗口内立刻把焦点还回去 —— blur 会
        // 收起软键盘。宿主的光标/草稿来自它自己的 keyboard 状态，不依赖 DOM focus，
        // 所以这里 blur 不会丢草稿（用户随后点输入框照常输入）。
        const onFocusIn = (event) => {
            if (shadowTimer === 0)
                return;
            const target = event.target;
            if (!(target instanceof HTMLElement))
                return;
            if (target.closest(COMPOSER_INPUT_SELECTOR) === null)
                return;
            // 同步 blur：放到宏任务里 IME 已经开始弹了（真机实测 setTimeout 版无效，
            // vv 仍然 754→471）。在 focusin 的捕获阶段当场 blur，键盘根本不会出现。
            target.blur();
        };
        // A deliberate Tab inside the expanded editor is not a touch-button autofocus.
        const onKeyDown = (event) => {
            if (event.key !== 'Tab' || !event.isTrusted || event.isComposing)
                return;
            const target = event.target;
            if (target instanceof Element && target.closest('[data-composer-card][data-mobile-compose-expanded="true"]'))
                restore();
        };
        document.addEventListener('keydown', onKeyDown, true);
        document.addEventListener('pointerdown', onPointerDown, true);
        document.addEventListener('touchstart', onPointerDown, true);
        document.addEventListener('mousedown', onPointerDown, true);
        document.addEventListener('focusin', onFocusIn, true);
        return () => {
            document.removeEventListener('keydown', onKeyDown, true);
            document.removeEventListener('pointerdown', onPointerDown, true);
            document.removeEventListener('touchstart', onPointerDown, true);
            document.removeEventListener('mousedown', onPointerDown, true);
            document.removeEventListener('focusin', onFocusIn, true);
            restore();
        };
    });
}
};
__modules["effects/composer-plus-toggle.js"] = function (require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.installComposerPlusToggle = installComposerPlusToggle;
const phone_chrome_ts_1 = require("./effects/phone-chrome.js");
const composer_session_ts_1 = require("./workbench/composer-session.js");
const ADD = '[data-composer-card] button[class*="_add"]';
const INPUT = '[data-composer-input]';
/** Native focus/track can clear the launcher before its own toggle. Close via the public controller. */
function installComposerPlusToggle(ctx) {
    (0, phone_chrome_ts_1.installMobileEffect)(ctx, 'dsh-web-mobile: composer plus toggle', () => {
        let openBeforeClick = false;
        let scopeBeforeClick;
        let subscribedScope;
        let unsubscribeMenu;
        let collapseTimers = [];
        const cancelCollapse = () => {
            for (const timer of collapseTimers)
                window.clearTimeout(timer);
            collapseTimers = [];
        };
        const sync = () => {
            const scope = (0, composer_session_ts_1.composerScope)(ctx);
            if (scope === subscribedScope)
                return;
            unsubscribeMenu?.();
            subscribedScope = scope;
            cancelCollapse();
            unsubscribeMenu = (0, composer_session_ts_1.composerTriggers)(ctx)?.menu.subscribe(() => {
                if (!(0, composer_session_ts_1.composerTriggers)(ctx)?.menu.getSnapshot().open)
                    cancelCollapse();
            });
        };
        const dropEditorFocus = () => {
            const editor = document.querySelector(INPUT);
            if (editor && document.activeElement === editor)
                editor.blur();
        };
        const onPointer = (event) => {
            if (!(event.target instanceof Element))
                return;
            if (event.target.closest(INPUT))
                cancelCollapse();
            else if (event.target.closest(ADD)) {
                sync();
                // Real Android IME can reopen even when programmatic focus is shadowed.
                dropEditorFocus();
            }
        };
        const capture = (event) => {
            openBeforeClick = false;
            scopeBeforeClick = undefined;
            if (!(event.target instanceof Element) || !event.target.closest(ADD))
                return;
            sync();
            scopeBeforeClick = (0, composer_session_ts_1.composerScope)(ctx);
            openBeforeClick = (0, composer_session_ts_1.composerTriggers)(ctx)?.menu.getSnapshot().open ?? false;
        };
        const bubble = (event) => {
            const wasOpen = openBeforeClick;
            const scope = scopeBeforeClick;
            openBeforeClick = false;
            scopeBeforeClick = undefined;
            if (!(event.target instanceof Element) || !event.target.closest(ADD))
                return;
            if (scope === undefined || scope !== (0, composer_session_ts_1.composerScope)(ctx))
                return;
            const controller = (0, composer_session_ts_1.composerTriggers)(ctx);
            if (wasOpen && controller?.menu.getSnapshot().open)
                controller.dismiss();
            cancelCollapse();
            if (!(0, composer_session_ts_1.composerTriggers)(ctx)?.menu.getSnapshot().open)
                return;
            for (const delay of [120, 320, 640])
                collapseTimers.push(window.setTimeout(() => {
                    if (scope === (0, composer_session_ts_1.composerScope)(ctx) && (0, composer_session_ts_1.composerTriggers)(ctx)?.menu.getSnapshot().open)
                        dropEditorFocus();
                }, delay));
        };
        const unsubscribeList = ctx.sessions.list.subscribe(sync);
        sync();
        document.addEventListener('pointerdown', onPointer, true);
        document.addEventListener('click', capture, true);
        document.addEventListener('click', bubble);
        return () => {
            cancelCollapse();
            unsubscribeList();
            unsubscribeMenu?.();
            document.removeEventListener('pointerdown', onPointer, true);
            document.removeEventListener('click', capture, true);
            document.removeEventListener('click', bubble);
        };
    });
}
};
__modules["effects/workspace-chip-toggle.js"] = function (require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.installWorkspaceChipToggle = installWorkspaceChipToggle;
const phone_chrome_ts_1 = require("./effects/phone-chrome.js");
/**
 * 工作区 chip「再点关闭」的接管（2026-09-23，对账 0.1.7-rc.1）。
 *
 * 症状：hero 空态的工作区 chip，第一次点开工作区列表，**再点 chip 关不掉**
 * （列表原地不动，等于又开一次）。要求的行为：单击打开、再单击关闭。
 *
 * 真根因（读宿主源码得出）：
 * `ui-conversation` 的 chip 自己是正常 toggle（`ConversationContent.tsx`）：
 *
 *   onClick: () => { setPickerOpen(open => !open) }
 *
 * 关不掉的原因在 `ui-workspace` 的 WorkspacePickFlow 怎么开这个菜单：
 *
 *   <Menu anchor={null} portal getAnchorRect={anchorRef.current.getBoundingClientRect} … />
 *
 * `anchor={null}` ⇒ Menu 的 rootRef 是一个**空 span**，触发器 chip 在 Menu 子树之外；
 * 而 `ui-primitives/Menu.tsx` 的「外部 pointerdown 关闭」只豁免 rootRef / listRef：
 *
 *   if (rootRef.current?.contains(target) === true) return
 *   if (listRef.current?.contains(target) === true) return
 *   onClose()
 *
 * ⇒ 菜单开着时点 chip：pointerdown 先被判成「外部点击」→ onClose()（翻到 false），
 *   紧接着的 click 到达 chip 的 onClick → 又翻回 true。净效果＝再开一次。
 * 旁证：同行的「预设」触发器传的是 `anchor={<button …/>}`（按钮在 rootRef 内），
 * pointerdown 不被判外部，所以它没有这个毛病 —— 同一份 Menu，两种接线。
 *
 * 修法（只补这一个缺口，宿主关闭路径原样保留）：
 *   pointerdown 捕获阶段：chip 自报 `aria-expanded="true"`（＝菜单真开着）且宿主的
 *   portal 菜单在场时，记下这一击；
 *   click 捕获阶段：同一 chip 的 click 直接 stopPropagation —— React 挂在 root 容器上
 *   的 onClick 不再执行，chip 的 toggle 不会被翻回「开」，宿主 pointerdown 的那次
 *   关闭成为唯一结果。菜单本来就关着时（第一击的开启路径）完全不介入。
 *
 * 开态读 `aria-expanded` 而不是「点在不在菜单里」：pointerdown 阶段 React 尚未重渲染，
 * 读到的是这一击之前的真实状态；等到 click 再读 DOM 会读到未冲刷的旧树。
 */
/** hero 工作区 chip：hero 行的**直接子**按钮（预设触发器在 Menu 的 anchor span 里，不是直接子）。 */
const CHIP_SELECTOR = '[class*="heroWorkspaceRow"] > button[aria-haspopup="menu"]';
/** 宿主 Menu 的 portal 列表：只有它在场，宿主的「外部 pointerdown 关闭」才存在。 */
const OPEN_MENU_SELECTOR = '[role="menu"]';
function installWorkspaceChipToggle(ctx) {
    (0, phone_chrome_ts_1.installMobileEffect)(ctx, 'dsh-web-mobile: workspace chip toggle', () => {
        /** 这一击之前 chip 报「菜单开着」的那颗 chip（否则 null）。 */
        let armed = null;
        const chipFrom = (target) => target instanceof Element ? target.closest(CHIP_SELECTOR) : null;
        const onPointerDownCapture = (event) => {
            armed = null;
            const chip = chipFrom(event.target);
            if (chip === null)
                return;
            if (chip.getAttribute('aria-expanded') !== 'true')
                return;
            if (document.querySelector(OPEN_MENU_SELECTOR) === null)
                return;
            armed = chip;
        };
        const onClickCapture = (event) => {
            const chip = armed;
            armed = null;
            if (chip === null || chipFrom(event.target) !== chip)
                return;
            event.stopPropagation();
        };
        document.addEventListener('pointerdown', onPointerDownCapture, true);
        document.addEventListener('click', onClickCapture, true);
        return () => {
            armed = null;
            document.removeEventListener('pointerdown', onPointerDownCapture, true);
            document.removeEventListener('click', onClickCapture, true);
        };
    });
}
};
__modules["effects/team-chip-toggle.js"] = function (require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.installTeamChipToggle = installTeamChipToggle;
const phone_chrome_ts_1 = require("./effects/phone-chrome.js");
/**
 * 团队 chip「再点关闭」的接管（2026-09-23，对账 0.1.7-rc.1）。
 *
 * 症状：点头部那颗智能体团队图标能打开面板，**再点同一颗关不掉**，必须点面板
 * 四周（或按 Escape）才关。要求的行为：单击打开、再单击关闭。
 *
 * 真根因（读宿主源码得出，本轮真机复现）：
 * `dsh-experimental-client-ui-agent-team/lib/client.js` 的触发器 onClick 只处理
 * 「开」，开态时改为聚焦面板 —— 它自己**永远不关**：
 *
 *   onClick: () => {
 *     cancelHoverChange()
 *     pinnedRef.current = true
 *     if (!open) changeOpen(true)
 *     else panelRef.current?.focus()   // 开着就只 focus，不 toggle
 *   }
 *
 * 关闭路径只有两条：`ui-primitives` 的 useDismissOnOutsidePointer（document 上的
 * pointerdown，靶心在 root/panel 之外即 setOpen(false)）与面板内注册的 Escape
 * keydown。桌面靠 hover 开合，这个「点了只 pin 不 toggle」不成问题；手机上就成了
 * 「点了关不掉」。
 *
 * 修法（替用户把「点四周」这件事做掉，宿主两条关闭路径原样保留）：
 *   pointerdown 捕获阶段：触发器自报 aria-expanded="true" 且宿主的 body portal
 *   面板在场时，记下这一击；
 *   click 捕获阶段：同一触发器 → 先向 document.body 派发一次合成 pointerdown
 *   （靶心在 root 与面板之外 ⇒ 命中宿主自己的 outside-dismiss ⇒ 真关闭），
 *   再 stopPropagation 掉这一击 click —— 否则宿主的 onClick 还会在旧闭包里走
 *   else 分支去 focus 面板。
 *
 * 为什么先派发再吞 click（顺序不可换）：宿主 dismiss 是 document 上的 bubble
 * 监听，我们处在 capture 阶段，同步派发即同步生效；而 click 一旦放过去，宿主的
 * onClick 会看到尚未冲刷的 open=true 并执行 focus。
 *
 * 开态读 aria-expanded 而不是「点在不在面板里」：pointerdown 阶段 React 尚未重渲染，
 * 读到的是这一击之前的真实状态（与 workspace-chip-toggle 同一条判据）。
 */
/** 团队 chip 根：宿主 agent-team 实验插件的稳定标记。 */
const ROOT_SELECTOR = '[data-team-action]';
/** 触发器：根的直接子按钮（aria-haspopup 是 dialog，不是 menu）。 */
const TRIGGER_SELECTOR = '[data-team-action] > button[aria-haspopup="dialog"]';
/** 面板：宿主 portal 到 body、带稳定标记与 role="dialog"。 */
const PANEL_SELECTOR = '[data-team-panel]';
function installTeamChipToggle(ctx) {
    (0, phone_chrome_ts_1.installMobileEffect)(ctx, 'dsh-web-mobile: team chip toggle', () => {
        /** 这一击之前自报「面板开着」的那颗触发器（否则 null）。 */
        let armed = null;
        const triggerFrom = (target) => target instanceof Element ? target.closest(TRIGGER_SELECTOR) : null;
        const onPointerDownCapture = (event) => {
            armed = null;
            const trigger = triggerFrom(event.target);
            if (trigger === null)
                return;
            if (trigger.getAttribute('aria-expanded') !== 'true')
                return;
            if (document.querySelector(ROOT_SELECTOR) === null)
                return;
            if (document.querySelector(PANEL_SELECTOR) === null)
                return;
            armed = trigger;
        };
        const onClickCapture = (event) => {
            const trigger = armed;
            armed = null;
            if (trigger === null || triggerFrom(event.target) !== trigger)
                return;
            // 「点四周」这一步必须用 pointerdown：宿主的 dismiss 只监听 pointerdown。
            // 靶心选 document.body —— 它既不在 root 内、也不在面板内，是最省事的真外部。
            document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }));
            event.stopPropagation();
        };
        document.addEventListener('pointerdown', onPointerDownCapture, true);
        document.addEventListener('click', onClickCapture, true);
        return () => {
            armed = null;
            document.removeEventListener('pointerdown', onPointerDownCapture, true);
            document.removeEventListener('click', onClickCapture, true);
        };
    });
}
};
__modules["effects/model-menu-anchor.js"] = function (require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.installModelMenuAnchor = installModelMenuAnchor;
const phone_chrome_ts_1 = require("./effects/phone-chrome.js");
/** Model menus follow their native trigger's aria-controls, never a CSS-module hash. */
const MODEL_TRIGGER = '[data-slot="conversation.input.model"] button[aria-haspopup="menu"]';
/** Center the menu over the native composer card. */
const COMPOSER_CARD = '[data-composer-card]';
/** Minimum viewport gutter. */
const GUTTER = 8;
/** Native open animation may measure again during these delays. */
const SETTLE_MS = [0, 60, 200];
function installModelMenuAnchor(ctx) {
    (0, phone_chrome_ts_1.installMobileEffect)(ctx, 'dsh-web-mobile: model menu anchor', () => {
        let raf = 0;
        const timers = [];
        // Cache only the open portal for viewport updates.
        let active = null;
        const originalLeft = new Map();
        const restoreLeft = (menu) => {
            const original = originalLeft.get(menu);
            if (!original)
                return;
            if (original.value)
                menu.style.setProperty('left', original.value, original.priority);
            else
                menu.style.removeProperty('left');
            originalLeft.delete(menu);
        };
        const laidOut = (el) => {
            if (el === null)
                return null;
            const box = el.getBoundingClientRect();
            return box.width > 0 && box.height > 0 ? box : null;
        };
        // Resolve menus only after interactions with the model seat.
        const findMenu = () => {
            for (const trigger of document.querySelectorAll(MODEL_TRIGGER)) {
                const id = trigger.getAttribute('aria-controls');
                const menu = id === null ? null : document.getElementById(id);
                if (menu !== null && laidOut(menu) !== null)
                    return menu;
            }
            return null;
        };
        // Write only left; native code still owns vertical placement.
        const place = (menu) => {
            const menuBox = laidOut(menu);
            if (menuBox === null)
                return;
            const width = menuBox.width;
            const viewport = document.documentElement.clientWidth;
            const max = Math.max(GUTTER, viewport - width - GUTTER);
            const card = document.querySelector(COMPOSER_CARD);
            const cardBox = card === null ? null : card.getBoundingClientRect();
            const trigger = cardBox !== null && cardBox.width > 0 ? null : document.querySelector(MODEL_TRIGGER);
            const triggerBox = trigger === null ? null : trigger.getBoundingClientRect();
            const center = cardBox !== null && cardBox.width > 0
                ? cardBox.left + cardBox.width / 2
                : triggerBox === null ? null : triggerBox.left + triggerBox.width / 2;
            if (center === null)
                return;
            const left = Math.min(Math.max(center - width / 2, GUTTER), max);
            const next = `${Math.round(left)}px`;
            // Do not rewrite an unchanged position.
            if (menu.style.left !== next) {
                if (!originalLeft.has(menu))
                    originalLeft.set(menu, { value: menu.style.getPropertyValue('left'), priority: menu.style.getPropertyPriority('left') });
                menu.style.left = next;
            }
        };
        // Refresh the cached portal after native activation.
        const refresh = () => {
            const next = findMenu();
            if (active !== null && active !== next)
                restoreLeft(active);
            active = next;
            if (active !== null)
                place(active);
        };
        // Viewport changes reuse the active portal.
        const follow = () => {
            if (active === null)
                return;
            if (laidOut(active) === null) {
                restoreLeft(active);
                active = null;
                return;
            }
            place(active);
        };
        const schedule = (run) => {
            if (raf !== 0)
                return;
            raf = window.requestAnimationFrame(() => {
                raf = 0;
                run();
            });
        };
        // Settle after the native opening measurements.
        const scheduleRefresh = () => {
            schedule(refresh);
            for (const delay of SETTLE_MS)
                timers.push(window.setTimeout(() => schedule(refresh), delay));
            // Bound pending callbacks during repeated interaction.
            while (timers.length > SETTLE_MS.length * 2) {
                const stale = timers.shift();
                if (stale !== undefined)
                    window.clearTimeout(stale);
            }
        };
        // Ignore unrelated controls and menus.
        const touchesMenu = (event) => {
            const target = event.target;
            if (!(target instanceof Element))
                return false;
            return target.closest(MODEL_TRIGGER) !== null || active?.contains(target) === true;
        };
        const onPointerDown = (event) => {
            if (touchesMenu(event))
                scheduleRefresh();
        };
        // Include keyboard, accessibility, and synthetic clicks.
        const onKeyDown = (event) => {
            if (touchesMenu(event))
                scheduleRefresh();
        };
        const onFocusIn = (event) => {
            if (touchesMenu(event))
                scheduleRefresh();
        };
        const onClick = (event) => {
            if (touchesMenu(event))
                scheduleRefresh();
        };
        // Viewport updates never search for menus.
        const onViewportChange = () => {
            schedule(follow);
        };
        document.addEventListener('pointerdown', onPointerDown, true);
        document.addEventListener('keydown', onKeyDown, true);
        document.addEventListener('focusin', onFocusIn, true);
        document.addEventListener('click', onClick, true);
        window.addEventListener('resize', onViewportChange);
        document.addEventListener('scroll', onViewportChange, true);
        return () => {
            document.removeEventListener('pointerdown', onPointerDown, true);
            document.removeEventListener('keydown', onKeyDown, true);
            document.removeEventListener('focusin', onFocusIn, true);
            document.removeEventListener('click', onClick, true);
            window.removeEventListener('resize', onViewportChange);
            document.removeEventListener('scroll', onViewportChange, true);
            if (raf !== 0)
                window.cancelAnimationFrame(raf);
            for (const timer of timers)
                window.clearTimeout(timer);
            timers.length = 0;
            for (const menu of originalLeft.keys())
                restoreLeft(menu);
            active = null;
        };
    });
}
};
__modules["effects/shortcut-modal-keyboard-guard.js"] = function (require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.installShortcutModalKeyboardGuard = installShortcutModalKeyboardGuard;
const phone_chrome_ts_1 = require("./effects/phone-chrome.js");
/**
 * Mobile guard: the keyboard-shortcut modal must not raise the soft keyboard
 * by itself.
 *
 * `dsh-client-ui-shortcuts` renders its search field with the host marker
 * `data-modal-autofocus` (`<input data-modal-autofocus …/>`), and the
 * primitives Modal focuses that field when the modal mounts. On desktop that
 * is the right default. On a phone it costs the user half the screen the
 * moment the sheet opens — the page is a shortcut EDITOR and the search box is
 * its secondary affordance — and it also makes the sheet jump, because the
 * modal is sized by `100dvh`: the keyboard shrinking the viewport resizes it
 * (measured 2026-09-25: `dvh` 844 → 520 takes the dialog from 600px to 496px,
 * i.e. the card snaps right after it appears; on the host's centered card the
 * same change moved the top edge 152 → 84, the earlier 「抽搐」 report).
 *
 * Why not the own-property shadow `composer-keyboard-guard.ts` uses: that
 * focus happens during React's COMMIT (the Modal's layout-effect path), which
 * is still inside the task that inserted the node. A MutationObserver callback
 * is a microtask and therefore runs AFTER it — measured: with the own no-op
 * `focus` already installed on the field, `document.activeElement` was still
 * the field. So the guard has to be in place BEFORE the modal is inserted,
 * which leaves exactly one synchronous hook: the method itself. While either
 * modal of this family is in the DOM we shadow `HTMLInputElement.prototype.focus`
 * and no-op it for the shortcut modal's autofocus field; the shadow is removed
 * as soon as neither modal is present (and on dispose), so nothing outlives the
 * user's visit to that sheet.
 *
 * A TAP is unaffected: the browser focuses natively, and the shadow only
 * replaces the JS method. Search therefore stays one tap away, and the shadow
 * also stops the host's `modifiedCount`-driven re-focus from pulling the caret
 * out of a field the user is already using.
 *
 * DOM contract (verified against 0.1.7-rc.2):
 * - `[data-shortcut-modal="settings"]` — the settings sheet (the only opener).
 * - `[data-shortcut-modal="shortcuts"]` — the shortcut modal.
 * - `[data-modal-autofocus]` — the field the Modal focuses on mount.
 * Re-audit all three when the host or dsh-client-ui-shortcuts upgrades.
 */
const SETTINGS_MODAL = '[data-shortcut-modal="settings"]';
const SHORTCUT_MODAL = '[data-shortcut-modal="shortcuts"]';
/** The field the Modal's mount-time focus must not reach, on phones only. */
const AUTOFOCUS_FIELD = SHORTCUT_MODAL + ' [data-modal-autofocus]';
/**
 * Keep the shortcut modal's search field from grabbing focus (and the soft
 * keyboard) by itself, on the mobile breakpoint only.
 * @param ctx - client root context.
 */
function installShortcutModalKeyboardGuard(ctx) {
    (0, phone_chrome_ts_1.installMobileEffect)(ctx, 'dsh-web-mobile: shortcut modal keyboard guard', () => {
        const proto = HTMLInputElement.prototype;
        // Captured once per arming so restore always puts the real method back.
        let original = null;
        const arm = () => {
            if (original !== null)
                return;
            const previous = proto.focus;
            original = previous;
            proto.focus = function focus(options) {
                if (this.matches(AUTOFOCUS_FIELD))
                    return;
                previous.call(this, options);
            };
        };
        const disarm = () => {
            if (original === null)
                return;
            proto.focus = original;
            original = null;
        };
        const sync = () => {
            const present = document.querySelector(SETTINGS_MODAL) !== null ||
                document.querySelector(SHORTCUT_MODAL) !== null;
            if (present)
                arm();
            else
                disarm();
        };
        // childList only (no subtree): both modal roots are portaled to body as
        // direct children, and a subtree observer would run on every mutation the
        // app makes. The settings sheet is present before the shortcut modal mounts,
        // so the shadow is already installed when the Modal focuses its field.
        const observer = new MutationObserver(sync);
        observer.observe(document.body, { childList: true });
        sync();
        return () => {
            observer.disconnect();
            disarm();
        };
    });
}
};
__modules["effects/session-focus-guard.js"] = function (require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.installSessionFocusGuard = installSessionFocusGuard;
const sessions_compat_ts_1 = require("./core/sessions-compat.js");
const composer_keyboard_guard_ts_1 = require("./effects/composer-keyboard-guard.js");
const phone_chrome_ts_1 = require("./effects/phone-chrome.js");
/**
 * Mobile guard: entering a session must not raise the soft keyboard by itself.
 *
 * `dsh-client-ui-conversation`'s InputBar focuses the Lexical editor from a
 * passive effect keyed on `[locked, sessionId, editor]` — every session switch
 * programmatically focuses the editing surface (`focusDraftEditor`:
 * `getRootElement()?.focus(...)` plus `editor.focus(...)`). On desktop that is
 * a convenience. On a phone it costs the user half the screen the moment the
 * session opens — they typically want to READ the history first (issue #140).
 *
 * Fix strategy: on a snapshot-observed current-session change, open a short
 * guard window and shadow the editor's own `focus` property (the same
 * own-property recipe as `composer-keyboard-guard.ts`, sharing its marker) so
 * the host's session-switch autofocus lands on the no-op. A real tap is
 * unaffected: the browser focuses natively and never routes through the JS
 * method. The window is finite (see the constant) and also closes early when
 * the user taps the editing surface, so no legitimate programmatic refocus
 * (e.g. the `+` command menu, which needs the caret) is swallowed after the
 * switch has settled.
 *
 * Timing: the host focus runs in a PASSIVE effect, which React schedules after
 * commit — a MutationObserver callback is a microtask and therefore runs
 * before it (measured precedent: `shortcut-modal-keyboard-guard.ts` header).
 * Session switches remount the InputBar (the editor is Session-owned), so the
 * observer re-shadows the freshly mounted `[data-composer-input]` inside the
 * window; arming also shadows an already-present input for switches that
 * reuse the element.
 *
 * 2026-09-29 headless correction (issue #140 verification run): the shadow
 * alone is NOT sufficient. When the InputBar remounts for the new session,
 * the host's focus call runs inside the commit's synchronous layout-effect
 * phase — BEFORE any MutationObserver microtask — so the freshly mounted
 * editor got focused while it still had no shadow (focusin measured at
 * t=314ms with marker=false; the observer only shadowed it afterwards). The
 * guard therefore keeps a focusin fallback for the window's lifetime: any
 * DOM focus landing on the editing surface is blurred synchronously — the
 * same recipe `composer-keyboard-guard.ts` proved on a real device in the
 * 2026-09-23 keepFocus loop (blur at the focusin capture phase happens
 * before the IME can rise, and drafts/caret live in the host's keyboard
 * state, not in DOM focus). A real tap is unaffected: the pointerdown
 * early-close below shuts the window before the browser's native focus of
 * that tap runs.
 *
 * DOM contract (verified against 0.1.7-rc.2):
 * - `[data-composer-input]` — the Lexical contenteditable surface (count=1;
 *   present in every released host since 0.1.2-alpha.2, per
 *   docs/debug/composer-tree-recon.md).
 * - `data-mobile-nav-focus-shadow` — the shared shadow marker.
 * Re-audit when the conversation package upgrades.
 */
/** Guard window for one session switch. Long enough for a slow phone to
 *  render + run passive effects; short enough that a user tapping `+` right
 *  after the switch only rarely lands inside it. */
const FOCUS_GUARD_WINDOW_MS = 800;
/** The Lexical editing surface — the only element whose autofocus we swallow. */
const COMPOSER_INPUT_SELECTOR = '[data-composer-input]';
/**
 * Keep the session-switch autofocus from raising the soft keyboard, on the
 * mobile breakpoint only.
 * @param ctx - client root context.
 */
function installSessionFocusGuard(ctx) {
    (0, phone_chrome_ts_1.installMobileEffect)(ctx, 'dsh-web-mobile: session focus guard', () => {
        const list = ctx.sessions.list;
        // Snapshot value at install time: subscribing must not arm the window by
        // itself — only a CHANGE of the current session id does.
        let lastSessionId = (0, sessions_compat_ts_1.currentSessionIdOf)(list.getSnapshot());
        let windowTimer = 0;
        let windowOpen = false;
        const restore = () => {
            window.clearTimeout(windowTimer);
            windowTimer = 0;
            windowOpen = false;
            observer.disconnect();
            const el = document.querySelector(`[${composer_keyboard_guard_ts_1.SHADOW_MARKER}]`);
            if (el === null)
                return;
            el.removeAttribute(composer_keyboard_guard_ts_1.SHADOW_MARKER);
            const shadowed = el;
            if (Object.prototype.hasOwnProperty.call(el, 'focus'))
                delete shadowed.focus;
        };
        const shadow = (el) => {
            if (el.hasAttribute(composer_keyboard_guard_ts_1.SHADOW_MARKER))
                return;
            el.setAttribute(composer_keyboard_guard_ts_1.SHADOW_MARKER, '');
            Object.defineProperty(el, 'focus', {
                configurable: true,
                writable: true,
                value: function swallowedFocus() {
                    /* session-switch autofocus; keep the keyboard down */
                },
            });
        };
        const arm = () => {
            restore();
            windowOpen = true;
            observer.observe(document.documentElement, { childList: true, subtree: true });
            const el = document.querySelector(COMPOSER_INPUT_SELECTOR);
            if (el !== null)
                shadow(el);
            windowTimer = window.setTimeout(restore, FOCUS_GUARD_WINDOW_MS);
        };
        // Session switches remount the InputBar: catch the freshly mounted editor
        // inside the window. Microtask timing beats the host's passive effect.
        const observer = new MutationObserver(() => {
            if (!windowOpen)
                return;
            const el = document.querySelector(COMPOSER_INPUT_SELECTOR);
            if (el !== null)
                shadow(el);
        });
        // A tap on the editing surface is the user saying "I want to type": close
        // the window on the spot so the residual shadow cannot eat anything.
        const onPointerDown = (event) => {
            if (!windowOpen)
                return;
            const target = event.target;
            if (target instanceof Element && target.closest(COMPOSER_INPUT_SELECTOR) !== null)
                restore();
        };
        // Timing fallback for the window's lifetime: the host focuses the freshly
        // mounted editor from the commit's synchronous phase, before the observer
        // microtask can shadow it (headless-measured 2026-09-29, see header), so
        // any focus that still lands on the editing surface inside the window is
        // blurred on the spot — before the IME can rise. User taps never reach
        // this: their pointerdown closed the window above.
        const onFocusIn = (event) => {
            if (!windowOpen)
                return;
            const target = event.target;
            if (target instanceof HTMLElement && target.closest(COMPOSER_INPUT_SELECTOR) !== null)
                target.blur();
        };
        // Invalidation callback (zustand-style): re-read the snapshot and arm only
        // when the current session id actually changed — list churn (titles,
        // ordering, refresh) must never open the window.
        const unsubscribe = list.subscribe(() => {
            const current = (0, sessions_compat_ts_1.currentSessionIdOf)(list.getSnapshot());
            if (current === lastSessionId)
                return;
            lastSessionId = current;
            arm();
        });
        document.addEventListener('pointerdown', onPointerDown, true);
        document.addEventListener('focusin', onFocusIn, true);
        return () => {
            unsubscribe();
            observer.disconnect();
            document.removeEventListener('pointerdown', onPointerDown, true);
            document.removeEventListener('focusin', onFocusIn, true);
            restore();
        };
    });
}
};
__modules["core/raf-scheduler.js"] = function (require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRafScheduler = createRafScheduler;
function createRafScheduler(raf, caf) {
    let pending = 0;
    let queued = false;
    return {
        schedule(fn) {
            if (queued)
                return;
            queued = true;
            pending = raf(() => {
                queued = false;
                fn();
            });
        },
        cancel() {
            if (!queued)
                return;
            caf(pending);
            queued = false;
        },
    };
}
};
__modules["effects/installed-list.js"] = function (require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.installInstalledListStyles = installInstalledListStyles;
const phone_chrome_ts_1 = require("./effects/phone-chrome.js");
const raf_scheduler_ts_1 = require("./core/raf-scheduler.js");
const MARKET = '[data-dsh-market-root]';
const ROW = '[class*="irow"]:not([class*="irowActions"]):not([class*="irowTrailing"])';
/** Keep optional market overrides local and restore the inline values we replace. */
function installInstalledListStyles(ctx) {
    (0, phone_chrome_ts_1.installMobileEffect)(ctx, 'dsh-web-mobile: installed-list-inline-styles', () => {
        const originals = new Map();
        const roots = new Map();
        const scheduler = (0, raf_scheduler_ts_1.createRafScheduler)(cb => window.requestAnimationFrame(cb), id => window.cancelAnimationFrame(id));
        const set = (element, properties) => {
            let saved = originals.get(element);
            if (!saved)
                originals.set(element, saved = new Map());
            for (const [key, value] of Object.entries(properties)) {
                if (!saved.has(key))
                    saved.set(key, { value: element.style.getPropertyValue(key), priority: element.style.getPropertyPriority(key) });
                element.style.setProperty(key, value, 'important');
            }
        };
        const clear = () => {
            for (const [element, properties] of originals) {
                for (const [key, original] of properties) {
                    if (original.value)
                        element.style.setProperty(key, original.value, original.priority);
                    else
                        element.style.removeProperty(key);
                }
            }
            originals.clear();
        };
        const apply = () => {
            for (const root of roots.keys()) {
                for (const row of root.querySelectorAll(ROW)) {
                    set(row, { 'flex-wrap': 'wrap', 'align-items': 'center', gap: '4px 10px' });
                    const first = row.firstElementChild;
                    if (first instanceof HTMLElement)
                        set(first, { flex: '1 1 100%', 'max-width': '100%', 'min-width': '0' });
                    for (const text of row.querySelectorAll('[class*="spec"], [class*="nm"]')) {
                        set(text, { 'white-space': 'nowrap', overflow: 'hidden', 'text-overflow': 'ellipsis', 'max-width': '100%' });
                    }
                }
            }
        };
        const syncRoots = () => {
            const next = new Set(document.querySelectorAll(MARKET));
            if (next.size === roots.size && [...next].every(root => roots.has(root)))
                return;
            clear();
            for (const [root, observer] of roots) {
                if (!next.has(root)) {
                    observer.disconnect();
                    roots.delete(root);
                }
            }
            for (const root of next) {
                if (roots.has(root))
                    continue;
                const observer = new MutationObserver(() => scheduler.schedule(apply));
                observer.observe(root, { childList: true, subtree: true });
                roots.set(root, observer);
            }
            apply();
        };
        // Discovery examines only mounted/removed boundary nodes, not streamed text.
        const mounts = new MutationObserver(records => {
            if (records.some(record => [...record.addedNodes, ...record.removedNodes].some(node => node instanceof Element && (node.matches(MARKET) || node.querySelector(MARKET) !== null))))
                syncRoots();
        });
        mounts.observe(document.body, { childList: true, subtree: true });
        syncRoots();
        return () => {
            scheduler.cancel();
            mounts.disconnect();
            for (const observer of roots.values())
                observer.disconnect();
            roots.clear();
            clear();
        };
    });
}
};
__modules["i18n/locales.js"] = function (require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.en = exports.zh = exports.NS = void 0;
/** `mobileNav` namespace dictionaries: drawer controls. */
exports.NS = 'mobileNav';
/** Simplified Chinese dictionary (the key-set source of truth). */
exports.zh = {
    'authExpired': '登录认证已过期，连接无法恢复。请先保存或复制未发送的内容，并另行保存附件，再手动刷新页面重新登录。此提示不会自动刷新页面。',
    'open': '打开目录',
    'close': '收起目录',
    'backdrop': '点击关闭目录',
    'backToConversation': '返回会话',
    'sessionLog': '导出会话日志',
    'files': '文件浏览',
    'fileUpload': '添加文件',
    'previewFullscreen': '全屏预览',
    'previewExitFullscreen': '退出全屏',
    'deleteSession': '删除会话',
    'deleteConfirmTitle': '删除会话？',
    'deleteConfirmDesc': '将删除「{title}」的完整会话记录，此操作不可恢复。',
    'deleteConfirmYes': '删除',
    'deleteConfirmNo': '取消',
    'deletePending': '正在删除…',
    'deleteErrorBusy': '该会话正在运行且无法停止，请稍后重试。',
    'deleteErrorNotFound': '会话不存在或已被删除。',
    'deleteErrorResolve': '无法确定要删除的会话，请重试。',
    'deleteErrorGeneric': '删除失败：{message}',
};
/** English dictionary, key-identical to the Chinese source of truth. */
exports.en = {
    'authExpired': 'Your login authentication has expired and the connection cannot recover. Save or copy unsent content and save attachments separately, then manually refresh the page to sign in again. This notice will not refresh the page automatically.',
    'open': 'Open directory',
    'close': 'Close directory',
    'backdrop': 'Click to close directory',
    'backToConversation': 'Back to conversation',
    'sessionLog': 'Session log',
    'files': 'Files',
    'fileUpload': 'Add files',
    'previewFullscreen': 'Fullscreen preview',
    'previewExitFullscreen': 'Exit fullscreen',
    'deleteSession': 'Delete session',
    'deleteConfirmTitle': 'Delete session?',
    'deleteConfirmDesc': 'The complete log of “{title}” will be permanently removed. This cannot be undone.',
    'deleteConfirmYes': 'Delete',
    'deleteConfirmNo': 'Cancel',
    'deletePending': 'Deleting…',
    'deleteErrorBusy': 'This session is running and could not be stopped. Try again later.',
    'deleteErrorNotFound': 'The session does not exist or was already deleted.',
    'deleteErrorResolve': 'Could not identify the session to delete. Please try again.',
    'deleteErrorGeneric': 'Delete failed: {message}',
};
};
__modules["effects/auth-expiry-probe.js"] = function (require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuthExpired = isAuthExpired;
exports.watchAuthExpiry = watchAuthExpiry;
/** Only an unauthorized response or an explicitly identified Access redirect expires authentication. */
function isAuthExpired(response, cloudflareAccess) {
    if (response.status === 401)
        return true;
    if (response.type === 'opaqueredirect')
        return cloudflareAccess;
    if (response.status < 300 || response.status >= 400)
        return false;
    const location = response.headers.get('location');
    if (!location)
        return false;
    try {
        return /^\/cdn-cgi\/access\/login(?:\/|$)/.test(new URL(location, 'https://probe.invalid').pathname);
    }
    catch (_error) {
        // A malformed redirect does not identify an authentication challenge.
        return false;
    }
}
/**
 * Probe only failed mobile connections, with one bounded request and one notice per outage.
 * @param options - Public state, breakpoint, browser fetch and localized notification.
 * @returns Disposer cancelling timers, requests and subscriptions without stopping core retries.
 */
function watchAuthExpiry(options) {
    let disposed = false;
    let notified = false;
    let retry;
    let request;
    let deadline;
    const eligible = () => !disposed && options.mobile.matches && !notified
        && options.state.getSnapshot() !== undefined && options.state.getSnapshot() !== 'connected';
    const cancel = () => {
        clearTimeout(retry);
        retry = undefined;
        clearTimeout(deadline);
        request?.abort();
    };
    const probe = async () => {
        if (!eligible() || request)
            return;
        const controller = new AbortController();
        request = controller;
        deadline = setTimeout(() => controller.abort(), 10_000);
        let expired = false;
        try {
            const response = await options.fetch('/api', {
                method: 'GET', credentials: 'same-origin', redirect: 'manual', cache: 'no-store', signal: controller.signal,
            });
            expired = isAuthExpired(response, options.cloudflareAccess);
        }
        catch (_error) {
            // Offline, timeout and cancellation are not evidence of expired authentication.
        }
        finally {
            clearTimeout(deadline);
            deadline = undefined;
            request = undefined;
        }
        if (expired && !controller.signal.aborted && eligible()) {
            notified = true;
            options.notify();
        }
        if (eligible())
            retry = setTimeout(() => { retry = undefined; void probe(); }, 15_000);
    };
    const refresh = () => {
        if (options.state.getSnapshot() === 'connected')
            notified = false;
        if (!eligible())
            cancel();
        else if (!request && retry === undefined)
            void probe();
    };
    const unsubscribe = options.state.subscribe(refresh);
    options.mobile.addEventListener('change', refresh);
    refresh();
    return () => {
        disposed = true;
        unsubscribe();
        options.mobile.removeEventListener('change', refresh);
        cancel();
    };
}
};
__modules["effects/auth-expiry.js"] = function (require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.installAuthExpiryNotice = installAuthExpiryNotice;
const locales_ts_1 = require("./i18n/locales.js");
const phone_chrome_ts_1 = require("./effects/phone-chrome.js");
const auth_expiry_probe_ts_1 = require("./effects/auth-expiry-probe.js");
/** Install the manual refresh notice through the public connection-state source. */
function installAuthExpiryNotice(ctx) {
    ctx.inject(['connection'], child => {
        const connection = child.get('connection');
        if (!connection.state) {
            console.error('[dsh-web-mobile] Authentication notice requires public connection.state; update the Host connection plugin.');
            return;
        }
        const state = connection.state;
        child.effect(() => (0, auth_expiry_probe_ts_1.watchAuthExpiry)({
            state,
            mobile: window.matchMedia(phone_chrome_ts_1.MOBILE_QUERY),
            cloudflareAccess: document.querySelector('meta[name="dsh-mobile-cloudflare-access"]')?.getAttribute('content') === 'true',
            fetch: window.fetch.bind(window),
            notify: () => window.alert(ctx.locale.bind(locales_ts_1.NS)('authExpired')),
        }), 'dsh-web-mobile: authentication expiry notice');
    });
}
};
__modules["debug.js"] = function (require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.installDebugBadge = installDebugBadge;
const phone_chrome_ts_1 = require("./effects/phone-chrome.js");
/** Display local viewport and page diagnostics with ?mobile-nav-debug=1. */
function installDebugBadge(ctx) {
    ctx.effect(() => {
        if (!new URLSearchParams(location.search).has('mobile-nav-debug'))
            return () => { };
        const badge = document.createElement('div');
        badge.setAttribute('data-mobile-workbench', 'debug');
        badge.style.cssText = 'position:fixed;top:40px;right:6px;z-index:2147483000;background:rgba(0,0,0,.82);color:#fff;font:11px/1.5 ui-monospace,monospace;padding:8px 10px;border-radius:8px;max-width:94vw;white-space:pre-wrap;pointer-events:none';
        const errors = [];
        const paint = () => {
            const root = document.documentElement;
            const frame = document.querySelector('[data-mobile-nav="frame"]');
            const panel = document.querySelector('[data-sidebar-right-panel]');
            const viewport = window.visualViewport;
            const rectangle = panel?.getBoundingClientRect();
            badge.textContent = [
                'Mobile Workbench',
                `${innerWidth} × ${innerHeight} · DPR ${devicePixelRatio} · mobile ${matchMedia(phone_chrome_ts_1.MOBILE_QUERY).matches}`,
                `page ${root.getAttribute('data-mobile-workbench-page') ?? 'desktop'} · keyboard ${root.hasAttribute('data-mobile-workbench-keyboard')}`,
                `safe top ${frame ? getComputedStyle(frame).paddingTop : 'n/a'}`,
                `viewport ${viewport ? Math.round(viewport.width) + ' × ' + Math.round(viewport.height) + ' @ ' + Math.round(viewport.offsetTop) : 'n/a'}`,
                `workspace ${rectangle ? Math.round(rectangle.width) + ' × ' + Math.round(rectangle.height) : 'closed'}`,
                `errors ${errors.join(' | ') || 'none'}`,
            ].join('\n');
        };
        const record = (message) => {
            errors.push(message.slice(0, 120));
            if (errors.length > 5)
                errors.shift();
            paint();
        };
        const onError = (event) => record(event.message);
        const onRejection = (event) => record(String(event.reason));
        window.addEventListener('error', onError);
        window.addEventListener('unhandledrejection', onRejection);
        document.body.append(badge);
        paint();
        const timer = window.setInterval(paint, 1500);
        return () => {
            window.removeEventListener('error', onError);
            window.removeEventListener('unhandledrejection', onRejection);
            window.clearInterval(timer);
            badge.remove();
        };
    }, 'dsh-web-mobile: debug badge');
}
};
__modules["index.js"] = function (require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inject = void 0;
exports.apply = apply;
const ComposerFileButton_tsx_1 = require("./components/ComposerFileButton.js");
const index_ts_1 = require("./styles/index.js");
const index_ts_2 = require("./workbench/index.js");
const composer_ts_1 = require("./workbench/composer.js");
const ModelLabel_tsx_1 = require("./workbench/ModelLabel.js");
const phone_chrome_ts_1 = require("./effects/phone-chrome.js");
const workbench_decoration_ts_1 = require("./effects/workbench-decoration.js");
const sessions_touch_ts_1 = require("./effects/sessions-touch.js");
const composer_keyboard_guard_ts_1 = require("./effects/composer-keyboard-guard.js");
const composer_plus_toggle_ts_1 = require("./effects/composer-plus-toggle.js");
const workspace_chip_toggle_ts_1 = require("./effects/workspace-chip-toggle.js");
const team_chip_toggle_ts_1 = require("./effects/team-chip-toggle.js");
const model_menu_anchor_ts_1 = require("./effects/model-menu-anchor.js");
const shortcut_modal_keyboard_guard_ts_1 = require("./effects/shortcut-modal-keyboard-guard.js");
const session_focus_guard_ts_1 = require("./effects/session-focus-guard.js");
const installed_list_ts_1 = require("./effects/installed-list.js");
const auth_expiry_ts_1 = require("./effects/auth-expiry.js");
const debug_ts_1 = require("./debug.js");
const locales_ts_1 = require("./i18n/locales.js");
/** Required services (cordis fiber inject — the loader passes all module exports as an object plugin). */
exports.inject = ['slots', 'layout', 'locale', 'sessions', 'workspaces', 'inputTriggers'];
/**
 * Mobile workbench browser entry: native conversation enhancements and one
 * three-page navigation shell. Native business state remains host-owned.
 * @param ctx - client root context.
 */
function apply(ctx) {
    ctx.effect(() => ctx.locale.register(locales_ts_1.NS, { zh: locales_ts_1.zh, en: locales_ts_1.en }), 'dsh-web-mobile: dictionaries');
    ctx.effect(() => {
        for (const stale of document.querySelectorAll('style[data-plugin-css="dsh-web-mobile/mobile.css"]')) {
            stale.remove();
        }
        const tag = document.createElement('style');
        tag.dataset.plugin = 'dsh-web-mobile';
        tag.dataset.pluginCss = 'dsh-web-mobile/mobile.css';
        tag.textContent = index_ts_1.MOBILE_CSS;
        document.head.appendChild(tag);
        const timer = window.setTimeout(() => {
            if (tag.isConnected)
                document.head.appendChild(tag);
        }, 0);
        return () => {
            window.clearTimeout(timer);
            tag.remove();
        };
    }, 'dsh-web-mobile: styles');
    (0, installed_list_ts_1.installInstalledListStyles)(ctx);
    (0, auth_expiry_ts_1.installAuthExpiryNotice)(ctx);
    (0, workbench_decoration_ts_1.installWorkbenchDecoration)(ctx);
    (0, sessions_touch_ts_1.installSessionsTouch)(ctx);
    (0, composer_keyboard_guard_ts_1.installComposerKeyboardGuard)(ctx);
    (0, composer_plus_toggle_ts_1.installComposerPlusToggle)(ctx);
    (0, workspace_chip_toggle_ts_1.installWorkspaceChipToggle)(ctx);
    (0, team_chip_toggle_ts_1.installTeamChipToggle)(ctx);
    (0, model_menu_anchor_ts_1.installModelMenuAnchor)(ctx);
    (0, shortcut_modal_keyboard_guard_ts_1.installShortcutModalKeyboardGuard)(ctx);
    (0, session_focus_guard_ts_1.installSessionFocusGuard)(ctx);
    (0, phone_chrome_ts_1.installPhoneChrome)(ctx);
    (0, index_ts_2.installWorkbench)(ctx);
    (0, composer_ts_1.installWorkbenchComposer)(ctx);
    (0, debug_ts_1.installDebugBadge)(ctx);
    ctx.slots.inject('conversation.input.model.label', () => ctx.slots.register({
        name: 'conversation.input.model.label',
    }, ModelLabel_tsx_1.ModelLabel));
    ctx.slots.inject('conversation.input.left', () => ctx.slots.register({
        name: 'conversation.input.left',
        id: 'mobile-nav-file-upload',
        order: 10,
        locale: locales_ts_1.NS,
        inject: () => ({}),
    }, ComposerFileButton_tsx_1.ComposerFileButton));
}
};
var __cache = {};
function __localRequire(id) {
  if (id.charCodeAt(0) !== 46) return require(id);
  id = id.slice(2);
  var cached = __cache[id];
  if (cached) return cached.exports;
  var module = { exports: {} };
  __cache[id] = module;
  __modules[id](__localRequire, module, module.exports);
  return module.exports;
}
var module = { exports: {} };
__modules["index.js"](__localRequire, module, module.exports);
return module.exports; } });
