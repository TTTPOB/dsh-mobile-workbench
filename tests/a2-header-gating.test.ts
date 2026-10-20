import { test } from 'node:test'
import assert from 'node:assert/strict'
import { LAYOUT_CSS } from '../src/client/styles/layout.css.ts'
import { WORKBENCH_HEADER_CSS } from '../src/client/styles/workbench-header.css.ts'

test('rc.2 header uses the workbench marker, not historical generation branches', () => {
  assert.match(WORKBENCH_HEADER_CSS, /header\[data-mobile-workbench-header\]/)
  assert.doesNotMatch(LAYOUT_CSS, /headerLeading|headerHidden|ZKlsPq|QsffPG/)
  assert.match(LAYOUT_CSS, /data-phase="hero"\] header\[class\*="headerBlank"\][^}]*display: none !important/s)
})

test('title and native utilities retain 44px targets with readable context', () => {
  assert.match(WORKBENCH_HEADER_CSS, /min-height: 44px !important/)
  assert.match(WORKBENCH_HEADER_CSS, /data-workbench-header-secondary/)
  assert.match(WORKBENCH_HEADER_CSS, /row-gap: 4px/)
  assert.match(WORKBENCH_HEADER_CSS, /data-workbench-title-info/)
  assert.match(WORKBENCH_HEADER_CSS, /data-mobile-workbench="parent"/)
})

// The two-row header is a grid on the host actions row, not a stack of block
// children: a host chip rendered before the plugin nodes (the agent-team trigger)
// otherwise takes a row of its own and pushes the title/statistics row down.
test('the actions row is a two-row grid with a single second-row band', () => {
  assert.match(WORKBENCH_HEADER_CSS, /grid-template-rows: 44px 44px/)
  assert.match(WORKBENCH_HEADER_CSS, /"main main main main"\s+"views tasks team agents"/)
  assert.match(WORKBENCH_HEADER_CSS, /\[data-workbench-header-main\] \{\s*grid-area: main/)
  assert.match(WORKBENCH_HEADER_CSS, /\[data-workbench-header-secondary\] \{ display: contents !important; \}/)
  assert.match(WORKBENCH_HEADER_CSS, /\[data-mobile-workbench="views"\] \{ grid-area: views/)
  assert.match(WORKBENCH_HEADER_CSS, /\[data-team-action\] \{ grid-area: team/)
  assert.match(WORKBENCH_HEADER_CSS, /\[data-mobile-workbench="agents"\] \{ grid-area: agents/)
})

// The host background-task chip lost the wrapper class the old selector required,
// so it silently fell out of the first row. The anchor is the actions slot plus the
// count inside the trigger, and the obsolete 88px reserve must not come back.
test('the background-task chip is anchored on the slot, not on a private wrapper class', () => {
  assert.match(WORKBENCH_HEADER_CSS, /\[data-slot="conversation\.session\.header\.actions"\] > div:has\(> button\[class\*="_trigger"\] > \[class\*="_count"\]\)/)
  assert.match(WORKBENCH_HEADER_CSS, /grid-area: tasks/)
  assert.doesNotMatch(WORKBENCH_HEADER_CSS, /first-row-reserve/)
  assert.doesNotMatch(WORKBENCH_HEADER_CSS, /_root\]:has/)
})
