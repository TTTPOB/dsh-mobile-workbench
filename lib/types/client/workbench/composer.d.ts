import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
export declare function composerKeyboardOpen(baseline: number, height: number, scale: number): boolean;
export declare function composerHeightBudget(available: number, chrome: number): {
    input: number;
    card: number;
    context: number;
};
/** Decorate the official Lexical card in place; never own draft or submit state. */
export declare function installWorkbenchComposer(ctx: ClientContext): void;
//# sourceMappingURL=composer.d.ts.map