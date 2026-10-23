import { useEffect, useId, useRef, useState, type ReactElement } from 'react'
import { createPortal } from 'react-dom'
import { MenuSurface, Modal, useAnchoredPosition } from '@deepseek-ai/dsh-client-ui-primitives'
import type {} from '@deepseek-ai/dsh-client-ui-session/client'
import { contextPercent, pressureLabel } from './stats.ts'
import { WorkbenchStatsDetails } from './WorkbenchStatsDetails.tsx'
import type { StatsTranslate } from './stats-locales.ts'
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import { destinationAvailable, resolveDestination, type NavigationEvidence, type WorkbenchDestination, type WorkbenchView } from './navigation.ts'

export interface WorkbenchSnapshot extends NavigationEvidence {
  mobile: boolean
}
export interface WorkbenchInjected {
  tStats: StatsTranslate
  resolvePreset: (id: string | undefined) => Promise<string>
  hooks: {
    workbench: {
      getSnapshot: () => WorkbenchSnapshot
      subscribe: (listener: () => void) => () => void
    }
  }
  activate: (destination: WorkbenchDestination, pointerStartedOpen?: boolean) => void
  selectView: (view: WorkbenchView) => void
  returnParent: () => void
  closeAgents: (restoreFocus?: boolean) => void
  focusAgents: () => void
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
export function WorkbenchNav({ useWorkbench, activate, t }: Props): ReactElement | null {
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
            aria-current={!state.managementOpen && selected === destination ? 'page' : undefined}
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

/** Header content uses public session summaries and session-bound projections. */
export function WorkbenchAgents({ useWorkbench, useSessions, useProjection, sessionId, activate, selectView, returnParent, closeAgents, focusAgents, resolvePreset, t, tStats }: AgentProps): ReactElement | null {
  const state = useWorkbench(value => value)
  const summary = useSessions(value => sessionId ? value.byId[sessionId] : undefined)
  const parent = useSessions(value => summary?.parentId ? value.byId[summary.parentId] : undefined)
  const pressure = useProjection('contextPressure')
  const breakdown = useProjection('contextBreakdown')
  const activity = useProjection('sessionStats')
  const usage = useProjection('tokenUsage')
  const title = summary?.displayTitle ?? sessionId ?? ''
  const preset = (summary?.projectionValues as { agentPreset?: string } | undefined)?.agentPreset
  const unavailable = t('modeUnavailable')
  const [resolvedMode, setResolvedMode] = useState<{ session: typeof sessionId; preset: typeof preset; locale: string; name: string }>()
  const mode = resolvedMode?.session === sessionId && resolvedMode?.preset === preset && resolvedMode?.locale === unavailable ? resolvedMode.name : unavailable
  const [overlay, setOverlay] = useState<'info' | 'stats' | null>(null)
  useEffect(() => {
    if (overlay !== 'info') return
    let active = true
    void resolvePreset(preset).then(name => { if (active) setResolvedMode({ session: sessionId, preset, locale: unavailable, name }) })
    return () => { active = false }
  }, [overlay, sessionId, preset, unavailable, resolvePreset])
  const pointerStartedOpen = useRef(false)
  const statsRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const panelId = useId()
  const statsOpen = overlay === 'stats' && state.mobile
  const position = useAnchoredPosition({ open: statsOpen, anchorRef: statsRef, panelRef, align: 'end', gap: 4, margin: 12 })
  const closeStats = (): void => { setOverlay(null); statsRef.current?.focus({ preventScroll: true }) }
  useEffect(() => { setOverlay(null) }, [sessionId, state.mobile])
  useEffect(() => { if (state.agentsOpen) setOverlay(null) }, [state.agentsOpen])
  useEffect(() => {
    if (!statsOpen) return
    const outside = (event: PointerEvent): void => {
      if (event.target instanceof Node && !panelRef.current?.contains(event.target) && !statsRef.current?.contains(event.target)) { event.preventDefault(); closeStats() }
    }
    const escape = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopImmediatePropagation(); closeStats() }
    }
    document.addEventListener('pointerdown', outside, true)
    document.addEventListener('keydown', escape, true)
    return () => {
      document.removeEventListener('pointerdown', outside, true)
      document.removeEventListener('keydown', escape, true)
    }
  }, [statsOpen])
  if (!state.mobile) return null
  const counts = state.agentCountsState === 'ready'
    ? state.agentActiveCount + '/' + state.agentTotalCount
    : t(state.agentCountsState === 'unavailable' ? 'unavailable' : 'loading')
  const percent = contextPercent(pressure)
  return <>
    <div data-workbench-header-main>
      {summary?.parentId && <button type="button" data-mobile-workbench="parent" data-workbench-context-control
        aria-label={t('parentSession') + ' · ' + (parent?.displayTitle ?? summary.parentId)} onClick={returnParent}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="m10 5-7 7 7 7M3 12h18" /></svg>
      </button>}
      <button type="button" data-workbench-title-info data-workbench-context-control
        aria-label={title + ' · ' + t('viewSessionInfo')} aria-haspopup="dialog" aria-expanded={overlay === 'info'}
        onClick={event => { event.currentTarget.focus({ preventScroll: true }); closeAgents(false); setOverlay('info') }}><span>{title}</span></button>
      <button ref={statsRef} type="button" data-mobile-workbench="stats" data-workbench-context-control
        aria-label={t('statistics') + ' · ' + pressureLabel(pressure)} aria-haspopup="dialog" aria-expanded={statsOpen} aria-controls={statsOpen ? panelId : undefined}
        onClick={() => { if (statsOpen) closeStats(); else { closeAgents(false); setOverlay('stats') } }}>
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" opacity=".2" strokeWidth="2" />
          {percent !== undefined && <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" pathLength="100" strokeDasharray={Math.min(100, Math.max(0, percent)) + ' 100'} transform="rotate(-90 12 12)" />}</svg>
        <span>{pressureLabel(pressure)}</span>
      </button>
    </div>
    <div data-workbench-header-secondary>
      <div data-mobile-workbench="views" role="tablist" aria-label={t('sessionView')}>
        {views.map(view => <button key={view} type="button" role="tab" data-workbench-context-control data-workbench-view={view}
          aria-selected={state.selectedView === view} disabled={view === 'chat' ? !state.hasChat : !state.hasTrajectory}
          onClick={() => { selectView(view) }}>{t(view)}</button>)}
      </div>
      <button type="button" data-mobile-workbench="agents" data-workbench-context-control
        aria-label={t('agentCatalog') + ' · ' + counts} title={state.agentTotalCount === 0 ? t('emptyAgents') : t('agentCatalog')}
        aria-haspopup="tree" aria-expanded={state.agentsOpen} disabled={!state.hasAgents || state.agentTotalCount === 0}
        onMouseDown={event => { event.preventDefault() }}
        onPointerDownCapture={() => { pointerStartedOpen.current = state.agentsOpen }}
        onPointerCancel={() => { pointerStartedOpen.current = false }}
        onKeyDown={event => {
          if (event.key === 'Escape') { event.preventDefault(); closeAgents(); return }
          if (['Enter', ' ', 'ArrowDown'].includes(event.key)) {
            event.preventDefault(); setOverlay(null)
            if (!state.agentsOpen) activate('agents')
            focusAgents()
          }
        }}
        onClick={event => { setOverlay(null); activate('agents', event.detail > 0 && pointerStartedOpen.current); pointerStartedOpen.current = false }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="9" y="3" width="6" height="4" rx="1" />
          <rect x="3" y="17" width="6" height="4" rx="1" />
          <rect x="15" y="17" width="6" height="4" rx="1" />
          <path d="M12 7v6M5 17v-4h14v4" />
        </svg>
        <small data-workbench-count>{counts}</small>
      </button>
    </div>
    <Modal open={overlay === 'info'} title={t('sessionInfo')} closeLabel={t('close')}
      className="mobile-workbench-session-info" onClose={() => { setOverlay(null) }}>
      <p>{title}</p><p>{t('presetReadOnly', { name: mode })}</p>
      <button type="button" data-modal-autofocus onClick={() => { setOverlay(null) }}>{t('close')}</button>
    </Modal>
    {statsOpen && createPortal(<MenuSurface ref={panelRef} id={panelId} role="dialog" aria-label={t('statistics')}
      data-workbench-stats-panel style={{ top: position?.top, right: 12, visibility: position ? 'visible' : 'hidden' }}>
      <div data-workbench-stats-scroll>
        <WorkbenchStatsDetails pressure={pressure} breakdown={breakdown} activity={activity} usage={usage} t={tStats} />
      </div>
    </MenuSurface>, document.body)}
  </>
}
