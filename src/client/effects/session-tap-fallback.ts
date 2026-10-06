/** One missing-click recovery per tap; native clicks always cancel it. */
export function createTapFallback(
  later: (run: () => void) => () => void,
): { arm: (activate: () => void) => void; cancel: () => void } {
  let stop: (() => void) | undefined
  const cancel = (): void => { stop?.(); stop = undefined }
  return {
    cancel,
    arm: activate => {
      cancel()
      stop = later(() => { stop = undefined; activate() })
    },
  }
}

/** Per-axis slop distinguishes a row tap from scrolling. */
export function isTapWithinSlop(from: { x: number; y: number }, to: { x: number; y: number }, slopPx: number): boolean {
  return Math.abs(to.x - from.x) <= slopPx && Math.abs(to.y - from.y) <= slopPx
}
