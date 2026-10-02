/** A mobile-only recovery action; native failure details and modal dialogs take precedence. */
export const WORKBENCH_UPDATE_NOTICE_CSS = `
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
`
