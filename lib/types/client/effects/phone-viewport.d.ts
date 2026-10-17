import type { Context as ClientContext } from '@deepseek-ai/cordis';
/** iOS text fields need the stylesheet font-size floor to avoid focus zoom. */
export declare function detectIosWebKit(nav: {
    userAgent: string;
    maxTouchPoints: number;
}, supports: ((condition: string) => boolean) | null): boolean;
export declare const STABLE_VIEWPORT_VAR = "--dsh-web-mobile-vh";
/** Own viewport-fit, status-bar theme and keyboard-less modal height while mobile. */
export declare function installPhoneChrome(ctx: ClientContext): void;
//# sourceMappingURL=phone-viewport.d.ts.map