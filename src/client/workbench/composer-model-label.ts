import type { ModelLabelOwner } from '@deepseek-ai/dsh-client-ui-model-selection/client'

/** Shorten catalog names only in the mobile trigger; menu and custom names stay intact. */
export function composerModelName(owner: ModelLabelOwner, mobile: boolean): string {
  if (!mobile || owner.placement !== 'trigger') return owner.model.name
  let name = owner.model.name
  for (const prefix of ['openai/', 'anthropic/', 'deepseek/']) {
    if (name.startsWith(prefix)) name = name.slice(prefix.length)
  }
  if (name.startsWith('gpt-')) return 'GPT-' + name.slice(4)
  if (name.startsWith('claude-')) return 'Claude ' + name.slice(7)
  return name
}
