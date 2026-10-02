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
    openInfo: (pointerStartedOpen?: boolean) => void;
}
type Props = PropsRuntime<'shell.overlay'> & InjectFace<WorkbenchInjected> & PropsLocale<'mobileWorkbench'>;
type AgentProps = PropsRuntime<'conversation.session.header.actions'> & InjectFace<WorkbenchInjected> & PropsLocale<'mobileWorkbench'>;
/** Render page navigation without owning the native page trees. */
export declare function WorkbenchNav({ useWorkbench, activate, t }: Props): import("react").JSX.Element | null;
/** One context-row entry opens the same session information as the title. */
export declare function WorkbenchAgents({ useWorkbench, openInfo, t }: AgentProps): import("react").JSX.Element | null;
export {};
//# sourceMappingURL=WorkbenchNav.d.ts.map