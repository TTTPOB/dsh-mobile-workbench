import type { Context } from '@deepseek-ai/cordis';
import type { AgentPresetRow } from '@deepseek-ai/dsh-agent-preset-registry/types';
import { type BuiltInPresetCopyKey } from '@deepseek-ai/dsh-agent-preset-registry/display';
/** Resolve published names, never present an unregistered or unnamed id as a display name. */
export declare function presetDisplayName(id: string | undefined, rows: readonly AgentPresetRow[], translate: (key: BuiltInPresetCopyKey) => string, unavailable: string): string;
/** Read the public roster per opening; no mirrored registry, private store or long-lived cache. */
export declare function createPresetDisplayResolver(ctx: Context): (id: string | undefined) => Promise<string>;
//# sourceMappingURL=preset-display.d.ts.map