import type { Context as ClientContext } from '@deepseek-ai/cordis';
/** Read the selection at activation time, including a selected child session. */
export declare function copyCurrentSessionId(snapshot: unknown, clipboard: Pick<Clipboard, 'writeText'> | undefined): Promise<boolean>;
/** Extend only the official, in-place Session Header menu; keep its native rows intact. */
export declare function installWorkbenchSessionMenu(ctx: ClientContext): void;
//# sourceMappingURL=session-menu.d.ts.map