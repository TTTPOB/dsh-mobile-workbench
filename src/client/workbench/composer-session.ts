import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-client-ui-input-trigger/client'
import type {} from '@deepseek-ai/dsh-api-session-controller/client'

/** Borrow the current main-view generation; never retain or open a Session to inspect UI. */
export function composerScope(ctx: Context): Context | undefined {
  const current = Object.values(ctx.sessions.list.getSnapshot().byId)
    .find(row => (row.retainedBy.mainView ?? 0) > 0)
  return current === undefined ? undefined : ctx.sessions.scope(current.id)
}

/** Resolve on use, so delayed work cannot keep a disposed Session controller alive. */
export function composerTriggers(ctx: Context): ReturnType<Context['inputTriggers']['sessionOf']> | undefined {
  const scope = composerScope(ctx)
  return scope === undefined ? undefined : ctx.inputTriggers.sessionOf(scope)
}
