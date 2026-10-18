export declare const COMPOSER_NS = "mobileComposer";
export declare const zh: {
    expand: string;
    collapse: string;
    draft: string;
    done: string;
};
export type ComposerKey = keyof typeof zh;
export declare const en: Record<ComposerKey, string>;
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        mobileComposer: ComposerKey;
    }
}
//# sourceMappingURL=composer-locales.d.ts.map