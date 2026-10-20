/** Install metadata for the mobile workbench; session and model APIs stay host-owned. */
import type { IncomingMessage, ServerResponse } from 'node:http';
import Schema from '@deepseek-ai/schemastery';
interface Route {
    kind: 'exact';
    path: string;
    handler(req: IncomingMessage, res: ServerResponse): void;
}
/** The public web route registration and effect ownership used by this plugin. */
export interface HostContext {
    effect(install: () => (() => void), label?: string): void;
    inject(services: readonly string[], apply: (scoped: HostContext & {
        webServer: {
            register(route: Route): () => void;
            tapIndex(transform: (html: string) => string): () => void;
        };
    }) => void): void;
}
export declare const name = "dsh-web-mobile";
/** Maximum page-supplied install name, in Unicode code points; the client mirrors this bound. */
export declare const INSTALL_NAME_LIMIT = 40;
/** Index meta carrying the configured manifest name to the client-side name editor. */
export declare const INSTALL_NAME_META = "dsh-mobile-install-name";
export declare const MANIFEST: {
    id: string;
    name: string;
    short_name: string;
    description: string;
    start_url: string;
    scope: string;
    display: string;
    background_color: string;
    theme_color: string;
    icons: {
        src: string;
        sizes: string;
        type: string;
        purpose: string;
    }[];
};
/** Instance installation labels and Access redirect policy, validated by the plugin loader. */
export interface Config {
    name: string;
    shortName: string;
    cloudflareAccess: boolean;
}
export declare const Config: Schema<Config>;
/**
 * Read the installer-supplied name from a manifest request URL.
 * @param url - raw request URL; a missing URL keeps the configured labels.
 * @returns the trimmed name bounded to {@link INSTALL_NAME_LIMIT} code points, or undefined.
 */
export declare function installNameFromQuery(url: string | undefined): string | undefined;
/**
 * Resolve manifest labels for one request; a page-supplied name replaces both configured labels.
 * @param name - configured full application name.
 * @param shortName - configured short name.
 * @param installName - page-supplied override.
 * @returns the manifest name and short_name pair.
 */
export declare function manifestLabels(name: string, shortName: string, installName?: string): {
    name: string;
    short_name: string;
};
/** Register installable metadata without caching dynamic APIs or patching HTTP prototypes. */
export declare function apply(ctx: HostContext, config: Config): void;
export {};
//# sourceMappingURL=index.d.ts.map