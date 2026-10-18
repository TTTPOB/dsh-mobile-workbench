import { expect, test, type Locator, type Page } from '@playwright/test'
import { demoUrl, fixtureSession } from './demo.ts'

const value = (page: Page, key: string): Locator => page.locator('[data-workbench-stat="' + key + '"] dd')
const background = (target: Locator): Promise<string> => target.evaluate(node => getComputedStyle(node).backgroundColor)

async function pressFeedback(page: Page, target: Locator): Promise<void> {
  await page.mouse.move(2, 120)
  const idle = await background(target)
  const box = (await target.boundingBox())!
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  expect(await background(target)).not.toBe(idle)
}

test('public statistics restores native session readings and remains bounded; desktop keeps native chrome', async ({ page, isMobile }, info) => {
  await fixtureSession(page, { reuse: false })
  if (!isMobile) {
    await expect(page.locator('[data-mobile-workbench="stats"]')).toHaveCount(0)
    await expect(page.locator('[data-composer-stat="activity"]')).toBeVisible()
    await expect(page.locator('[data-conversation-tabs]')).toBeVisible()
    return
  }
  const agents = page.locator('[data-mobile-workbench="agents"]')
  if (await agents.isDisabled()) {
    const before = await background(agents), box = (await agents.boundingBox())!
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.mouse.down()
    expect(await background(agents)).toBe(before)
    await page.mouse.up()
  }
  const stats = page.locator('[data-mobile-workbench="stats"]')
  const nativeLabel = await page.locator('[data-composer-stat="activity"] button').getAttribute('aria-label')
  const nativeSpeed = nativeLabel?.match(/([\d.]+) tok\/s/)?.[1]
  expect(nativeSpeed, 'fixture has settled, timed output samples').toBeTruthy()
  await stats.click()
  const panel = page.locator('[data-workbench-stats-panel]')
  await expect(panel).toBeVisible()
  await expect(value(page, 'decodeSpeed')).toHaveText(nativeSpeed + ' tok/s')
  for (const key of ['ttft', 'llmTime', 'toolTime']) await expect(value(page, key)).not.toHaveText('—')
  await expect(panel.locator('[data-workbench-stat="usedTokens"] dt')).toHaveText('Used tokens (reference)')
  for (const key of ['system', 'tools', 'messages']) await expect(panel.locator('[data-workbench-stat="' + key + '"] dt')).toContainText('(estimate)')
  const total = await value(page, 'total').textContent()
  const buckets = await Promise.all(['input', 'output', 'cacheRead', 'cacheWrite'].map(key => value(page, key).textContent()))
  const number = (text: string | null): number => Number(text?.replaceAll(',', ''))
  expect(number(total)).toBe(buckets.reduce((sum, text) => sum + number(text), 0))
  await expect(value(page, 'cacheHit')).toContainText('%')
  expect(await panel.evaluate(node => node.closest('[aria-live]') === null)).toBe(true)
  const box = (await panel.boundingBox())!
  expect(box.x).toBeGreaterThanOrEqual(12)
  expect(box.x + box.width).toBeLessThanOrEqual(page.viewportSize()!.width - 12)
  expect(box.height).toBeLessThanOrEqual(page.viewportSize()!.height * .6)
  expect(await panel.evaluate(node => node.scrollHeight > node.clientHeight)).toBe(true)
  await page.screenshot({ path: '.demo-home/review/stats/after-top-' + info.project.name + '.png' })
  await value(page, 'cacheWrite').scrollIntoViewIfNeeded()
  await page.screenshot({ path: '.demo-home/review/stats/after-bottom-' + info.project.name + '.png' })
  await page.keyboard.press('Escape')
  await expect(panel).toHaveCount(0)
  await expect(stats).toBeFocused()
})

test('touch controls show pressed and expanded feedback in both themes without shrinking agents targets', async ({ page, isMobile }, info) => {
  test.skip(!isMobile)
  await fixtureSession(page, { reuse: false })
  const agents = page.locator('[data-mobile-workbench="agents"]')
  await page.locator('[data-composer-input]').fill('演示多层子智能体')
  await page.getByRole('button', { name: 'Send message', exact: true }).click()
  await expect(page.getByText(/MOBILE_AUDIT_NESTED_ROOT_(?:NOT_)?COMPLETE/).last()).toBeVisible({ timeout: 60_000 })
  await expect(agents).toBeEnabled()
  // Use the real preference so emulateMedia exercises both palettes, not a persisted fixed theme.
  await page.locator('[data-workbench-destination="sessions"]').click()
  await page.getByRole('button', { name: 'Account menu', exact: true }).click()
  await page.getByRole('menuitem', { name: 'Settings', exact: true }).click()
  await page.getByRole('button', { name: 'System', exact: true }).click()
  await page.locator('[data-shortcut-modal="settings"]').getByRole('button', { name: 'Close', exact: true }).click()
  await page.locator('[data-workbench-destination="session"]').click()
  const stats = page.locator('[data-mobile-workbench="stats"]')
  const more = page.locator('[data-mobile-workbench-header] [class*="_headerUtilities"] button[aria-haspopup="menu"]')
  const colors: string[] = []
  for (const theme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme: theme })
    if (colors.length) await expect.poll(() => stats.evaluate(n => getComputedStyle(n).color)).not.toBe(colors[0])
    colors.push(await stats.evaluate(n => getComputedStyle(n).color))
    const hit = await agents.evaluate(node => {
      const rect = node.getBoundingClientRect(), glyph = node.querySelector('svg')!.getBoundingClientRect()
      return { width: rect.width, height: rect.height, glyph: [glyph.width, glyph.height], edges: [rect.x + 1, rect.right - 1].map(x => node.contains(document.elementFromPoint(x, rect.y + rect.height / 2))) }
    })
    expect(hit.width).toBeGreaterThanOrEqual(44)
    expect(hit.height).toBeGreaterThanOrEqual(44)
    expect(hit.glyph).toEqual([16, 16])
    expect(hit.edges).toEqual([true, true])
    for (const target of [stats, agents, more]) {
      await pressFeedback(page, target)
      if (target === stats) await page.screenshot({ path: '.demo-home/review/stats/pressed-' + theme + '-' + info.project.name + '.png' })
      await page.mouse.up()
      await expect(target).toHaveAttribute('aria-expanded', 'true')
      await page.mouse.move(2, 120)
      expect(await background(target)).not.toBe('rgba(0, 0, 0, 0)')
      if (target === agents) await agents.click()
      else await page.keyboard.press('Escape')
      await page.mouse.move(2, 120)
      await expect(target).toHaveAttribute('aria-expanded', 'false')
      expect(await background(target)).toBe('rgba(0, 0, 0, 0)')
    }
    await stats.click()
    await page.screenshot({ path: '.demo-home/review/stats/after-' + theme + '-' + info.project.name + '.png' })
    await stats.click()
    await agents.click()
    await page.locator('[role="tree"][class*="_menuBody"]').getByText('MOBILE_AUDIT_NESTED_B · 两层目录父节点', { exact: true }).click()
    const parent = page.locator('[data-mobile-workbench="parent"]')
    await expect(parent).toBeVisible()
    await pressFeedback(page, parent)
    await page.mouse.up()
    await expect(parent).toHaveCount(0)
  }
  expect(new Set(colors).size).toBe(2)
})

test.describe('Chinese statistics', () => {
  test.use({ locale: 'zh-CN' })
  test('independent statistics dictionary localizes readings without changing the Host locale', async ({ page, isMobile }, info) => {
    test.skip(!isMobile)
    await page.goto(demoUrl())
    await page.locator('[data-composer-input]').waitFor({ state: 'attached' })
    const notice = page.getByRole('dialog')
    if (await notice.isVisible()) await notice.getByRole('button').last().click()
    await page.locator('[data-workbench-destination="sessions"]').click()
    await page.locator('[data-row-key^="session:"]').filter({ hasText: '开始手机界面审计' }).first().getByText('开始手机界面审计', { exact: true }).click()
    await page.locator('[data-workbench-destination="session"]').click()
    await page.locator('[data-mobile-workbench="stats"]').click()
    const panel = page.getByRole('dialog', { name: '会话统计', exact: true })
    await expect(panel).toBeVisible()
    await expect(panel.locator('[data-workbench-stat="usedTokens"] dt')).toHaveText('已用 token（参考）')
    await expect(panel.locator('[data-workbench-stat="decodeSpeed"] dt')).toHaveText('输出生成速率（会话平均）')
    await expect(panel.locator('[data-workbench-stat="ttft"] dt')).toHaveText('平均首 token 等待')
    await expect(value(page, 'decodeSpeed')).toContainText('tok/s')
    await expect(value(page, 'llmTime')).toContainText('秒')
    await page.screenshot({ path: '.demo-home/review/stats/after-zh-' + info.project.name + '.png' })
  })
})
