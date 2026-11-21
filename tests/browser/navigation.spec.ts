import { expect, test } from '@playwright/test'
import { fixtureSession } from './demo.ts'

test('fixture completes and native pages remain accessible', async ({ page, isMobile }) => {
  await fixtureSession(page)
  const nav = page.locator('[data-mobile-workbench="navigation"]')
  if (!isMobile) {
    await expect(nav).toHaveCount(0)
    await expect(page.locator('[data-row-key^="session:"]').filter({ hasText: '开始手机界面审计' }).first()).toBeVisible()
    await expect(page.locator('[data-composer-input]')).toBeVisible()
    return
  }

  await expect(nav).toBeVisible()
  const sidebar = page.locator('[data-shell-overlay]').locator('..').locator(':scope > [class*="_sidebarCol"]')
  for (const destination of ['session', 'sessions', 'session', 'files', 'sessions', 'session']) {
    const button = nav.locator('[data-workbench-destination="' + destination + '"]')
    await button.tap()
    await expect(button).toHaveAttribute('aria-current', 'page')
    await expect(page.locator('html')).toHaveAttribute('data-mobile-workbench-page', destination)
    if (destination === 'sessions') {
      await expect(page.locator('[data-row-key^="session:"]').filter({ hasText: '开始手机界面审计' }).first()).toBeVisible()
      const viewportWidth = await page.evaluate(() => window.innerWidth)
      await expect.poll(async () => {
        const bounds = await sidebar.boundingBox()
        return bounds && { x: bounds.x, width: bounds.width }
      }).toEqual({ x: 0, width: viewportWidth })
    } else if (destination === 'session') {
      await expect(page.locator('[data-composer-input]')).toBeVisible()
    } else {
      await expect(page.locator('[data-sidebar-right-panel][data-sidebar-right-open="true"]')).toBeVisible()
      await expect(page.getByText('Workspace files', { exact: true })).toBeVisible()
    }
  }
})
