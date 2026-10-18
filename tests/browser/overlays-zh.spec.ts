import { expect, test } from '@playwright/test'
import { demoUrl } from './demo.ts'

test.use({ locale: 'zh-CN' })
test('Chinese navigation labels fit at 12px and information follows locale', async ({ page, isMobile }, info) => {
  test.skip(!isMobile)
  await page.goto(demoUrl())
  await page.locator('[data-composer-input]').waitFor({ state: 'attached' })
  const notice = page.getByRole('dialog')
  if (await notice.isVisible()) await notice.getByRole('button').last().click()
  await page.locator('[data-workbench-destination="sessions"]').click()
  await page.locator('[data-row-key^="session:"]').filter({ hasText: '开始手机界面审计' }).first().getByText('开始手机界面审计', { exact: true }).click()
  await page.locator('[data-workbench-destination="session"]').click()
  for (const [destination, text] of [['sessions', '会话列表'], ['session', '会话'], ['files', '工作区']]) {
    const label = page.locator('[data-workbench-destination="' + destination + '"] > span')
    await expect(label).toHaveText(text!)
    expect(await label.evaluate(n => ({ size: getComputedStyle(n).fontSize, fit: n.scrollWidth <= n.clientWidth }))).toEqual({ size: '12px', fit: true })
  }
  const title = page.locator('[data-workbench-title-info]')
  await expect(title).toHaveAccessibleName(/开始手机界面审计.*查看会话信息/)
  await title.click()
  const dialog = page.getByRole('dialog', { name: '会话信息', exact: true })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('button', { name: '关闭', exact: true }).last()).toBeVisible()
  await page.screenshot({ path: '.demo-home/review/a/after-info-zh-' + info.project.name + '.png' })
})
