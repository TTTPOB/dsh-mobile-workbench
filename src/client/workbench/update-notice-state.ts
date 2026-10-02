/** Public ClientEntries synchronization fields used by the recovery notice. */
export interface ClientSyncSnapshot {
  readonly syncing: boolean
  readonly failures: readonly { readonly id: string; readonly message: string }[]
}

/** Ignore initial boot failures and keep dismissal until the next healthy settlement. */
export function createUpdateNoticeState(): {
  update: (state: ClientSyncSnapshot) => boolean
  dismiss: () => void
} {
  let dismissed = false
  let sawSync = false
  return {
    update(state) {
      if (state.syncing) {
        sawSync = true
        return false
      }
      if (state.failures.length === 0) {
        dismissed = false
        return false
      }
      return sawSync && !dismissed
    },
    dismiss() { dismissed = true },
  }
}
