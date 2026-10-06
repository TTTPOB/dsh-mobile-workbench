export declare const PRESENTATION_LOCAL = "header:has([data-conversation-tabs]), [data-composer-stats], [role=\"tree\"][class*=\"_menuBody\"]";
export declare const PRESENTATION_BOUNDARY = "header:has([data-conversation-tabs]), [data-composer-stats], [data-trajectory-scroll], tr[data-selected=\"true\"][data-trajectory-row-key], aside[class*=\"_details\"], [role=\"tree\"][class*=\"_menuBody\"]";
export declare const NAVIGATION_BOUNDARY = "header:has([data-conversation-tabs]), [data-sidebar-right-panel], [data-sidebar-right-toggle], [data-mobile-workbench=\"navigation\"]";
export declare const COMPOSER_BOUNDARY = "[data-composer-card], [data-composer-seat], [data-chain-overlay-fallback=\"conversation.composer\"], [aria-modal=\"true\"]";
/** Recognize local changes and boundary mounts/removals without reading message text. */
export declare function boundaryMutation(record: MutationRecord, selector: string, localSelector?: string): boolean;
//# sourceMappingURL=dom-observation.d.ts.map