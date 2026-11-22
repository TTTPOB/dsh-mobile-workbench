import { Fragment, useState, type ReactElement } from 'react'
import { StateDot } from '@deepseek-ai/dsh-client-ui-primitives'
import type { SessionListState } from '@deepseek-ai/dsh-api-session-controller/client'
import type { SessionId } from '@deepseek-ai/dsh-session/types'

type Entries = NonNullable<NonNullable<SessionListState['projectionsBySession'][SessionId]>['values']['subagentCatalog']>
export type OpenAgentCard = (address: { parentSessionId: SessionId; childSessionId: SessionId; mode: Exclude<Entries[number]['mode'], 'external'> }) => void
export type AgentCardLabel = (key: 'branch.expand' | 'branch.collapse' | 'activity.running' | 'activity.completed' | 'activity.inactive', params?: { label: string }) => string

export function AgentCards({ list, root, open, t }: { list: SessionListState; root: SessionId; open: OpenAgentCard; t: AgentCardLabel }): ReactElement | null {
  const [expanded, setExpanded] = useState<ReadonlySet<SessionId>>(new Set())
  const entries = (id: SessionId) => list.projectionsBySession[id]?.values.subagentCatalog ?? []
  const running = (entry: Entries[number]): boolean => list.byId[entry.id]?.running ?? ('activity' in entry && entry.activity === 'running')
  const level = (parent: SessionId, nested = false): ReactElement => <div role={nested ? 'group' : undefined} data-agent-cards={nested ? 'nested' : 'root'}>
    {[...entries(parent)].sort((a, b) => Number(running(b)) - Number(running(a)) || b.createdAt - a.createdAt).map(entry => {
      const id = entry.id
      const summary = list.byId[id]
      const projection = list.projectionsBySession[id]?.values
      const model = projection?.modelSelection?.next ?? projection?.modelSelection?.lastUsed
      const name = (entry.mode === 'continuable' || entry.mode === 'external' ? entry.name : undefined) ?? id
      const label = entry.label || summary?.displayTitle || name
      const lastTurnCompleted = projection?.subagentTiming?.lastTurnCompleted
      const status = running(entry) ? 'running' : lastTurnCompleted === true ? 'completed' : 'inactive'
      const dot = status === 'running' ? 'ongoing' : status === 'completed' ? 'done' : 'idle'
      const accessibleLabel = [name, label, model?.model, t(`activity.${status}`)].filter(Boolean).join(' · ')
      const branch = entry.mode !== 'external' && entries(id).length > 0
      const isExpanded = branch && expanded.has(id)
      return <Fragment key={id}>
        <div data-agent-card role="treeitem" aria-label={accessibleLabel} aria-expanded={branch ? isExpanded : undefined}
          aria-disabled={entry.mode === 'external' || undefined} tabIndex={-1} onKeyDown={event => {
            if (event.target !== event.currentTarget || entry.mode === 'external' || (event.key !== 'Enter' && event.key !== ' ')) return
            event.preventDefault()
            open({ parentSessionId: parent, childSessionId: id, mode: entry.mode })
          }}>
          <button data-agent-card-open type="button" aria-label={accessibleLabel} disabled={entry.mode === 'external'} onClick={() => {
            if (entry.mode !== 'external') open({ parentSessionId: parent, childSessionId: id, mode: entry.mode })
          }}>
            <span data-agent-card-name><StateDot state={dot} />{name}</span>
            <span data-agent-card-detail title={label}>{label}</span>
            {model && <span data-agent-card-model title={model.provider + '/' + model.model}>{model.model.split('/').at(-1)}</span>}
          </button>
          {branch && <button data-agent-card-branch type="button" aria-label={t(isExpanded ? 'branch.collapse' : 'branch.expand', { label: name })}
            aria-expanded={isExpanded} onClick={() => setExpanded(previous => {
              const next = new Set(previous)
              if (next.has(id)) next.delete(id); else next.add(id)
              return next
            })}>›</button>}
        </div>
        {isExpanded && level(id, true)}
      </Fragment>
    })}
  </div>
  return entries(root).length === 0 ? null : level(root)
}
