/* Native modal and menu layout; host portal layers remain authoritative. */
const SETTINGS = '[role="dialog"][aria-modal="true"][data-shortcut-modal="settings"]'

export const BASE_CSS = `@media (max-width: 1023px) and (pointer: coarse) {
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
    border-radius: 14px !important;
    animation: dsh-web-mobile-sheet-in .22s var(--ds-ease-out, ease-in-out);
  }
  ${SETTINGS} > :first-child {
    width: 100%;
    flex-direction: row !important;
    align-items: center;
    gap: 6px;
    padding: 10px 12px 8px;
  }
  ${SETTINGS} > :first-child > :first-child { display: none !important; }
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
  ${SETTINGS} > :last-child { flex: 1 1 auto; min-height: 0; }
  ${SETTINGS} > :last-child > [class*="_header"]:not([class*="_headerActions"]) {
    position: absolute;
    top: 10px;
    right: 12px;
    z-index: 10;
    padding: 0;
    height: 44px;
    min-height: 44px;
  }
  ${SETTINGS} > :last-child > [class*="_header"] > :last-child {
    width: 44px;
    height: 44px;
    display: inline-flex !important;
    align-items: center;
    justify-content: center;
  }
  ${SETTINGS} > :last-child > [class*="_header"] [class*="_actions"] { display: none !important; }
  ${SETTINGS} > :last-child > :last-child { padding: 0 12px 24px; }
  [aria-modal="true"] [class*="_tabs"],
  [role="dialog"][aria-modal="true"] [class*="_footer"] { flex-wrap: wrap !important; }
  [aria-modal="true"] [class*="_searchInline"] {
    flex: 1 1 100% !important;
    width: 100% !important;
    max-width: 100% !important;
  }
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
    border-radius: 14px !important;
    animation: none !important;
  }
  :has(> [aria-modal="true"][data-shortcut-modal="shortcuts"]) > [class*="_mask"]::after {
    animation: none !important;
    background: transparent !important;
  }
  @media (max-width: 767px) {
    [aria-modal="true"][data-shortcut-modal="shortcuts"] [class*="_searchRow"] { display: none !important; }
  }
  @keyframes dsh-web-mobile-sheet-in {
    from { transform: translateY(14px) scale(.98); }
    to { transform: none; }
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
`
