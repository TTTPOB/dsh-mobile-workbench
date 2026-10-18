import type { ILayout } from '@deepseek-ai/dsh-client-ui-layout/client';
/** Own one global-panel entry above any workbench page entry. */
export declare function createPanelBack(layout: Pick<ILayout, 'panelInfo' | 'selectPanel'>): {
    update: () => void;
    dispose: () => void;
};
//# sourceMappingURL=panel-back.d.ts.map