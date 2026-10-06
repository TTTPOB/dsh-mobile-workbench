/** Native rc.2 right-workspace controls. */
export declare const HOST_FILES_OPENER = "[data-sidebar-right-expand]";
export declare const HOST_FILES_CLOSER = "[data-sidebar-right-toggle]";
interface FilesPanelDocument {
    querySelector: (selector: string) => unknown;
}
/** Delegate to the native control; absent workspace support stays unavailable. */
export declare function openFilesPanel(doc?: FilesPanelDocument): boolean;
export {};
//# sourceMappingURL=open-files-panel.d.ts.map