import { readFileSync } from 'node:fs';
export const name = 'dsh-web-mobile';
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
/** Register installable metadata without caching dynamic APIs or patching HTTP prototypes. */
export function apply(ctx) {
    ctx.inject(['webServer'], web => {
        const assets = [
            { path: '/manifest.webmanifest', type: 'application/manifest+json', body: Buffer.from(JSON.stringify(MANIFEST)) },
            ...[192, 512].map(size => ({
                path: `/mobile-workbench/icon-${size}.png`,
                type: 'image/png',
                body: readFileSync(new URL(`../assets/workbench-${size}.png`, import.meta.url)),
            })),
        ];
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