import { expect, test } from '@playwright/test'
import { fixtureSession } from './demo.ts'

test('two-row header, touch boxes, native view and desktop invariance', async ({ page, isMobile }, info) => {
  await fixtureSession(page, { reuse: false })
  const header = page.locator('header:has([data-conversation-tabs])')
  const title = page.locator('[data-workbench-title-info]')
  if (!isMobile) {
    await expect(title).toHaveCount(0)
    await expect(header.locator('[data-conversation-tabs]')).toBeVisible()
    await expect(page.locator('[data-composer-input]')).toBeVisible()
    return
  }
  await expect(title).toBeVisible()
  await expect(title.locator('span')).toHaveCSS('word-break', 'normal')
  await expect(title.locator('span')).toHaveCSS('overflow-wrap', 'anywhere')
  await expect(page.locator('[data-workbench-view="chat"]')).toHaveAttribute('aria-selected', 'true')
  await page.locator('[data-workbench-view="trajectory"]').click()
  await expect(page.locator('[data-workbench-view="trajectory"]')).toHaveAttribute('aria-selected', 'true')
  await page.locator('[data-workbench-view="chat"]').click()
  const geometry = await header.evaluate(el => {
    const rect = el.getBoundingClientRect()
    const buttons = [...el.querySelectorAll<HTMLButtonElement>('button')].filter(b => b.getBoundingClientRect().width > 0)
    const boxes = buttons.map(b => ({ label: b.getAttribute('aria-label') ?? b.textContent, x: b.getBoundingClientRect().x, y: b.getBoundingClientRect().y, width: b.getBoundingClientRect().width, height: b.getBoundingClientRect().height }))
    return { height: rect.height, overflow: document.documentElement.scrollWidth > innerWidth, boxes }
  })
  expect(geometry.height).toBeLessThanOrEqual(112)
  expect(geometry.overflow).toBe(false)
  for (const box of geometry.boxes) { expect(box.width, String(box.label)).toBeGreaterThanOrEqual(44); expect(box.height).toBeGreaterThanOrEqual(44) }
  for (let i = 0; i < geometry.boxes.length; i++) for (const other of geometry.boxes.slice(i + 1)) {
    const box = geometry.boxes[i]!
    const overlapX = Math.min(box.x + box.width, other.x + other.width) - Math.max(box.x, other.x)
    const overlapY = Math.min(box.y + box.height, other.y + other.height) - Math.max(box.y, other.y)
    expect(overlapX > .5 && overlapY > .5, String(box.label) + ' overlaps ' + other.label).toBe(false)
  }
  await expect(title).toHaveAccessibleName(/开始手机界面审计.*View session information/)
  await page.screenshot({ path: '.demo-home/review/a/after-root-' + info.project.name + '.png' })
})

test('statistics uses a bounded dialog and all dismissal paths return focus', async ({ page, isMobile }, info) => {
  test.skip(!isMobile)
  await fixtureSession(page, { reuse: false })
  const stats = page.locator('[data-mobile-workbench="stats"]')
  const panel = page.getByRole('dialog', { name: 'Session statistics', exact: true })
  await stats.click()
  await expect(stats).toHaveAttribute('aria-expanded', 'true')
  await expect(panel).toBeVisible()
  await expect(panel.getByRole('menuitem')).toHaveCount(0)
  await expect(panel.locator('dt').first()).toHaveText('Used tokens (reference)')
  for (const heading of ['Context occupancy', 'Session activity', 'Tokens']) await expect(panel.getByRole('heading', { name: heading, exact: heading !== 'Context occupancy' })).toBeVisible()
  const box = await panel.boundingBox()
  expect(box!.x).toBeGreaterThanOrEqual(12)
  expect(box!.x + box!.width).toBeLessThanOrEqual(page.viewportSize()!.width - 12)
  expect(box!.height).toBeLessThanOrEqual(page.viewportSize()!.height * .6)
  await page.screenshot({ path: '.demo-home/review/a/after-stats-' + info.project.name + '.png' })
  await page.keyboard.press('Escape')
  await expect(panel).toHaveCount(0)
  await expect(stats).toBeFocused()
  await stats.click(); await stats.click()
  await expect(panel).toHaveCount(0)
  await expect(stats).toBeFocused()
  await stats.click()
  await page.mouse.click(page.viewportSize()!.width - 4, 120)
  await expect(panel).toHaveCount(0)
  await expect(stats).toBeFocused()
  await stats.click(); await page.locator('[data-workbench-title-info]').click()
  await expect(panel).toHaveCount(0)
  await expect(page.getByRole('dialog', { name: 'Session information' })).toBeVisible()
})

test('localized public information Modal keeps card clicks and restores title focus on three exits', async ({ page, isMobile }, info) => {
  test.skip(!isMobile)
  await fixtureSession(page, { reuse: false })
  const title = page.locator('[data-workbench-title-info]')
  const dialog = page.getByRole('dialog', { name: 'Session information', exact: true })
  for (const close of ['button', 'escape', 'mask']) {
    await title.click()
    await expect(dialog).toBeVisible()
    await expect(dialog).toContainText('Mode: Standard mode')
    await expect(dialog).not.toContainText('关闭')
    await dialog.click({ position: { x: 8, y: 80 } })
    await expect(dialog).toBeVisible()
    if (close === 'button') {
      await page.screenshot({ path: '.demo-home/review/a/after-info-' + info.project.name + '.png' })
      await dialog.getByRole('button', { name: 'Close', exact: true }).last().click()
    } else if (close === 'escape') await page.keyboard.press('Escape')
    else await page.mouse.click(4, 4)
    await expect(dialog).toHaveCount(0)
    await expect(title).toBeFocused()
  }
})

test('page history pushes once, switches without stacking, and bottom return consumes the entry', async ({ page, isMobile }) => {
  test.skip(!isMobile)
  await page.goto('data:text/html,previous-site')
  await fixtureSession(page, { reuse: false })
  const nav = (destination: string) => page.locator('[data-workbench-destination="' + destination + '"]')
  await expect.poll(() => page.evaluate(() => history.state?.mobileWorkbenchPage)).toBeUndefined()
  const initial = await page.evaluate(() => history.length)
  await nav('sessions').click()
  await expect(nav('sessions')).toHaveAttribute('aria-current', 'page')
  expect(await page.evaluate(() => history.length)).toBeLessThanOrEqual(initial + 1)
  const pageLength = await page.evaluate(() => history.length)
  await nav('files').click()
  await expect(nav('files')).toHaveAttribute('aria-current', 'page')
  expect(await page.evaluate(() => history.length)).toBe(pageLength)
  await page.goBack()
  await expect(nav('session')).toHaveAttribute('aria-current', 'page')
  await nav('sessions').click()
  await nav('session').click()
  await expect.poll(() => page.evaluate(() => history.state?.mobileWorkbenchPage)).toBeUndefined()
  await page.evaluate(() => history.replaceState({ ...history.state, testPrevious: true }, ''))
  await nav('files').click()
  await nav('session').click()
  await expect.poll(() => page.evaluate(() => history.state?.testPrevious)).toBe(true)
  await nav('sessions').click()
  await page.goBack()
  await expect(nav('session')).toHaveAttribute('aria-current', 'page')
  await page.goBack()
  await expect(page).toHaveURL('data:text/html,previous-site')
})

test('selected and unselected text meets contrast after ancestor alpha composition in both themes', async ({ page, isMobile }) => {
  test.skip(!isMobile)
  await fixtureSession(page, { reuse: false })
  // Settings persist on the isolated Host; an earlier spec may have explicitly selected Light.
  // Restore System through the real UI so emulateMedia actually tests both palettes.
  await page.locator('[data-workbench-destination="sessions"]').click()
  await page.getByRole('button', { name: 'Account menu', exact: true }).click()
  await page.getByRole('menuitem', { name: 'Settings', exact: true }).click()
  await page.getByRole('button', { name: 'System', exact: true }).click()
  await page.locator('[data-shortcut-modal="settings"]').getByRole('button', { name: 'Close', exact: true }).click()
  await page.locator('[data-workbench-destination="session"]').click()
  const colors: string[] = []
  for (const theme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme: theme })
    if (colors.length) await expect.poll(() => page.locator('[data-workbench-view="chat"]').evaluate(n => getComputedStyle(n).color)).not.toBe(colors[0])
    // Measure the settled page-entry fade without waiting for unrelated native animations.
    await expect.poll(() => page.locator('[data-workbench-view="chat"]').evaluate(node => {
      for (let current: Element | null = node; current; current = current.parentElement) {
        if (getComputedStyle(current).opacity !== '1') return false
      }
      return true
    })).toBe(true)
    colors.push(await page.locator('[data-workbench-view="chat"]').evaluate(n => getComputedStyle(n).color))
    await page.screenshot({ path: '.demo-home/review/a/after-' + theme + '-' + page.viewportSize()!.width + '.png' })
    const ratios = await page.locator('[data-workbench-view], [data-workbench-destination]').evaluateAll(elements => {
      type RGB = [number, number, number, number]
      const rgba = (value: string): RGB => { const n = value.match(/[\d.]+/g)?.map(Number) ?? []; return [n[0] ?? 0, n[1] ?? 0, n[2] ?? 0, n[3] ?? 1] }
      const blend = (a: RGB, b: RGB): RGB => [a[0]*a[3]+b[0]*(1-a[3]), a[1]*a[3]+b[1]*(1-a[3]), a[2]*a[3]+b[2]*(1-a[3]), 1]
      const luminance = (c: RGB): number => c.slice(0,3).map(n => n/255).map(n => n <= .04045 ? n/12.92 : ((n+.055)/1.055)**2.4).reduce((sum,n,i) => sum+n*[.2126,.7152,.0722][i]!,0)
      return elements.map(el => {
        let bg: RGB = [255,255,255,1], opacity = 1
        const chain: Element[] = []
        for (let node: Element | null = el; node; node = node.parentElement) chain.unshift(node)
        for (const node of chain) { const style = getComputedStyle(node); opacity *= Number(style.opacity); const layer = rgba(style.backgroundColor); layer[3] *= opacity; bg = blend(layer,bg) }
        const fg = rgba(getComputedStyle(el).color); fg[3] *= opacity
        const a = luminance(blend(fg,bg)), b = luminance(bg)
        return { text: el.textContent, ratio: (Math.max(a,b)+.05)/(Math.min(a,b)+.05) }
      })
    })
    for (const value of ratios) expect(value.ratio, theme + ' ' + value.text).toBeGreaterThanOrEqual(4.5)
  }
  expect(new Set(colors).size, 'both real theme palettes were tested').toBe(2)
})
