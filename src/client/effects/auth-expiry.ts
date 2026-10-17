import type { Context as ClientContext } from '@deepseek-ai/cordis'
import { NS } from '../i18n/locales.ts'
import { MOBILE_QUERY } from './phone-chrome.ts'
import { watchAuthExpiry, type ConnectionStateSource } from './auth-expiry-probe.ts'

/** Install the manual refresh notice through the public connection-state source. */
export function installAuthExpiryNotice(ctx: ClientContext): void {
  ctx.inject(['connection'], child => {
    const connection = child.get('connection') as { state?: ConnectionStateSource }
    if (!connection.state) {
      console.error('[dsh-web-mobile] Authentication notice requires public connection.state; update the Host connection plugin.')
      return
    }
    const state = connection.state
    child.effect(() => watchAuthExpiry({
      state,
      mobile: window.matchMedia(MOBILE_QUERY),
      cloudflareAccess: document.querySelector('meta[name="dsh-mobile-cloudflare-access"]')?.getAttribute('content') === 'true',
      fetch: window.fetch.bind(window),
      notify: () => window.alert(ctx.locale.bind(NS)('authExpired')),
    }), 'dsh-web-mobile: authentication expiry notice')
  })
}
