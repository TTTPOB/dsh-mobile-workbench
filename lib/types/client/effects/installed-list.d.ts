import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
/**
 * Hard-fix the installed-plugins list text layout: the host market UI
 * injects its own CSS after this plugin's stylesheet, so CSS overrides can
 * be beaten. Inline !important styles win over every external rule. Keep
 * the selector on outer rows only; irowActions/irowTrailing are nested
 * flex containers and must retain the market's own action geometry.
 */
export declare function installInstalledListStyles(ctx: ClientContext): void;
//# sourceMappingURL=installed-list.d.ts.map