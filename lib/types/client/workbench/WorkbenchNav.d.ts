import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import { type NavigationEvidence, type WorkbenchDestination } from './navigation.ts';
export interface WorkbenchSnapshot extends NavigationEvidence {
    mobile: boolean;
}
export interface WorkbenchInjected {
    hooks: {
        workbench: {
            getSnapshot: () => WorkbenchSnapshot;
            subscribe: (listener: () => void) => () => void;
        };
    };
    activate: (destination: WorkbenchDestination) => void;
}
type Props = PropsRuntime<'shell.overlay'> & InjectFace<WorkbenchInjected> & PropsLocale<'mobileWorkbench'>;
/** Render only plugin-owned navigation; host content and lineage remain untouched. */
export declare function WorkbenchNav({ useWorkbench, activate, t }: Props): import("react").JSX.Element | null;
export {};
//# sourceMappingURL=WorkbenchNav.d.ts.map