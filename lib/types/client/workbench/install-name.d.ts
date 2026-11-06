/**
 * Install-name editor state: a per-origin saved name rewrites the manifest link
 * and the Apple title before installation. The host manifest handler reads the
 * same name from the link query, so this module owns only page-side metadata.
 */
/** Per-origin storage key for the installer-supplied name. */
export declare const INSTALL_NAME_STORAGE_KEY = "dsh-web-mobile.install-name";
/** Maximum install name length, in Unicode code points; the host handler mirrors this bound. */
export declare const INSTALL_NAME_LIMIT = 40;
/** Management-menu entry id handled by the workbench instead of a panel. */
export declare const INSTALL_NAME_ENTRY_ID = "install-name";
/** Minimal attribute surface shared by the manifest link and Apple title meta. */
export interface InstallNameAttribute {
    getAttribute(name: string): string | null;
    setAttribute(name: string, value: string): void;
}
/** Document surface this module queries; DOM and test doubles both satisfy it. */
export interface InstallNameDocument {
    querySelector(selector: string): InstallNameAttribute | null;
}
/** Storage surface this module uses; an unavailable Storage disables persistence only. */
export interface InstallNameStorage {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
}
/** Render snapshot for the install-name modal. */
export interface InstallNameSnapshot {
    open: boolean;
    value: string;
}
/** Observable source for the slot renderer's selector hook. */
export interface InstallNameSource {
    getSnapshot(): InstallNameSnapshot;
    subscribe(listener: () => void): () => void;
}
/** Page metadata and modal state owned by the mobile workbench. */
export interface InstallNameController extends InstallNameSource {
    install(): void;
    dispose(): void;
    open(): void;
    close(): void;
    save(value: string): void;
    restore(): void;
}
/**
 * Trim and bound one user-supplied name.
 * @param value - raw input, possibly padded or empty.
 * @returns the trimmed name at most {@link INSTALL_NAME_LIMIT} code points long.
 */
export declare function normalizeInstallName(value: string): string;
/**
 * Manifest href carrying the install name.
 * @param href - original manifest link href, possibly already carrying a name parameter.
 * @param name - installer-supplied name; empty removes the parameter.
 * @returns the same href with only the name query updated.
 */
export declare function manifestHrefWithName(href: string, name: string): string;
/**
 * Create the install-name owner.
 * @param doc - document carrying the manifest link and Apple title meta.
 * @param storage - optional per-origin storage; unavailable storage keeps this visit only.
 * @returns controller applying the saved name and serving the modal snapshot.
 */
export declare function createInstallNameController(doc: InstallNameDocument, storage: InstallNameStorage | undefined): InstallNameController;
//# sourceMappingURL=install-name.d.ts.map