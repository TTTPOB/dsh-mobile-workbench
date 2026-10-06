import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { test } from 'node:test'
import { runInNewContext } from 'node:vm'

const source = readFileSync(new URL('../src/client/workbench/index.ts', import.meta.url), 'utf8')
const executable = stripTypeScriptTypes(source.replace(/^import .*\n/gm, '').replaceAll('export function', 'function'))

test('DOM refresh never recounts descendants; store refresh never rescans presentation', () => {
  let countsReads = 0, presentationReads = 0, evidenceReads = 0
  let count: number | undefined = 1
  let sessionsChanged = () => {}, statusChanged = () => {}, viewsChanged = () => {}
  let mutations: (records: object[]) => void = () => {}
  let dispose = () => {}
  const frames = new Map<number, () => void>()
  let sequence = 0
  const mq = { matches: true, addEventListener() {}, removeEventListener() {} }
  const ctx = {
    effect: (install: () => () => void, label: string) => { if (label === 'mobile-workbench: host navigation evidence') dispose = install() },
    locale: { register() {} },
    get: () => ({ sessionStatus: { getSnapshot: () => new Map(), subscribe: (fn: () => void) => { statusChanged = fn; return () => {} } } }),
    sessions: { list: { getSnapshot: () => ({}), subscribe: (fn: () => void) => { sessionsChanged = fn; return () => {} } } },
    layout: {},
    slots: { entriesOfSlot: () => [], inject() {}, subscribe: (_slot: string, fn: () => void) => { viewsChanged = fn; return () => {} } },
  }
  runInNewContext(`${executable}; installWorkbench(ctx)`, {
    ctx,
    document: { querySelector: () => null, documentElement: { removeAttribute() {} }, body: {} },
    window: { matchMedia: () => mq, requestAnimationFrame: (fn: () => void) => { frames.set(++sequence, fn); return sequence }, cancelAnimationFrame: (id: number) => frames.delete(id) },
    MutationObserver: class { constructor(fn: (records: object[]) => void) { mutations = fn } observe() {} disconnect() {} },
    MOBILE_QUERY: '', WORKBENCH_NS: '',
    installWorkbenchSessionMenu() {}, installWorkbenchUpdateNotice() {},
    getFrame: () => ({}), panelSelectorOf: () => undefined,
    subagentCounts: () => { countsReads++; return count === undefined ? undefined : { agentCountsState: 'ready', agentTotalCount: count, agentActiveCount: 0 } },
    createHostBridge: (_ids: unknown, counts: () => object) => ({ evidence: () => { evidenceReads++; return { ...counts(), filesOpen: false } }, clear() {} }),
    createWorkbenchPresentation: () => ({ update: () => { presentationReads++ }, clear() {} }),
    boundaryMutation: (record: { boundary?: string }, selector: string) => record.boundary === selector,
    PRESENTATION_BOUNDARY: 'presentation', PRESENTATION_LOCAL: 'local', NAVIGATION_BOUNDARY: 'navigation',
  })
  const flush = () => { const pending = [...frames.values()]; frames.clear(); pending.forEach(fn => fn()) }
  assert.equal(countsReads, 1)
  assert.equal(presentationReads, 1)
  const initialEvidenceReads = evidenceReads
  mutations([{ boundary: 'stream' }]); flush()
  assert.equal(evidenceReads, initialEvidenceReads)
  mutations([{ boundary: 'navigation' }]); flush()
  assert.equal(presentationReads, 1)
  mutations([{ boundary: 'presentation' }]); flush()
  assert.equal(presentationReads, 2)
  assert.equal(countsReads, 1)
  count = 2
  statusChanged(); flush()
  count = undefined
  sessionsChanged(); flush()
  assert.equal(countsReads, 3)
  assert.equal(presentationReads, 2)
  viewsChanged(); flush()
  assert.equal(presentationReads, 3)
  dispose()
  assert.equal(frames.size, 0)
})
