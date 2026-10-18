import { type ReactElement } from 'react';
import type { StatsTranslate } from './stats-locales.ts';
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import { type NavigationEvidence, type WorkbenchDestination, type WorkbenchView } from './navigation.ts';
export interface WorkbenchSnapshot extends NavigationEvidence {
    mobile: boolean;
}
export interface WorkbenchInjected {
    tStats: StatsTranslate;
    hooks: {
        workbench: {
            getSnapshot: () => WorkbenchSnapshot;
            subscribe: (listener: () => void) => () => void;
        };
    };
    activate: (destination: WorkbenchDestination, pointerStartedOpen?: boolean) => void;
    selectView: (view: WorkbenchView) => void;
    returnParent: () => void;
    closeAgents: (restoreFocus?: boolean) => void;
    focusAgents: () => void;
}
type Props = PropsRuntime<'shell.overlay'> & InjectFace<WorkbenchInjected> & PropsLocale<'mobileWorkbench'>;
type AgentProps = PropsRuntime<'conversation.session.header.actions'> & InjectFace<WorkbenchInjected> & PropsLocale<'mobileWorkbench'>;
/** Render page navigation without owning the native page trees. */
export declare function WorkbenchNav({ useWorkbench, activate, t }: Props): ReactElement | null;
/** Header content uses public session summaries and session-bound projections. */
export declare function WorkbenchAgents({ useWorkbench, useSessions, useProjection, sessionId, activate, selectView, returnParent, closeAgents, focusAgents, t, tStats }: AgentProps): ReactElement | null;
export {};
//# sourceMappingURL=WorkbenchNav.d.ts.map