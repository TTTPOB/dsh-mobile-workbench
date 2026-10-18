import { test } from 'node:test'
import assert from 'node:assert/strict'
import { WORKBENCH_TRAJECTORY_CSS } from '../src/client/styles/workbench-trajectory.css.ts'

test('mobile inspector preserves the requested ledger/detail split and all tab navigation', () => {
  assert.match(WORKBENCH_TRAJECTORY_CSS, /^@media \(max-width: 1023px\) and \(pointer: coarse\)/)
  assert.match(WORKBENCH_TRAJECTORY_CSS, /grid-template-rows: minmax\(0, 2fr\) minmax\(0, 3fr\)/)
  assert.doesNotMatch(WORKBENCH_TRAJECTORY_CSS, /\[data-trajectory-scroll\][^}]*display: none/s)
  assert.doesNotMatch(WORKBENCH_TRAJECTORY_CSS, /\[role="tab(?:list)?"\][^}]*display: none/s)
})

test('only Trace hides the resident composer and clears its native bottom reservation', () => {
  assert.match(WORKBENCH_TRAJECTORY_CSS, /\[data-conversation-scroll\]:has\(\[data-workbench-trajectory\]\) > \[data-composer-seat\] \{\s+display: none !important/)
  assert.match(WORKBENCH_TRAJECTORY_CSS, /\[data-workbench-trajectory\] \{ --dsh-trajectory-bottom-clearance: 0px; \}/)
  assert.doesNotMatch(WORKBENCH_TRAJECTORY_CSS, /\[data-mobile-workbench="navigation"\][^}]*display: none/)
})

test('Summary keeps content in document flow and hides only duplicate jump titles', () => {
  assert.match(WORKBENCH_TRAJECTORY_CSS, /aria-labelledby="trajectory-detail-overview"\] \{\s+display: block !important;\s+overflow-y: auto !important/)
  assert.match(WORKBENCH_TRAJECTORY_CSS, /section\[class\*="_overviewSection"\][^}]*max-height: none !important;[^}]*overflow: visible !important/s)
  assert.match(WORKBENCH_TRAJECTORY_CSS, /_overviewHeading"\] > button\[class\*="_overviewTitle"\]/)
  assert.match(WORKBENCH_TRAJECTORY_CSS, /_overviewHeading"\]:has\(> button\[class\*="_overviewTitle"\]:only-child\)/)
  assert.doesNotMatch(WORKBENCH_TRAJECTORY_CSS, /textContent|:text\(|Payload|Result|Timing/)
})
