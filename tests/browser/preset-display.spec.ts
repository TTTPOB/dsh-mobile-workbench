import { expect, test, type Page } from '@playwright/test'
import { fixtureSession, demoUrl } from './demo.ts'

async function note(page: Page, label: string): Promise<void> {
  await page.locator('header button[class*="_moreButton"]').click()
  const info = page.locator('[data-mobile-workbench-session-preset]')
  await expect(info).toHaveText(label)
  await expect(info).toHaveAttribute('role', 'note')
  await expect(info.locator('button,[role="menuitem"]')).toHaveCount(0)
  await expect(info).not.toHaveAttribute('tabindex')
  await page.keyboard.press('Escape')
}
async function modeInfo(page: Page, expected: string): Promise<void> {
  await page.locator('[data-workbench-title-info]').click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.locator('p').last()).toContainText(expected)
  await dialog.getByRole('button').last().click()
}

test('English shipped name resolves through the public roster in the menu and information Modal', async ({ page, isMobile }) => {
  test.skip(!isMobile)
  await fixtureSession(page, { reuse: false })
  await note(page, 'Mode: Standard mode')
  await modeInfo(page, 'Standard mode')
})

test('custom name and switching between differently preset sessions never retain the old id or name', async ({ page, isMobile }) => {
  test.skip(!isMobile || process.env.DSH_PRESET_CUSTOM_TEST !== '1', 'Requires isolated audit-custom-internal declaration; no real profile is changed')
  await fixtureSession(page, { reuse: false })
  const standard = await page.evaluate(() => JSON.parse(localStorage.getItem('dsh.sessions.current')!).sessionId as string)
  await page.locator('[data-workbench-destination="sessions"]').click()
  await page.getByRole('button', { name: 'New session', exact: true }).first().click()
  await page.locator('[data-workbench-destination="session"]').click()
  await page.locator('[data-slot="conversation.hero.agentPreset"] button').click()
  await page.getByRole('menuitem').filter({ hasText: 'Review & 审查' }).click()
  await expect(page.locator('[data-slot="conversation.hero.agentPreset"]')).toHaveText('Review & 审查')
  await page.locator('[data-composer-input]').fill('Preset display custom session')
  await page.getByRole('button', { name: 'Send message', exact: true }).click()
  await page.locator('[data-workbench-title-info]').waitFor()
  const custom = await page.evaluate(() => JSON.parse(localStorage.getItem('dsh.sessions.current')!).sessionId as string)
  await note(page, 'Mode: Review & 审查')
  await modeInfo(page, 'Review & 审查')
  for (const [id, value] of [[standard, 'Standard mode'], [custom, 'Review & 审查']]) {
    await page.locator('[data-workbench-destination="sessions"]').click()
    await page.locator('[data-row-key="session:' + id + '"] [class*="_title"]').dblclick()
    await page.locator('[data-workbench-destination="session"]').click()
    await note(page, 'Mode: ' + value)
    await modeInfo(page, value!)
  }
})

test.describe('Chinese', () => {
  test.use({ locale: 'zh-CN' })
  test('built-in name and simplified label are localized, with no immutable-warning suffix', async ({ page, isMobile }) => {
    test.skip(!isMobile)
    await page.goto(demoUrl())
    await page.locator('[data-composer-input]').waitFor({ state: 'attached' })
    const notice = page.getByRole('dialog')
    if (await notice.isVisible()) await notice.getByRole('button').last().click()
    await page.locator('[data-workbench-destination="sessions"]').click()
    await page.locator('[data-row-key^="session:"]').filter({ hasText: '开始手机界面审计' }).first().locator('[class*="_title"]').dblclick()
    await page.locator('[data-workbench-destination="session"]').click()
    await note(page, '模式：标准模式')
    await modeInfo(page, '标准模式')
  })
})
