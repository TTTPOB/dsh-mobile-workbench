import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
export { detectIosWebKit, installPhoneChrome, STABLE_VIEWPORT_VAR } from './phone-viewport.ts';
/** Mobile adaptation is restricted to touch-primary viewports below 1024px. */
export declare const MOBILE_QUERY = "(max-width: 1023px) and (pointer: coarse)";
export declare const DESKTOP_QUERY = "(min-width: 1024px)";
export declare const TOUCH_QUERY = "(pointer: coarse)";
/** Own a breakpoint-scoped effect and dispose it before rearming. */
export declare function installMobileEffect(ctx: ClientContext, label: string, install: (narrow: MediaQueryList) => (() => void) | undefined, query?: string): void;
export declare function findFrame(): HTMLElement | null;
export declare function getFrame(): HTMLElement | null;
/** Workbench pages use the host sidebar state, with no drawer animation. */
export declare function toggleDrawer(ctx: ClientContext): void;
//# sourceMappingURL=phone-chrome.d.ts.map