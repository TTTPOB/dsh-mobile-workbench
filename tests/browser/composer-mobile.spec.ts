import { expect, test, type Page } from '@playwright/test'
import { readFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { fixtureSession } from './demo.ts'

const root = fileURLToPath(new URL('../../', import.meta.url))
const pictures = resolve(root, '.demo-home/review/b')
const cardSelector = '[data-composer-card]'
const modelSelector = '[data-slot="conversation.input.model"] button[aria-haspopup="menu"]'

async function longModel(page: Page): Promise<void> {
  await page.locator(modelSelector).click()
  await page.getByRole('menuitem', { name: /^Model/ }).click()
  await page.getByRole('menuitemradio', { name: 'Mobile Audit — Extended Reasoning Preview', exact: false }).click()
  await expect(page.getByRole('menu')).toHaveCount(0)
}
async function screenshot(page: Page, name: string): Promise<void> {
  mkdirSync(pictures, { recursive: true })
  await page.screenshot({ path: resolve(pictures, name + '.png') })
}

test('compact native controls stay inside the card at 320, 360 and 390; desktop stays native', async ({ page, isMobile }, info) => {
  await fixtureSession(page)
  await longModel(page)
  const card = page.locator(cardSelector)
  const dock = page.locator('[data-composer-dock]')
  if (!isMobile) {
    await expect(card).not.toHaveAttribute('data-mobile-workbench-composer')
    await expect(page.locator('[data-mobile-compose-toggle]')).toHaveCount(0)
    await expect(dock).toBeVisible()
    await expect(page.locator(modelSelector)).toHaveText(/Mobile Audit — Extended Reasoning Preview/)
    await screenshot(page, 'after-desktop-1440')
    return
  }
  await expect(dock).toBeHidden()
  // The official localized caption remains intact even when CSS truncates its preview.
  await expect(page.locator('[data-slot="conversation.input.permission"] [class*="_triggerLabel"]')).toHaveText('Workspace Write')
  for (const width of [320, 360, 390]) {
    await page.setViewportSize({ width, height: 844 })
    await expect(page.locator('[data-mobile-compose-bar]')).toHaveCSS('height', '48px')
    const geometry = await page.locator('[data-mobile-compose-bar]').evaluate(bar => {
      const card = bar.closest('[data-composer-card]')!.getBoundingClientRect()
      const buttons = Array.from(bar.querySelectorAll('button')).filter(button => button.getBoundingClientRect().width > 0)
      const boxes = buttons.map(button => button.getBoundingClientRect())
      return {
        count: buttons.length,
        inside: boxes.every(box => box.left >= card.left && box.right <= card.right && box.left >= 0 && box.right <= innerWidth),
        overlap: boxes.some((a, i) => boxes.some((b, j) => i !== j && Math.min(a.right, b.right) - Math.max(a.left, b.left) > 0.5)),
        edges: buttons.every((button, i) => {
          const box = boxes[i]!
          return [box.left + 2, box.right - 2].every(x => button.contains(document.elementFromPoint(x, box.top + box.height / 2)))
        }),
      }
    })
    expect(geometry.count).toBeGreaterThanOrEqual(5)
    expect(geometry.inside).toBe(true)
    expect(geometry.overlap).toBe(false)
    expect(geometry.edges).toBe(true)
    expect((await card.boundingBox())!.height).toBeCloseTo(106, 0)
    expect((await page.locator('[data-composer-seat]').boundingBox())!.height).toBeCloseTo(110, 0)
    await screenshot(page, 'after-' + info.project.name + '-' + width)
  }
})

test('expanded editor keeps draft, selection and node identity; traps focus and closes menus before itself', async ({ page, isMobile }, info) => {
  test.skip(!isMobile, 'Desktop has no expanded mobile editor')
  await fixtureSession(page)
  const editor = page.locator('[data-composer-input]')
  await editor.click()
  await editor.fill('保留草稿 selection and identity')
  await expect(page.getByRole('button', { name: 'Send message', exact: true })).toBeEnabled()
  const handle = (await editor.elementHandle())!
  const selection = await editor.evaluate(element => {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT)
    const node = walker.nextNode()!
    getSelection()!.setBaseAndExtent(node, 1, node, 5)
    return { anchor: getSelection()!.anchorOffset, focus: getSelection()!.focusOffset, text: getSelection()!.toString() }
  })
  const expand = page.getByRole('button', { name: 'Expand editor', exact: true })
  await expand.tap()
  const card = page.locator(cardSelector)
  await expect(card).toHaveAttribute('role', 'dialog')
  await expect(card).toHaveAttribute('aria-modal', 'true')
  await expect(page.getByRole('dialog', { name: 'Edit draft', exact: true })).toBeVisible()
  expect(await handle.evaluate(element => element === document.querySelector('[data-composer-input]'))).toBe(true)
  expect(await page.evaluate(() => ({ anchor: getSelection()!.anchorOffset, focus: getSelection()!.focusOffset, text: getSelection()!.toString() }))).toEqual(selection)
  await page.getByRole('button', { name: 'Collapse editor', exact: true }).click()
  await expect(expand).toBeFocused()
  await expand.press('Enter')
  await expect(page.getByRole('button', { name: 'Collapse editor', exact: true })).toBeFocused()
  let visitedEditor = false
  for (const key of ['Tab', 'Shift+Tab']) for (let i = 0; i < 9; i++) {
    await page.keyboard.press(key)
    expect(await page.evaluate(() => !!document.activeElement?.closest('[data-composer-card]'))).toBe(true)
    visitedEditor ||= await editor.evaluate(element => document.activeElement === element)
  }
  expect(visitedEditor).toBe(true)
  await page.locator(modelSelector).click()
  await expect(page.getByRole('menu')).toBeVisible()
  expect(await page.getByRole('menu').evaluate(element => element.closest('[inert]') === null)).toBe(true)
  await page.keyboard.press('Escape')
  await expect(page.getByRole('menu')).toHaveCount(0)
  await expect(card).toHaveAttribute('aria-modal', 'true')
  await page.getByRole('button', { name: 'Add files or run commands', exact: true }).click()
  await expect(page.getByRole('listbox', { name: 'Trigger suggestions' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('listbox', { name: 'Trigger suggestions' })).toHaveCount(0)
  await expect(card).toHaveAttribute('aria-modal', 'true')
  await editor.dispatchEvent('keydown', { key: 'Escape', code: 'Escape', isComposing: true })
  await expect(card).toHaveAttribute('aria-modal', 'true')
  await screenshot(page, 'expanded-' + info.project.name)
  await page.keyboard.press('Escape')
  await expect(card).not.toHaveAttribute('role')
  await expect(expand).toBeFocused()
  await expect(editor).toHaveText('保留草稿 selection and identity')
  expect(await handle.evaluate(element => element === document.querySelector('[data-composer-input]'))).toBe(true)
  await editor.click()
  await editor.fill('')
  await expect(page.locator('[inert]')).toHaveCount(0)
})

test('plus closes both launcher and typed slash menus through native state', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Mobile-only plus workaround')
  await fixtureSession(page)
  const plus = page.getByRole('button', { name: 'Add files or run commands', exact: true })
  const menu = page.getByRole('listbox', { name: 'Trigger suggestions' })
  await plus.click()
  await expect(menu).toBeVisible()
  await plus.click()
  await expect(menu).toHaveCount(0)
  const editor = page.locator('[data-composer-input]')
  await editor.click()
  await editor.fill('/')
  await expect(menu).toBeVisible()
  await plus.click()
  await expect(menu).toHaveCount(0)
  await editor.click()
  await editor.fill('')
})

test('two image attachments keep separate 32px delete targets with working edge hits', async ({ page, isMobile }, info) => {
  test.skip(!isMobile, 'Desktop attachment geometry remains native')
  await fixtureSession(page)
  const image = readFileSync(resolve(root, 'assets/workbench-192.png'))
  await page.locator('input[type="file"]').setInputFiles([
    { name: 'one.png', mimeType: 'image/png', buffer: image },
    { name: 'two.png', mimeType: 'image/png', buffer: image },
  ])
  const previews = page.locator(cardSelector + ' img')
  const removes = page.locator(cardSelector + ' div:has(> button > img) > button[class*="_remove"]')
  await expect(previews).toHaveCount(2)
  await expect(removes).toHaveCount(2)
  for (const button of await removes.all()) {
    const box = (await button.boundingBox())!
    expect(box.width).toBeGreaterThanOrEqual(32)
    expect(box.height).toBeGreaterThanOrEqual(32)
    expect(await button.evaluate(element => {
      const r = element.getBoundingClientRect()
      return [r.left + 2, r.right - 2].every(x => element.contains(document.elementFromPoint(x, r.top + r.height / 2)))
    })).toBe(true)
  }
  await screenshot(page, 'attachments-' + info.project.name)
  const first = (await removes.first().boundingBox())!
  await page.mouse.click(first.x + 2, first.y + first.height / 2)
  await expect(previews).toHaveCount(1)
  await expect(previews).toHaveAttribute('alt', 'two.png')
  await removes.first().click()
  await expect(previews).toHaveCount(0)
})

test('iOS input/mirror/backdrop keep a floor, not a fixed font size', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Font floor is mobile-only')
  await fixtureSession(page)
  for (const [size, expected] of [[12, 16], [16, 16], [17, 17]]) {
    const fonts = await page.evaluate(size => {
      document.documentElement.setAttribute('data-mobile-nav-ios', '')
      document.body.style.setProperty('--dsh-content-font-size', size + 'px')
      const card = document.querySelector('[data-composer-card]')!
      // Lexical no longer mounts mirrors; these probes exercise the same inherited CSS tokens.
      const probes = ['data-input-mirror', 'data-input-backdrop'].map(marker => {
        const element = document.createElement('div'); element.setAttribute(marker, ''); card.append(element); return element
      })
      const values = [document.querySelector('[data-composer-input]')!, ...probes].map(element => getComputedStyle(element).fontSize)
      probes.forEach(element => element.remove())
      return values
    }, size!)
    expect(fonts).toEqual([expected + 'px', expected + 'px', expected + 'px'])
  }
})

test('long drafts scroll inside the card when the visual viewport shrinks', async ({ page, isMobile }, info) => {
  test.skip(!isMobile, 'Mobile viewport geometry')
  await fixtureSession(page)
  const editor = page.locator('[data-composer-input]')
  await editor.click()
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(page.locator('html')).toHaveCSS('--mobile-compose-vv-width', '390px')
  await editor.fill(Array.from({ length: 16 }, (_, i) => '第' + i + '行：长草稿保持内部滚动，发送完整可用。').join(String.fromCharCode(10)))
  await expect(page.getByRole('button', { name: 'Send message', exact: true })).toBeEnabled()
  await page.setViewportSize({ width: 390, height: 520 })
  await expect(page.locator('html')).toHaveAttribute('data-mobile-workbench-keyboard', 'true')
  const geometry = await page.locator('[data-input-scroll]').evaluate(element => ({ client: element.clientHeight, scroll: element.scrollHeight }))
  expect(geometry.scroll).toBeGreaterThan(geometry.client)
  const send = (await page.getByRole('button', { name: 'Send message', exact: true }).boundingBox())!
  expect(send.y + send.height).toBeLessThanOrEqual(520)
  await screenshot(page, 'long-draft-' + info.project.name)
  await editor.click(); await editor.fill('')
})
