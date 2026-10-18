// Visual viewport shrink, not focus, is keyboard evidence.
export function composerKeyboardOpen(baseline: number, height: number, scale: number): boolean {
  return composerNavigationRelease(baseline, height, scale) > 0
}

export function composerNavigationRelease(baseline: number, height: number, scale: number): number {
  if (Math.abs(scale - 1) >= 0.05) return 0
  return Math.max(0, baseline - height - Math.max(120, baseline * 0.18))
}

export function composerEndpointReturn(previousHeight: number, height: number, baseline: number, scale: number): boolean {
  return Math.abs(scale - 1) < 0.05 && height - previousHeight > Math.max(120, baseline * 0.18)
}

export function composerHeightBudget(available: number, chrome: number): { input: number; card: number; context: number } {
  const context = Math.min(150, Math.max(48, available - chrome - 44))
  const card = Math.max(80, available - context)
  return { input: Math.max(44, Math.min(160, available * 0.3, card - chrome)), card, context }
}
