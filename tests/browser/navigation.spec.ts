import { expect, test, type Page } from '@playwright/test'
import { fixtureSession } from './demo.ts'

async function sidebarRules(page: Page): Promise<{ selector: string; matched: boolean }[]> {
  return page.evaluate(() => {
    const rules = (list: CSSRuleList): string[] => Array.from(list).flatMap(rule => {
      if (rule instanceof CSSStyleRule) {
        // CSSOM joins the top-level selector arms with a comma and a space.
        return rule.selectorText.split(/, (?=html|\[data-)/)
      }
      return rule instanceof CSSGroupingRule ? rules(rule.cssRules) : []
    })
    const selectors = Array.from(document.querySelectorAll<HTMLStyleElement>('style[data-plugin-css^="dsh-web-mobile/"]'))
      .flatMap(style => style.sheet ? rules(style.sheet.cssRules) : [])
      .filter(selector => /_sidebarCol|_rowActions|data-mobile-management-(?:anchor|panels)|data-conversation-tabs.*aria-haspopup/.test(selector))
    return [...new Set(selectors)].map(selector => ({
      selector,
      matched: document.querySelector(selector.replace(/::(?:before|after)$/, '')) !== null,
    }))
  })
}

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
  const sidebar = page.locator('[data-mobile-nav="frame"] > [class*="_sidebarCol"]')
  const sidebarRoot = sidebar.locator(':scope > [data-slot="sidebar"] > [class*="_root"]:has([class*="_regionArea"])')
  let captured = false
  const unmatched = new Set<string>()
  const matched = new Set<string>()
  const checkStructure = async (): Promise<void> => {
    for (const result of await sidebarRules(page)) (result.matched ? matched : unmatched).add(result.selector)
  }
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
      await expect.poll(async () => {
        const bounds = await sidebarRoot.boundingBox()
        return bounds && { x: bounds.x, width: bounds.width }
      }, { message: 'Native sessions root must fill the viewport' }).toEqual({ x: 0, width: viewportWidth })
      const background = await sidebar.evaluate(node => getComputedStyle(node).backgroundColor)
      const alpha = await page.evaluate(color => {
        const ctx = document.createElement('canvas').getContext('2d')!
        ctx.fillStyle = color
        ctx.fillRect(0, 0, 1, 1)
        return ctx.getImageData(0, 0, 1, 1).data[3]
      }, background)
      expect(alpha, 'Sessions column background: ' + background).toBe(255)
      if (!captured) {
        await page.screenshot({ path: '.validation/sessions-' + viewportWidth + '.png', animations: 'disabled' })
        captured = true
      }
    } else if (destination === 'session') {
      await expect(page.locator('[data-composer-input]')).toBeVisible()
    } else {
      await expect(page.locator('[data-sidebar-right-panel][data-sidebar-right-open="true"]')).toBeVisible()
      await expect(page.getByText('Workspace files', { exact: true })).toBeVisible()
    }
    await checkStructure()
  }
  await nav.locator('[data-workbench-destination="sessions"]').tap()
  const account = page.locator('[data-mobile-management-anchor] > button')
  await account.tap()
  await page.getByRole('menuitem', { name: 'Automation tasks', exact: true }).tap()
  await expect(page.locator('[data-mobile-management-surface="panel"]')).toBeVisible()
  await checkStructure()
  expect(matched.size).toBeGreaterThan(0)
  expect([...unmatched].filter(selector => !matched.has(selector)), 'Unmatched plugin selectors in real Host DOM').toEqual([])
})
