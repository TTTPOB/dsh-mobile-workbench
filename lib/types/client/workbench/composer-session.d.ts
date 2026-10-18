import type { Context } from '@deepseek-ai/cordis';
/** Borrow the current main-view generation; never retain or open a Session to inspect UI. */
export declare function composerScope(ctx: Context): Context | undefined;
/** Resolve on use, so delayed work cannot keep a disposed Session controller alive. */
export declare function composerTriggers(ctx: Context): ReturnType<Context['inputTriggers']['sessionOf']> | undefined;
//# sourceMappingURL=composer-session.d.ts.map