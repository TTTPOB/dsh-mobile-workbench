import type { Page } from '@playwright/test'

/** Read or replace one isolated Host settings section through its public Remote API. */
export async function settingsSection(page: Page, ns: string, replacement?: Record<string, unknown>): Promise<Record<string, unknown>> {
  return page.evaluate(async ({ ns, replacement }) => {
    const method = replacement === undefined ? 'describe' : 'replace'
    const args = replacement === undefined ? {} : { ns, section: replacement }
    const rpcId = crypto.randomUUID()
    const response = await fetch('api/settings/' + method, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ type: 'client-request', rpcId, method: 'settings/' + method, payload: { args } }),
    })
    const body = await response.json()
    if (!response.ok || body.rpcId !== rpcId || !body.result.ok) throw new Error('Settings RPC failed: ' + JSON.stringify(body))
    return replacement === undefined
      ? body.result.value.namespaces.find((entry: { ns: string }) => entry.ns === ns).value
      : body.result.value.value
  }, { ns, replacement })
}
