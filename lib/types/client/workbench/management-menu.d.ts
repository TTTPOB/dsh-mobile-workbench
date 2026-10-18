import type { Context } from '@deepseek-ai/cordis';
import type { MainPanelId } from '@deepseek-ai/dsh-client-ui-layout/client';
/** Public panel registrations supply menu labels; account rows remain native. */
export declare function managementEntries(ctx: Context): {
    id: MainPanelId;
    label: string;
}[];
/** Append only owned rows to this account menu; never clone native nodes or account state. */
export declare function decorateManagementMenu(menu: HTMLElement, entries: readonly {
    id: string;
    label: string;
}[], activate: (id: string) => void): () => void;
//# sourceMappingURL=management-menu.d.ts.map