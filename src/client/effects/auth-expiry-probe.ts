/** Public connection-state subscription used without owning the core retry loop. */
export interface ConnectionStateSource {
  getSnapshot(): 'connected' | 'connecting' | 'disconnected' | undefined
  subscribe(listener: () => void): () => void
}

/** Only an unauthorized response or an explicitly identified Access redirect expires authentication. */
export function isAuthExpired(response: Response, cloudflareAccess: boolean): boolean {
  if (response.status === 401) return true
  if (response.type === 'opaqueredirect') return cloudflareAccess
  if (response.status < 300 || response.status >= 400) return false
  const location = response.headers.get('location')
  if (!location) return false
  try {
    return /^\/cdn-cgi\/access\/login(?:\/|$)/.test(new URL(location, 'https://probe.invalid').pathname)
  } catch (_error) {
    // A malformed redirect does not identify an authentication challenge.
    return false
  }
}

interface ProbeOptions {
  state: ConnectionStateSource
  mobile: MediaQueryList
  cloudflareAccess: boolean
  fetch: typeof fetch
  notify(): void
}

/**
 * Probe only failed mobile connections, with one bounded request and one notice per outage.
 * @param options - Public state, breakpoint, browser fetch and localized notification.
 * @returns Disposer cancelling timers, requests and subscriptions without stopping core retries.
 */
export function watchAuthExpiry(options: ProbeOptions): () => void {
  let disposed = false
  let notified = false
  let retry: ReturnType<typeof setTimeout> | undefined
  let request: AbortController | undefined
  let deadline: ReturnType<typeof setTimeout> | undefined
  const eligible = (): boolean => !disposed && options.mobile.matches && !notified
    && options.state.getSnapshot() !== undefined && options.state.getSnapshot() !== 'connected'
  const cancel = (): void => {
    clearTimeout(retry)
    retry = undefined
    clearTimeout(deadline)
    request?.abort()
  }
  const probe = async (): Promise<void> => {
    if (!eligible() || request) return
    const controller = new AbortController()
    request = controller
    deadline = setTimeout(() => controller.abort(), 10_000)
    let expired = false
    try {
      const response = await options.fetch('/api', {
        method: 'GET', credentials: 'same-origin', redirect: 'manual', cache: 'no-store', signal: controller.signal,
      })
      expired = isAuthExpired(response, options.cloudflareAccess)
    } catch (_error) {
      // Offline, timeout and cancellation are not evidence of expired authentication.
    } finally {
      clearTimeout(deadline)
      deadline = undefined
      request = undefined
    }
    if (expired && !controller.signal.aborted && eligible()) {
      notified = true
      options.notify()
    }
    if (eligible()) retry = setTimeout(() => { retry = undefined; void probe() }, 15_000)
  }
  const refresh = (): void => {
    if (options.state.getSnapshot() === 'connected') notified = false
    if (!eligible()) cancel()
    else if (!request && retry === undefined) void probe()
  }
  const unsubscribe = options.state.subscribe(refresh)
  options.mobile.addEventListener('change', refresh)
  refresh()
  return () => {
    disposed = true
    unsubscribe()
    options.mobile.removeEventListener('change', refresh)
    cancel()
  }
}
