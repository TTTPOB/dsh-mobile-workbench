import { expect, test, type Locator, type Page } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { fixtureSession } from './demo.ts'

async function openTrace(page: Page, mobile: boolean): Promise<void> {
  await fixtureSession(page)
  if (mobile) await page.locator('[data-workbench-view="trajectory"]').click()
  else await page.getByRole('tab', { name: 'Trajectory', exact: true }).click()
  await expect(page.locator('[data-trajectory-scroll]')).toBeVisible()
}

async function assertSplit(page: Page, mobile: boolean): Promise<void> {
  const ledger = await page.locator('[data-trajectory-scroll]').boundingBox()
  const detail = await page.locator('aside[class*="_details"]').boundingBox()
  expect(ledger).not.toBeNull()
  expect(detail).not.toBeNull()
  if (mobile) {
    expect(Math.abs(ledger!.height / (ledger!.height + detail!.height) - .4)).toBeLessThan(.005)
    expect(Math.abs(ledger!.y + ledger!.height - detail!.y)).toBeLessThan(1)
  } else {
    expect(Math.abs(ledger!.y - detail!.y)).toBeLessThan(1)
    expect(detail!.x).toBeGreaterThan(ledger!.x)
  }
}

async function scrollToEnd(panel: Locator): Promise<void> {
  await panel.evaluate(node => { node.scrollTop = node.scrollHeight })
  await expect.poll(() => panel.evaluate(node => Math.abs(node.scrollHeight - node.clientHeight - node.scrollTop))).toBeLessThanOrEqual(2)
}

async function assertSummaryPreviews(detail: Locator, mobile: boolean): Promise<void> {
  const jumps = detail.locator('[class*="_overviewHeading"] > button[class*="_overviewTitle"]')
  expect(await jumps.count()).toBeGreaterThan(0)
  for (const jump of await jumps.all()) {
    if (mobile) await expect(jump).toBeHidden()
    else await expect(jump).toBeVisible()
  }
  if (mobile) {
    for (const preview of await detail.locator('[class*="_overviewPreview"]').all()) {
      expect(await preview.evaluate(node => node.clientHeight)).toBeGreaterThan(0)
    }
  }
}

test('request Summary removes only repeated jumps, preserves native tabs and the 40:60 ledger', async ({ page }, info) => {
  const mobile = info.project.name.startsWith('mobile')
  await openTrace(page, mobile)
  await page.getByRole('button', { name: 'Request #1', exact: true }).click()
  const detail = page.locator('aside[class*="_details"]')
  const summary = detail.getByRole('tabpanel', { name: 'Summary', exact: true })
  await expect(summary).toBeVisible()
  await assertSplit(page, mobile)
  await assertSummaryPreviews(detail, mobile)
  await expect(summary.getByText('Completed', { exact: true })).toBeVisible()
  await expect(summary.getByText('Provider', { exact: true })).toBeVisible()
  await expect(summary.getByRole('button', { name: 'Assistant Message', exact: true })).toHaveCount(1)
  const labelledTrees = summary.getByRole('tree')
  expect(await labelledTrees.count()).toBeGreaterThan(0)
  for (const tree of await labelledTrees.all()) expect(await tree.getAttribute('aria-label')).toBeTruthy()
  if (mobile) {
    expect(await summary.evaluate(node => node.scrollHeight)).toBeGreaterThan(await summary.evaluate(node => node.clientHeight))
    await scrollToEnd(summary)
    await expect(summary.getByText('Throughput', { exact: true })).toBeVisible()
  }
  for (const [name, text] of [['Options', 'mobile-audit'], ['Usage', 'Input'], ['Timing', 'Started']]) {
    const tab = detail.getByRole('tab', { name, exact: true })
    await tab.click()
    await expect(tab).toHaveAttribute('aria-selected', 'true')
    await expect(detail.getByRole('tabpanel')).toContainText(text)
    await scrollToEnd(detail.getByRole('tabpanel'))
  }
  // The upper ledger stays usable while a detail is open: no close/reopen drill-in.
  await page.getByRole('button', { name: 'Request #2', exact: true }).click()
  await expect(detail.locator('[class*="_requestDetailsName"]')).toHaveText('Request #2')
  await assertSplit(page, mobile)
  await detail.getByRole('button', { name: 'Close details', exact: true }).click()
  await expect(detail).toHaveCount(0)
  await expect(page.locator('[data-trajectory-scroll]')).toBeVisible()
  if (mobile) {
    await page.locator('[data-workbench-view="chat"]').click()
    await expect(page.locator('[data-conversation-scroll]')).toBeVisible()
    await page.locator('[data-workbench-view="trajectory"]').click()
    await expect(page.locator('[data-trajectory-scroll]')).toBeVisible()
  }
})

test('Trace hides the whole composer without losing draft, attachment, selection or editor identity', async ({ page }, info) => {
  const mobile = info.project.name.startsWith('mobile')
  await fixtureSession(page)
  const editor = page.locator('[data-composer-input]')
  await editor.click()
  await editor.fill('Trace preserves draft, selection and attachments')
  await page.locator('input[type="file"]').setInputFiles({
    name: 'trace-retained.png', mimeType: 'image/png', buffer: readFileSync(new URL('../../assets/workbench-192.png', import.meta.url)),
  })
  const attachment = page.locator('[data-composer-card] img[alt="trace-retained.png"]')
  await expect(attachment).toBeVisible()
  const handle = (await editor.elementHandle())!
  const attachmentHandle = (await attachment.elementHandle())!
  const selection = await editor.evaluate(node => {
    const text = document.createTreeWalker(node, NodeFilter.SHOW_TEXT).nextNode()!
    getSelection()!.setBaseAndExtent(text, 1, text, 7)
    return { anchor: getSelection()!.anchorOffset, focus: getSelection()!.focusOffset, text: getSelection()!.toString() }
  })
  const trace = mobile ? page.locator('[data-workbench-view="trajectory"]') : page.getByRole('tab', { name: 'Trajectory', exact: true })
  // A script click preserves the current text selection instead of a pointer gesture moving it.
  await trace.evaluate((node: HTMLButtonElement) => { node.click() })
  await expect(page.locator('[data-trajectory-scroll]')).toBeVisible()
  const seat = page.locator('[data-composer-seat]')
  if (mobile) {
    await expect(seat).toBeHidden()
    await expect(page.locator('[data-mobile-workbench="navigation"]')).toBeVisible()
    await expect.poll(() => page.locator('[data-trajectory-scroll]').evaluate(node => getComputedStyle(node).paddingBottom)).toBe('0px')
  } else await expect(seat).toBeVisible()
  expect(await handle.evaluate(node => node === document.querySelector('[data-composer-input]'))).toBe(true)
  expect(await attachmentHandle.evaluate(node => node.isConnected)).toBe(true)
  const chat = mobile ? page.locator('[data-workbench-view="chat"]') : page.getByRole('tab', { name: 'Chat', exact: true })
  await chat.evaluate((node: HTMLButtonElement) => { node.click() })
  await expect(seat).toBeVisible()
  await expect(editor).toHaveText('Trace preserves draft, selection and attachments')
  await expect(attachment).toBeVisible()
  expect(await handle.evaluate(node => node === document.querySelector('[data-composer-input]'))).toBe(true)
  expect(await attachmentHandle.evaluate(node => node === document.querySelector('[data-composer-card] img[alt="trace-retained.png"]'))).toBe(true)
  expect(await page.evaluate(() => ({ anchor: getSelection()!.anchorOffset, focus: getSelection()!.focusOffset, text: getSelection()!.toString() }))).toEqual(selection)
})

test('external Trace switching releases expanded-editor interaction state without remounting the draft', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Desktop has no mobile expanded editor')
  await fixtureSession(page)
  const editor = page.locator('[data-composer-input]')
  await editor.click()
  await editor.fill('Expanded draft survives external Trace switching')
  const handle = (await editor.elementHandle())!
  await page.getByRole('button', { name: 'Expand editor', exact: true }).click()
  const card = page.locator('[data-composer-card]')
  await expect(card).toHaveAttribute('role', 'dialog')
  // Simulate an external native view change while background interaction is inert.
  await page.locator('[data-workbench-view="trajectory"]').evaluate((node: HTMLButtonElement) => { node.click() })
  await expect(page.locator('[data-composer-seat]')).toBeHidden()
  await expect(page.locator('html')).not.toHaveAttribute('data-workbench-compose', 'expanded')
  await expect(card).not.toHaveAttribute('aria-modal', 'true')
  await expect(card).not.toHaveAttribute('role', 'dialog')
  await expect(page.locator('[inert]')).toHaveCount(0)
  await page.locator('[data-workbench-view="chat"]').click()
  await expect(editor).toBeVisible()
  await expect(editor).toHaveText('Expanded draft survives external Trace switching')
  expect(await handle.evaluate(node => node === document.querySelector('[data-composer-input]'))).toBe(true)
})

test('child Trace also hides composer clearance while preserving the two-pane inspector and parent return', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Desktop Trace visibility is asserted by the draft identity case')
  await fixtureSession(page, { reuse: false })
  await page.locator('[data-composer-input]').fill('演示子智能体')
  await page.getByRole('button', { name: 'Send message', exact: true }).click()
  await expect(page.getByText(/MOBILE_AUDIT_SUBAGENT_COMPLETE/).last()).toBeVisible({ timeout: 60_000 })
  const agents = page.locator('[data-mobile-workbench="agents"]')
  await expect(agents).toBeEnabled({ timeout: 60_000 })
  await agents.click()
  const tree = page.locator('[role="tree"][class*="_menuBody"]')
  await expect(tree).toBeVisible()
  await tree.locator('[role="treeitem"]').first().click()
  const parent = page.locator('[data-mobile-workbench="parent"]')
  await expect(parent).toBeVisible()
  const seat = page.locator('[data-composer-seat]')
  await expect(seat).toBeVisible()
  await page.locator('[data-workbench-view="trajectory"]').click()
  await expect(seat).toBeHidden()
  await page.getByRole('button', { name: 'Request #1', exact: true }).click()
  await assertSplit(page, true)
  await page.locator('aside[class*="_details"]').getByRole('button', { name: 'Close details', exact: true }).click()
  await page.locator('[data-workbench-view="chat"]').click()
  await expect(seat).toBeVisible()
  await parent.click()
  await expect(parent).toHaveCount(0)
})

test('tool Summary, payload, result and schema remain readable and accessible without duplicated jumps', async ({ page }, info) => {
  const mobile = info.project.name.startsWith('mobile')
  await openTrace(page, mobile)
  const tool = page.locator('[data-trajectory-row-key]').filter({ hasText: /read\{/ }).first()
  await tool.click()
  const detail = page.locator('aside[class*="_details"]')
  const summary = detail.getByRole('tabpanel', { name: 'Summary', exact: true })
  await expect(summary).toBeVisible()
  await assertSplit(page, mobile)
  await assertSummaryPreviews(detail, mobile)
  await expect(summary.getByText('Hierarchy', { exact: true })).toBeVisible()
  await expect(summary.getByText('Completed', { exact: true })).toBeVisible()
  await expect(summary.getByRole('tree', { name: 'Payload JSON', exact: true })).toHaveCount(1)
  await expect(summary.getByRole('tree', { name: 'read parameters JSON', exact: true })).toHaveCount(1)
  await expect(summary.getByRole('heading', { name: 'read', exact: true })).toHaveCount(1)
  await expect(summary.getByRole('button', { name: 'Assistant Message', exact: true })).toHaveCount(1)
  const previewContent = await summary.locator('[class*="_overviewPreview"]').allTextContents()
  expect(previewContent.join('\n')).toContain('MOBILE_AUDIT_READ_OK')
  expect(previewContent.join('\n')).toContain('file_path')
  if (mobile) {
    await scrollToEnd(summary)
    await expect(summary.getByText('Duration', { exact: true })).toBeVisible()
  }
  for (const [name, text] of [['Payload', 'file_path'], ['Result', 'MOBILE_AUDIT_READ_OK'], ['Schema', 'Parameters'], ['Timing', 'Duration']]) {
    const tab = detail.getByRole('tab', { name, exact: true })
    await tab.click()
    await expect(tab).toHaveAttribute('aria-selected', 'true')
    const panel = detail.getByRole('tabpanel')
    await expect(panel).toContainText(text)
    // Last tabs remain horizontally reachable on 320px touch screens.
    const tabBox = await tab.boundingBox()
    const listBox = await detail.getByRole('tablist').boundingBox()
    expect(tabBox!.x).toBeGreaterThanOrEqual(listBox!.x - 1)
    expect(tabBox!.x + tabBox!.width).toBeLessThanOrEqual(listBox!.x + listBox!.width + 1)
    await scrollToEnd(panel)
    if (mobile && name === 'Payload') {
      const viewport = page.viewportSize()!
      await page.setViewportSize({ width: viewport.width, height: 540 })
      await assertSplit(page, true)
      await expect.poll(() => panel.evaluate(node => node.scrollHeight > node.clientHeight)).toBe(true)
      await scrollToEnd(panel)
      await page.setViewportSize(viewport)
    }
  }
  await detail.getByRole('tab', { name: 'Summary', exact: true }).click()
  await expect(summary).toBeVisible()
  await page.getByRole('button', { name: 'Request #1', exact: true }).click()
  await expect(detail.locator('[class*="_requestDetailsName"]')).toHaveText('Request #1')
  await tool.click()
  await expect(detail.getByRole('tab', { name: 'Payload', exact: true })).toBeVisible()
  const close = detail.getByRole('button', { name: 'Close details', exact: true })
  if (mobile) {
    const box = await close.boundingBox()
    expect(box!.width).toBeGreaterThanOrEqual(44)
    expect(box!.height).toBeGreaterThanOrEqual(44)
  }
  await close.click()
  await expect(detail).toHaveCount(0)
  await expect(tool).toBeVisible()
})
