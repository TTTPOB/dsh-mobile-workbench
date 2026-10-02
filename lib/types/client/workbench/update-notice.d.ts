import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
declare const zh: {
    failed: string;
    reload: string;
    dismiss: string;
};
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        mobileWorkbenchRecovery: keyof typeof zh;
    }
}
/** Add a manual recovery action without changing the native module replacement controller. */
export declare function installWorkbenchUpdateNotice(ctx: ClientContext): void;
export {};
//# sourceMappingURL=update-notice.d.ts.map