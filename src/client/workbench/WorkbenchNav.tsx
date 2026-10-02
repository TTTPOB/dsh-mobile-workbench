import { useRef } from 'react'
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import { destinationAvailable, resolveDestination, type NavigationEvidence, type WorkbenchDestination, type WorkbenchView } from './navigation.ts'

export interface WorkbenchSnapshot extends NavigationEvidence {
  mobile: boolean
}
export interface WorkbenchInjected {
  hooks: {
    workbench: {
      getSnapshot: () => WorkbenchSnapshot
      subscribe: (listener: () => void) => () => void
    }
  }
  activate: (destination: WorkbenchDestination, pointerStartedOpen?: boolean) => void
  selectView: (view: WorkbenchView) => void
  returnParent: () => void
}
type Props = PropsRuntime<'shell.overlay'> & InjectFace<WorkbenchInjected> & PropsLocale<'mobileWorkbench'>
type AgentProps = PropsRuntime<'conversation.session.header.actions'> & InjectFace<WorkbenchInjected> & PropsLocale<'mobileWorkbench'>
const destinations: readonly Exclude<WorkbenchDestination, 'agents'>[] = ['sessions', 'session', 'files']
const views: readonly WorkbenchView[] = ['chat', 'trajectory']
const paths: Record<Exclude<WorkbenchDestination, 'agents'>, string> = {
  sessions: 'M8 5h13M8 12h13M8 19h13M3 5h1M3 12h1M3 19h1',
  session: 'M4 4h16v12H9l-5 4V4Z',
  files: 'M3 6h7l2 2h9v12H3V6Z',
}

/** Render page navigation without owning the native page trees. */
export function WorkbenchNav({ useWorkbench, activate, t }: Props) {
  const state = useWorkbench(value => value)
  if (!state.mobile) return null
  const selected = resolveDestination(state)
  return (
    <nav data-mobile-workbench="navigation" aria-label={t('navigation')}>
      {destinations.map(destination => {
        const available = destinationAvailable(destination, state)
        const label = t(destination)
        return (
          <button key={destination} type="button" data-workbench-destination={destination}
            aria-current={selected === destination ? 'page' : undefined}
            aria-label={available ? label : label + ' · ' + t('unavailable')}
            title={available ? label : t('unavailable')} disabled={!available}
            onClick={() => { activate(destination) }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d={paths[destination]} />
            </svg>
            <span>{label}</span>
          </button>
        )
      })}
    </nav>
  )
}

/** Independent descendant catalog, native view selection, and direct-parent return. */
export function WorkbenchAgents({ useWorkbench, activate, selectView, returnParent, t }: AgentProps) {
  const state = useWorkbench(value => value)
  const pointerStartedOpen = useRef(false)
  if (!state.mobile) return null
  const counts = state.agentCountsState === 'ready'
    ? state.agentActiveCount + '/' + state.agentTotalCount
    : t(state.agentCountsState === 'unavailable' ? 'unavailable' : 'loading')
  return (
    <>
      <button type="button" data-mobile-workbench="agents" data-workbench-context-control
        aria-label={t('agentCatalog') + ' · ' + counts} title={state.agentTotalCount === 0 ? t('emptyAgents') : t('agentCatalog')}
        aria-haspopup="tree" aria-expanded={state.agentsOpen} disabled={!state.hasAgents || state.agentTotalCount === 0}
        onPointerDownCapture={() => { pointerStartedOpen.current = state.agentsOpen }}
        onPointerCancel={() => { pointerStartedOpen.current = false }}
        onClick={event => { activate('agents', event.detail > 0 && pointerStartedOpen.current); pointerStartedOpen.current = false }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M8 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8 2a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2 20v-3a6 6 0 0 1 12 0v3m1-6a5 5 0 0 1 7 4v2" />
        </svg>
        <small data-workbench-count data-workbench-running={(state.agentActiveCount ?? 0) > 0 ? 'true' : undefined}>{counts}</small>
      </button>
      <div data-mobile-workbench="views" role="group" aria-label={t('sessionView')}>
        {views.map(view => (
          <button key={view} type="button" data-workbench-context-control data-workbench-view={view}
            aria-pressed={state.selectedView === view} disabled={view === 'chat' ? !state.hasChat : !state.hasTrajectory}
            onClick={() => { selectView(view) }}>{t(view)}</button>
        ))}
      </div>
      {state.hasParent && (
        <button type="button" data-mobile-workbench="parent" data-workbench-context-control onClick={returnParent}>
          {t('parentSession')}
        </button>
      )}
    </>
  )
}
