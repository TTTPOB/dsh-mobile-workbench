/** Install metadata for the mobile workbench; session and model APIs stay host-owned. */
import type { IncomingMessage, ServerResponse } from 'node:http'
import { readFileSync } from 'node:fs'

interface Route {
  kind: 'exact'
  path: string
  handler(req: IncomingMessage, res: ServerResponse): void
}

/** The public web route registration and effect ownership used by this plugin. */
export interface HostContext {
  effect(install: () => (() => void), label?: string): void
  inject(services: readonly string[], apply: (scoped: HostContext & {
    webServer: {
      register(route: Route): () => void
      tapIndex(transform: (html: string) => string): () => void
    }
  }) => void): void
}

export const name = 'dsh-web-mobile'

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
}

/** Register installable metadata without caching dynamic APIs or patching HTTP prototypes. */
export function apply(ctx: HostContext): void {
  ctx.inject(['webServer'], web => {
    const assets = [
      { path: '/manifest.webmanifest', type: 'application/manifest+json', body: Buffer.from(JSON.stringify(MANIFEST)) },
      ...[192, 512].map(size => ({
        path: `/mobile-workbench/icon-${size}.png`,
        type: 'image/png',
        body: readFileSync(new URL(`../assets/workbench-${size}.png`, import.meta.url)),
      })),
    ]
    // Relay authentication also protects the same-origin manifest fetch.
    web.effect(() => web.webServer.tapIndex(html => html.replace(/<link\b[^>]*>/gi, link => {
      if (!/\srel\s*=\s*(?:"manifest"|'manifest'|manifest(?=\s|\/?>))/i.test(link)) return link
      const crossorigin = /\scrossorigin(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?/i
      return crossorigin.test(link)
        ? link.replace(crossorigin, ' crossorigin="use-credentials"')
        : link.replace(/\/?>$/, ' crossorigin="use-credentials"$&')
    })), 'mobile-workbench: manifest credentials')
    for (const asset of assets) {
      web.effect(() => web.webServer.register({
        kind: 'exact',
        path: asset.path,
        handler(req, res) {
          if (req.method !== 'GET' && req.method !== 'HEAD') {
            res.writeHead(405, { Allow: 'GET, HEAD' })
            res.end()
            return
          }
          res.writeHead(200, { 'Content-Type': asset.type, 'Cache-Control': 'no-cache' })
          res.end(req.method === 'HEAD' ? undefined : asset.body)
        },
      }), `mobile-workbench: ${asset.path}`)
    }
  })
}
