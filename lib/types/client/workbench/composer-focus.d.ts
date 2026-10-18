export interface ComposerFocus {
    start(keyboard: boolean): void;
    stop(): void;
}
/** A focus scope for the existing expanded card and its native menu portals. */
export declare function createComposerFocus(card: HTMLElement, heading: HTMLElement, done: HTMLButtonElement): ComposerFocus;
//# sourceMappingURL=composer-focus.d.ts.map