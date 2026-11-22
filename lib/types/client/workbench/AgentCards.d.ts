import { type ReactElement } from 'react';
import type { SessionListState } from '@deepseek-ai/dsh-api-session-controller/client';
import type { SessionId } from '@deepseek-ai/dsh-session/types';
type Entries = NonNullable<NonNullable<SessionListState['projectionsBySession'][SessionId]>['values']['subagentCatalog']>;
export type OpenAgentCard = (address: {
    parentSessionId: SessionId;
    childSessionId: SessionId;
    mode: Exclude<Entries[number]['mode'], 'external'>;
}) => void;
export type AgentCardLabel = (key: 'branch.expand' | 'branch.collapse' | 'activity.running' | 'activity.completed' | 'activity.inactive', params?: {
    label: string;
}) => string;
export declare function AgentCards({ list, root, open, t }: {
    list: SessionListState;
    root: SessionId;
    open: OpenAgentCard;
    t: AgentCardLabel;
}): ReactElement | null;
export {};
//# sourceMappingURL=AgentCards.d.ts.map