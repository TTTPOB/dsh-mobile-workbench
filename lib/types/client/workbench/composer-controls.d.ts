import type { Context } from '@deepseek-ai/cordis';
export interface ComposerControls {
    button: HTMLButtonElement;
    header: HTMLElement;
    heading: HTMLElement;
    done: HTMLButtonElement;
    update(value: boolean): void;
    dispose(): void;
}
/** Only the plugin-owned controls are mounted or moved; the editor remains native. */
export declare function createComposerControls(ctx: Context, toggle: (keyboard: boolean) => void): ComposerControls;
//# sourceMappingURL=composer-controls.d.ts.map