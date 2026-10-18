import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-api-remotes/client'
import type {} from '@deepseek-ai/dsh-agent-preset-registry/remote'
import type { AgentPresetRow } from '@deepseek-ai/dsh-agent-preset-registry/types'
import { isBuiltInPreset, presetDisplayText, type BuiltInPresetCopyKey } from '@deepseek-ai/dsh-agent-preset-registry/display'
import { WORKBENCH_NS } from './locales.ts'

/** Resolve published names, never present an unregistered or unnamed id as a display name. */
export function presetDisplayName(id: string | undefined, rows: readonly AgentPresetRow[], translate: (key: BuiltInPresetCopyKey) => string, unavailable: string): string {
  const row = rows.find(value => value.id === id)
  if (!row || row.broken !== undefined || (!row.name?.trim() && !isBuiltInPreset(row))) return unavailable
  return presetDisplayText(row, translate).name
}

/** Read the public roster per opening; no mirrored registry, private store or long-lived cache. */
export function createPresetDisplayResolver(ctx: Context): (id: string | undefined) => Promise<string> {
  const t = ctx.locale.bind(WORKBENCH_NS)
  const namespace: string = 'settings.agentPreset'
  const hostT = ctx.locale.bind(namespace)
  return async id => {
    const unavailable = t('modeUnavailable')
    if (!id) return unavailable
    try {
      const presets = ctx.get('remote.agentPresets') as Context['remote']['agentPresets'] | undefined
      if (!presets) return unavailable
      const result = await presets.list()
      if (!result.ok) return unavailable
      return presetDisplayName(id, result.value.presets, key => {
        const text = hostT(key)
        return text === key ? unavailable : text
      }, unavailable)
    } catch (error) {
      // Transport failure leaves an explicitly unavailable label; the next opening retries.
      return unavailable
    }
  }
}
