import { readFileSync } from 'node:fs';
import Schema from '@deepseek-ai/schemastery';
export const name = 'dsh-web-mobile';
/** Maximum page-supplied install name, in Unicode code points; the client mirrors this bound. */
export const INSTALL_NAME_LIMIT = 40;
/** Index meta carrying the configured manifest name to the client-side name editor. */
export const INSTALL_NAME_META = 'dsh-mobile-install-name';
export const MANIFEST = {
    id: '/',
    name: 'DSH Mobile Workbench',
    short_name: 'DSH Workbench',
    description: 'Mobile coding workspace with native DSH trajectory and subagents',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#14161b',
    theme_color: '#14161b',
    icons: [192, 512].map(size => ({
        src: `/mobile-workbench/icon-${size}.png`,
        sizes: `${size}x${size}`,
        type: 'image/png',
        purpose: 'any maskable',
    })),
};
export const Config = Schema.object({
    name: Schema.string().pattern(/\S/).default(MANIFEST.name),
    shortName: Schema.string().pattern(/\S/).default(MANIFEST.short_name),
    cloudflareAccess: Schema.boolean().default(true),
});
/**
 * Read the installer-supplied name from a manifest request URL.
 * @param url - raw request URL; a missing URL keeps the configured labels.
 * @returns the trimmed name bounded to {@link INSTALL_NAME_LIMIT} code points, or undefined.
 */
export function installNameFromQuery(url) {
    if (url === undefined)
        return undefined;
    const value = new URL(url, 'http://localhost').searchParams.get('name')?.trim() ?? '';
    if (value === '')
        return undefined;
    return Array.from(value).slice(0, INSTALL_NAME_LIMIT).join('');
}
/**
 * Resolve manifest labels for one request; a page-supplied name replaces both configured labels.
 * @param name - configured full application name.
 * @param shortName - configured short name.
 * @param installName - page-supplied override.
 * @returns the manifest name and short_name pair.
 */
export function manifestLabels(name, shortName, installName) {
    return installName === undefined ? { name, short_name: shortName } : { name: installName, short_name: installName };
}
function escapeAttribute(value) {
    return value.replace(/[&"<>]/g, character => ({ '&': '&amp;', '"': '&quot;', '<': '&lt;', '>': '&gt;' })[character]);
}
/** Register installable metadata without caching dynamic APIs or patching HTTP prototypes. */
export function apply(ctx, config) {
    ctx.inject(['webServer'], web => {
        const assets = [
            { path: '/mobile-workbench/icon.svg', type: 'image/svg+xml', body: readFileSync(new URL('../assets/workbench.svg', import.meta.url)) },
            ...[180, 192, 512].map(size => ({
                path: `/mobile-workbench/icon-${size}.png`,
                type: 'image/png',
                body: readFileSync(new URL(`../assets/workbench-${size}.png`, import.meta.url)),
            })),
        ];
        // Relay authentication also protects the same-origin manifest fetch.
        web.effect(() => web.webServer.tapIndex(html => {
            const index = html.replace(/<link\b[^>]*>/gi, link => {
                if (!/\srel\s*=\s*(?:"manifest"|'manifest'|manifest(?=\s|\/?>))/i.test(link))
                    return link;
                const crossorigin = /\scrossorigin(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?/i;
                return crossorigin.test(link)
                    ? link.replace(crossorigin, ' crossorigin="use-credentials"')
                    : link.replace(/\/?>$/, ' crossorigin="use-credentials"$&');
            });
            // Apple home-screen metadata uses a dedicated opaque 180px icon.
            return index
                .replace(/<link\b[^>]*\srel\s*=\s*["']apple-touch-icon["'][^>]*>/gi, '')
                .replace(/<meta\b[^>]*\sname\s*=\s*["']apple-mobile-web-app-title["'][^>]*>/gi, '')
                .replace(/<meta\b[^>]*\sname\s*=\s*["']dsh-mobile-cloudflare-access["'][^>]*>/gi, '')
                .replace(/<meta\b[^>]*\sname\s*=\s*["']dsh-mobile-install-name["'][^>]*>/gi, '')
                .replace(/<\/head>/i, '<link rel="apple-touch-icon" sizes="180x180" href="/mobile-workbench/icon-180.png" />'
                + '<meta name="apple-mobile-web-app-title" content="' + escapeAttribute(config.shortName) + '" />'
                + '<meta name="' + INSTALL_NAME_META + '" content="' + escapeAttribute(config.name) + '" />'
                + '<meta name="dsh-mobile-cloudflare-access" content="' + config.cloudflareAccess + '" /></head>');
        }), 'mobile-workbench: install metadata');
        // The page-supplied name rides the query: Chrome/Android read it on the next install.
        web.effect(() => web.webServer.register({
            kind: 'exact',
            path: '/manifest.webmanifest',
            handler(req, res) {
                if (req.method !== 'GET' && req.method !== 'HEAD') {
                    res.writeHead(405, { Allow: 'GET, HEAD' });
                    res.end();
                    return;
                }
                const labels = manifestLabels(config.name, config.shortName, installNameFromQuery(req.url));
                res.writeHead(200, { 'Content-Type': 'application/manifest+json', 'Cache-Control': 'no-cache' });
                res.end(req.method === 'HEAD' ? undefined : Buffer.from(JSON.stringify({ ...MANIFEST, ...labels })));
            },
        }), 'mobile-workbench: /manifest.webmanifest');
        for (const asset of assets) {
            web.effect(() => web.webServer.register({
                kind: 'exact',
                path: asset.path,
                handler(req, res) {
                    if (req.method !== 'GET' && req.method !== 'HEAD') {
                        res.writeHead(405, { Allow: 'GET, HEAD' });
                        res.end();
                        return;
                    }
                    res.writeHead(200, { 'Content-Type': asset.type, 'Cache-Control': 'no-cache' });
                    res.end(req.method === 'HEAD' ? undefined : asset.body);
                },
            }), `mobile-workbench: ${asset.path}`);
        }
    });
}
//# sourceMappingURL=index.js.map