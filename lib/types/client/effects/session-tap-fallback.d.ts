/** One missing-click recovery per tap; native clicks always cancel it. */
export declare function createTapFallback(later: (run: () => void) => () => void): {
    arm: (activate: () => void) => void;
    cancel: () => void;
};
/** Per-axis slop distinguishes a row tap from scrolling. */
export declare function isTapWithinSlop(from: {
    x: number;
    y: number;
}, to: {
    x: number;
    y: number;
}, slopPx: number): boolean;
//# sourceMappingURL=session-tap-fallback.d.ts.map