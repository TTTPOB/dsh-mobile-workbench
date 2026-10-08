/** Public connection-state subscription used without owning the core retry loop. */
export interface ConnectionStateSource {
    getSnapshot(): 'connected' | 'connecting' | 'disconnected' | undefined;
    subscribe(listener: () => void): () => void;
}
/** Only an unauthorized response or an explicitly identified Access redirect expires authentication. */
export declare function isAuthExpired(response: Response, cloudflareAccess: boolean): boolean;
interface ProbeOptions {
    state: ConnectionStateSource;
    mobile: MediaQueryList;
    cloudflareAccess: boolean;
    fetch: typeof fetch;
    notify(): void;
}
/**
 * Probe only failed mobile connections, with one bounded request and one notice per outage.
 * @param options - Public state, breakpoint, browser fetch and localized notification.
 * @returns Disposer cancelling timers, requests and subscriptions without stopping core retries.
 */
export declare function watchAuthExpiry(options: ProbeOptions): () => void;
export {};
//# sourceMappingURL=auth-expiry-probe.d.ts.map