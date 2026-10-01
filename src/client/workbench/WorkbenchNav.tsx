import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import { destinationAvailable, resolveDestination, type NavigationEvidence, type WorkbenchDestination } from './navigation.ts'

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
  activate: (destination: WorkbenchDestination) => void
}
type Props = PropsRuntime<'shell.overlay'> & InjectFace<WorkbenchInjected> & PropsLocale<'mobileWorkbench'>
const destinations: readonly WorkbenchDestination[] = ['chat', 'trajectory', 'agents', 'files']
const paths: Record<WorkbenchDestination, string> = {
  chat: 'M4 4h16v12H9l-5 4V4Z',
  trajectory: 'M5 5h14M5 12h14M5 19h14M9 3v4m6 3v4m-6 3v4',
  agents: 'M8 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8 2a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2 20v-3a6 6 0 0 1 12 0v3m1-6a5 5 0 0 1 7 4v2',
  files: 'M3 6h7l2 2h9v12H3V6Z',
}

/** Render only plugin-owned navigation; host content and lineage remain untouched. */
export function WorkbenchNav({ useWorkbench, activate, t }: Props) {
  const state = useWorkbench(value => value)
  if (!state.mobile) return null
  const selected = resolveDestination(state)
  return (
    <nav data-mobile-workbench="navigation" aria-label={t('navigation')}>
      {destinations.map(destination => {
        const available = destinationAvailable(destination, state)
        const label = t(destination)
        const detail = destination === 'agents' ? t('emptyAgents') : t('unavailable')
        return (
          <button
            key={destination}
            type="button"
            data-workbench-destination={destination}
            aria-current={selected === destination ? 'page' : undefined}
            aria-label={available ? label : `${label} · ${detail}`}
            title={available ? label : detail}
            disabled={!available}
            onClick={() => { activate(destination) }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d={paths[destination]} />
            </svg>
            <span>{label}{destination === 'agents' && (state.agentCount ?? 0) > 0 && <small data-workbench-count>{state.agentCount}</small>}</span>
          </button>
        )
      })}
    </nav>
  )
}
