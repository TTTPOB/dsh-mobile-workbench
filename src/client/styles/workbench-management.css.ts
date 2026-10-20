/** Management geometry is restricted to touch-primary viewports; native owners stay mounted. */
export const WORKBENCH_MANAGEMENT_CSS = `@media (max-width: 1023px) and (pointer: coarse) {
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
  .mobile-workbench-install-name [data-install-name-hint] { margin: 8px 0 0; font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-secondary); }
  .mobile-workbench-install-name [class*="_footer"] button { min-height: 44px; }
}`
