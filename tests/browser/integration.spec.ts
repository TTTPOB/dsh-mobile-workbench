import { expect, test } from '@playwright/test'
import { fixtureSession } from './demo.ts'

for (const destination of ['sessions', 'files'] as const) {
  for (const panel of ['Automation tasks', 'Plugins'] as const) {
    test(destination + ' → ' + panel + ' → Back preserves both navigation layers', async ({ page, isMobile }) => {
      test.skip(!isMobile)
      await page.goto('data:text/html,integration-previous-site')
      await fixtureSession(page)
      await page.locator('[data-workbench-destination="' + destination + '"]').click()
      await expect(page.locator('html')).toHaveAttribute('data-mobile-workbench-page', destination)
      if (panel === 'Plugins' || destination === 'files') {
        // Exercise the supported main-panel fallback, not the optional plugin-manager modal.
        await page.evaluate(name => {
          if (name === 'Plugins') document.documentElement.removeAttribute('data-mobile-workbench-active')
          document.querySelector<HTMLButtonElement>('button[aria-label="' + name + '"]')!.click()
        }, panel)
      } else await page.getByRole('button', { name: panel, exact: true }).click()
      await expect.poll(() => page.evaluate(() => history.state?.mobilePanelExit)).toBe(true)
      await page.goBack()
      await expect.poll(() => page.evaluate(() => history.state?.mobilePanelExit)).not.toBe(true)
      await expect(page.locator('html')).toHaveAttribute('data-mobile-workbench-page', destination)
      await page.goBack()
      await expect(page.locator('html')).toHaveAttribute('data-mobile-workbench-page', 'session')
      await page.goBack()
      await expect(page).toHaveURL('data:text/html,integration-previous-site')
    })
  }
}

test('shared helper reveals historical audit marker after a later virtualized turn', async ({ page, isMobile }) => {
  test.skip(!isMobile)
  await fixtureSession(page, { reuse: false })
  const sessionId = await page.evaluate(() => JSON.parse(localStorage.getItem('dsh.sessions.current')!).sessionId as string)
  await page.locator('[data-composer-input]').fill('演示多层子智能体')
  await page.getByRole('button', { name: 'Send message', exact: true }).click()
  await expect(page.getByText(/MOBILE_AUDIT_NESTED_ROOT_(?:NOT_)?COMPLETE/).last()).toBeVisible({ timeout: 60_000 })
  await fixtureSession(page, { sessionId })
  await expect(page.locator('[data-workbench-title-info]')).toContainText('开始手机界面审计')
  await expect(page.getByRole('menu')).toHaveCount(0)
})
