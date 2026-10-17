import type { Context as ClientContext } from '@deepseek-ai/cordis';
import type { MobileNavKey } from './i18n/locales.ts';
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        /** Directory-drawer controls copy. */
        'mobileNav': MobileNavKey;
    }
}
/** Required services (cordis fiber inject — the loader passes all module exports as an object plugin). */
export declare const inject: string[];
/**
 * Mobile workbench browser entry: native conversation enhancements and one
 * three-page navigation shell. Native business state remains host-owned.
 * @param ctx - client root context.
 */
export declare function apply(ctx: ClientContext): void;
//# sourceMappingURL=index.d.ts.map