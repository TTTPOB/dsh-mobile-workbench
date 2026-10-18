import type { Context as ClientContext } from '@deepseek-ai/cordis';
import type { SessionListState } from '@deepseek-ai/dsh-api-session-controller/client';
/** Read the selection at activation time, including a selected child session. */
export declare function copyCurrentSessionId(snapshot: unknown, clipboard: Pick<Clipboard, 'writeText'> | undefined): Promise<boolean>;
/** Read immutable preset metadata from the selected public summary. */
export declare function currentSessionPreset(snapshot: SessionListState): string;
/** Extend only the official, in-place Session Header menu; keep its native rows intact. */
export declare function installWorkbenchSessionMenu(ctx: ClientContext): void;
//# sourceMappingURL=session-menu.d.ts.map