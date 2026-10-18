import { expect, test, type Page } from '@playwright/test'
import { fixtureSession } from './demo.ts'

async function sessions(page: Page): Promise<void> {
  if (await page.locator('[data-mobile-workbench="navigation"]').isVisible()) {
    await page.locator('[data-workbench-destination="sessions"]').click()
  }
}

async function settings(page: Page): Promise<void> {
  await sessions(page)
  await page.getByRole('button', { name: 'Account menu', exact: true }).click()
  await page.getByRole('menuitem', { name: 'Settings', exact: true }).click()
  await expect(page.locator('[data-shortcut-modal="settings"]')).toBeVisible()
}

test('settings and shortcuts keep native surface tokens and stable mobile geometry', async ({ page }, info) => {
  await fixtureSession(page)
  await settings(page)
  const mobile = info.project.name.startsWith('mobile')
  const modal = page.locator('[data-shortcut-modal="settings"]')
  await expect(modal).toHaveCSS('border-radius', '28px')
  await expect.poll(() => modal.evaluate(n => getComputedStyle(n).animationDuration)).toBe(mobile ? '0.2s' : '0s')
  expect(await modal.evaluate(n => getComputedStyle(n).transform)).toBe('none')
  expect(await page.evaluate(() => history.state?.mobilePanelExit)).not.toBe(true)
  if (mobile) {
    const close = await modal.getByRole('button', { name: 'Close', exact: true }).boundingBox()
    expect(close?.width).toBeGreaterThanOrEqual(44)
    expect(close?.height).toBeGreaterThanOrEqual(44)
  }
  await modal.getByRole('button', { name: 'Edit shortcuts', exact: true }).click()
  const shortcut = page.locator('[data-shortcut-modal="shortcuts"]')
  await expect(shortcut).toBeVisible()
  await expect(shortcut).toHaveCSS('border-radius', mobile ? '28px' : '24px')
  if (mobile) {
    await expect(shortcut).toHaveCSS('animation-name', 'none')
    await expect(shortcut.locator('[class*="_searchRow"]')).toBeHidden()
    expect(await shortcut.evaluate(n => n.contains(document.activeElement) && document.activeElement?.tagName === 'INPUT')).toBe(false)
    expect(await shortcut.evaluate(n => getComputedStyle(n.parentElement!.querySelector('[class*="_mask"]')!, '::after').backgroundColor)).toBe('rgba(0, 0, 0, 0)')
  } else {
    await expect(shortcut.locator('[class*="_searchRow"]')).toBeVisible()
  }
  await shortcut.getByRole('button', { name: 'Close keyboard shortcuts', exact: true }).click()
  await expect(modal).toBeVisible()
  await modal.getByRole('button', { name: 'Close', exact: true }).click()
  await expect(modal).toHaveCount(0)
})

test('theme-color remains unique and follows Host light and dark preferences', async ({ page }) => {
  await fixtureSession(page)
  await settings(page)
  const metas = page.locator('meta[name="theme-color"]')
  await expect(metas).toHaveCount(1)
  for (const name of ['Dark', 'Light']) {
    await page.getByRole('button', { name, exact: true }).click()
    await expect.poll(() => page.evaluate(() => document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.content === getComputedStyle(document.body).backgroundColor)).toBe(true)
    await expect(metas).toHaveCount(1)
  }
})

test('normal and expanded editing remain usable with the same native editor', async ({ page }, info) => {
  await fixtureSession(page)
  const editor = page.locator('[data-composer-input="true"]')
  await editor.fill('Effects lifecycle draft')
  if (info.project.name.startsWith('mobile')) {
    await editor.evaluate(node => { node.setAttribute('data-effects-editor', 'same') })
    await page.locator('[data-mobile-compose-toggle]').click()
    await editor.click()
    await editor.press('End')
    await editor.pressSequentially(' expanded')
    await expect(editor).toHaveText('Effects lifecycle draft expanded')
    await expect(editor).toHaveAttribute('data-effects-editor', 'same')
    await page.locator('[data-mobile-compose-header] button').click()
  }
  await editor.fill('')
  if (!info.project.name.startsWith('mobile')) await expect(page.locator('[data-mobile-workbench="navigation"]')).toHaveCount(0)
})

test('native model menu left anchor restores on mobile exit', async ({ page }, info) => {
  await fixtureSession(page)
  const trigger = page.locator('[data-slot="conversation.input.model"] button[aria-haspopup="menu"]')
  await trigger.click()
  const id = await trigger.getAttribute('aria-controls')
  expect(id).toBeTruthy()
  const menu = page.locator('[id="' + id + '"]')
  await expect(menu).toBeVisible()
  if (info.project.name.startsWith('mobile')) {
    const mobileLeft = await menu.evaluate(n => n.style.left)
    await page.setViewportSize({ width: 1440, height: 900 })
    await expect(page.locator('[data-mobile-nav="frame"]')).toHaveCount(0)
    await expect.poll(() => menu.evaluate(n => n.style.left)).not.toBe(mobileLeft)
    const box = await menu.boundingBox()
    expect(box!.x).toBeGreaterThanOrEqual(0)
    expect(box!.x + box!.width).toBeLessThanOrEqual(1440)
  }
  await page.keyboard.press('Escape')
})

test('optional market overrides stay local and restore original inline styles on exit', async ({ page }, info) => {
  await fixtureSession(page)
  await page.evaluate(() => {
    const create = (market: boolean): HTMLDivElement => {
      const root = document.createElement('div')
      root.setAttribute('data-effects-fixture', market ? 'market' : 'foreign')
      if (market) root.setAttribute('data-dsh-market-root', '')
      root.innerHTML = '<div class="fixture_irow" style="gap:17px!important;flex-wrap:nowrap"><div style="flex:0 0 auto"><span class="fixture_spec" style="white-space:pre">package</span></div></div>'
      document.body.append(root)
      return root
    }
    create(true); create(false)
  })
  const row = page.locator('[data-effects-fixture="market"] .fixture_irow')
  const foreign = page.locator('[data-effects-fixture="foreign"] .fixture_irow')
  await expect(foreign).toHaveCSS('gap', '17px')
  if (info.project.name.startsWith('mobile')) {
    await expect(row).toHaveCSS('gap', '4px 10px')
    await page.setViewportSize({ width: 1440, height: 900 })
  }
  await expect(row).toHaveCSS('gap', '17px')
  await expect(row).toHaveCSS('flex-wrap', 'nowrap')
  expect(await row.evaluate(n => n.style.getPropertyPriority('gap'))).toBe('important')
  await expect(row.locator('.fixture_spec')).toHaveCSS('white-space', 'pre')
})

test('global central panels own one Back entry without intercepting modal history', async ({ page }, info) => {
  await fixtureSession(page)
  await sessions(page)
  if (info.project.name.startsWith('mobile')) {
    await page.getByRole('button', { name: 'Account menu', exact: true }).click()
    await page.getByRole('menuitem', { name: 'Automation tasks', exact: true }).click()
  } else await page.getByRole('button', { name: 'Automation tasks', exact: true }).click()
  if (info.project.name.startsWith('mobile')) {
    await expect.poll(() => page.evaluate(() => history.state?.mobilePanelExit)).toBe(true)
    await page.evaluate(() => history.back())
    await expect.poll(() => page.evaluate(() => history.state?.mobilePanelExit)).not.toBe(true)
    await expect(page.locator('html')).toHaveAttribute('data-mobile-workbench-page', 'sessions')
    await sessions(page)
    // Exercise the supported native Plugins fallback instead of the optional modal command.
    await page.evaluate(() => {
      document.documentElement.removeAttribute('data-mobile-workbench-active')
      document.querySelector<HTMLButtonElement>('button[aria-label="Plugins"]')!.click()
    })
    await expect.poll(() => page.evaluate(() => history.state?.mobilePanelExit)).toBe(true)
    await page.evaluate(() => history.back())
    await expect(page.locator('html')).toHaveAttribute('data-mobile-workbench-page', 'sessions')
  } else {
    expect(await page.evaluate(() => history.state?.mobilePanelExit)).not.toBe(true)
  }
})
