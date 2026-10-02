/** Install metadata for the mobile workbench; session and model APIs stay host-owned. */
import type { IncomingMessage, ServerResponse } from 'node:http';
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
/** Register installable metadata without caching dynamic APIs or patching HTTP prototypes. */
export declare function apply(ctx: HostContext): void;
export {};
//# sourceMappingURL=index.d.ts.map