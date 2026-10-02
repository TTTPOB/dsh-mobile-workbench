import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import { type NavigationEvidence, type WorkbenchDestination, type WorkbenchView } from './navigation.ts';
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
    activate: (destination: WorkbenchDestination, pointerStartedOpen?: boolean) => void;
    selectView: (view: WorkbenchView) => void;
    returnParent: () => void;
}
type Props = PropsRuntime<'shell.overlay'> & InjectFace<WorkbenchInjected> & PropsLocale<'mobileWorkbench'>;
type AgentProps = PropsRuntime<'conversation.session.header.actions'> & InjectFace<WorkbenchInjected> & PropsLocale<'mobileWorkbench'>;
/** Render page navigation without owning the native page trees. */
export declare function WorkbenchNav({ useWorkbench, activate, t }: Props): import("react").JSX.Element | null;
/** Independent descendant catalog, native view selection, and direct-parent return. */
export declare function WorkbenchAgents({ useWorkbench, activate, selectView, returnParent, t }: AgentProps): import("react").JSX.Element | null;
export {};
//# sourceMappingURL=WorkbenchNav.d.ts.map