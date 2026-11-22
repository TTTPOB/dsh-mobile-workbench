export declare const HOST_AGENT_TRIGGER = ":is([data-slot=\"conversation.session.header.actions\"], [data-slot=\"conversation.session.header.lineage\"]) [data-subagent-action] button[aria-haspopup=\"dialog\"]:has([data-subagent-count])";
export declare const HOST_AGENT_COUNT_ACTION = ":is([data-slot=\"conversation.session.header.actions\"], [data-slot=\"conversation.session.header.lineage\"]) [data-subagent-action]:has([data-subagent-count])";
export declare const HOST_AGENT_PANEL = "[role=\"dialog\"][data-subagent-panel]";
export declare const HOST_JOB_TRIGGER = "button:has(> [data-job-count])";
export declare const PRESENTATION_LOCAL = "header:has([data-conversation-tabs]), [data-subagent-panel]";
export declare const PRESENTATION_BOUNDARY = "header:has([data-conversation-tabs]), [data-trajectory-scroll], tr[data-selected=\"true\"][data-trajectory-row-key], aside[class*=\"_details\"], [data-subagent-panel]";
export declare const NAVIGATION_BOUNDARY = "header:has([data-conversation-tabs]), [data-sidebar-right-panel], [data-sidebar-right-toggle], [data-mobile-workbench=\"navigation\"]";
export declare const COMPOSER_BOUNDARY = "[data-composer-card], [data-composer-seat], [data-chain-overlay-fallback=\"conversation.composer\"], [aria-modal=\"true\"]";
/** Recognize local changes and boundary mounts/removals without reading message text. */
export declare function boundaryMutation(record: MutationRecord, selector: string, localSelector?: string): boolean;
//# sourceMappingURL=dom-observation.d.ts.map