interface CatalogSource {
    getSnapshot: () => unknown;
    subscribe: (listener: () => void) => () => void;
}
/** Fill reachable projection baselines with at most two concurrent owner reads, without opening history. */
export declare function installAgentCatalogLoader(source: CatalogSource, refresh: (id: string) => Promise<void>, enabled: () => boolean): {
    update: () => void;
    dispose: () => void;
};
export {};
//# sourceMappingURL=agent-catalog-loader.d.ts.map