import { expect, test, type Page } from '@playwright/test'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { demoUrl, fixtureSession } from './demo.ts'

const pictures = fileURLToPath(new URL('../../.demo-home/review/b2/final/', import.meta.url))
const editorSelector = '[data-composer-input]'
const modelSelector = '[data-slot="conversation.input.model"] button[aria-haspopup="menu"]'
const permissionSelector = '[data-slot="conversation.input.permission"] button'
const sendSelector = '[data-composer-card] button[class*="_primary"]'

function geometry({ modelSelector, permissionSelector, sendSelector, editorSelector }: { modelSelector: string; permissionSelector: string; sendSelector: string; editorSelector: string }) {
  const get = (selector: string) => document.querySelector<HTMLElement>(selector)!
  const card = get('[data-composer-card]').getBoundingClientRect()
  const nav = get('[data-mobile-workbench="navigation"]').getBoundingClientRect()
  const plus = get('[data-mobile-compose-bar] button[class*="_add"]').getBoundingClientRect()
  const model = get(modelSelector).getBoundingClientRect()
  const permission = get(permissionSelector).getBoundingClientRect()
  const send = get(sendSelector).getBoundingClientRect()
  const corner = get('[data-mobile-compose-toggle]').getBoundingClientRect()
  const scroll = get('[data-input-scroll]').getBoundingClientRect()
  const placeholder = get('[data-composer-placeholder]').getBoundingClientRect()
  const buttons = [get('[data-mobile-compose-bar] button[class*="_add"]'), get(modelSelector), get(permissionSelector), get(sendSelector), get('[data-mobile-compose-toggle]')]
  const boxes = buttons.map(button => button.getBoundingClientRect())
  const navButtons = [...get('[data-mobile-workbench="navigation"]').querySelectorAll('button')].map(e => e.getBoundingClientRect())
  return {
    width: innerWidth, card: card.toJSON(), nav: nav.toJSON(), scroll: scroll.toJSON(), placeholder: placeholder.toJSON(),
    gaps: { left: card.left, right: innerWidth - card.right, bottom: nav.top - card.bottom },
    hitSizes: boxes.map(box => ({ width: box.width, height: box.height })),
    edges: buttons.every((button, i) => [boxes[i]!.left + 2, boxes[i]!.right - 2].every(x => button.contains(document.elementFromPoint(x, boxes[i]!.top + boxes[i]!.height / 2)))),
    overlap: boxes.some((a, i) => boxes.some((b, j) => i !== j && Math.min(a.right, b.right) - Math.max(a.left, b.left) > .5 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > .5)),
    modelWidth: model.width,
    axes: {
      textAndPlus: get(editorSelector).getBoundingClientRect().left + parseFloat(getComputedStyle(get(editorSelector)).paddingLeft) - (plus.left + plus.width / 2),
      cornerAndSend: corner.left + corner.width / 2 - send.left - send.width / 2,
      middle: (permission.left + model.right) / 2 - (navButtons[1]!.left + navButtons[1]!.width / 2),
      navLeft: card.left - navButtons[0]!.left, navRight: card.right - navButtons[2]!.right,
    },
    border: getComputedStyle(get(sendSelector)).borderColor,
  }
}

test('B2 middle, outer gaps, placeholder and targets match in en/zh 320/360/390 light/dark', async ({ page, browser, isMobile }, info) => {
  test.skip(!isMobile, 'The desktop native composer is covered by composer-mobile.spec.ts')
  test.setTimeout(90_000)
  await fixtureSession(page)
  await page.locator(modelSelector).click()
  await page.getByRole('menuitem', { name: /^Model/ }).click()
  await page.getByRole('menuitemradio', { name: 'Mobile Audit — Extended Reasoning Preview', exact: false }).click()
  const session = await page.evaluate(() => localStorage.getItem('dsh.sessions.current')!)
  const samples = []
  mkdirSync(pictures, { recursive: true })
  for (const locale of ['en-US', 'zh-CN']) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, locale })
    await context.addInitScript(value => localStorage.setItem('dsh.sessions.current', value), session)
    const p = await context.newPage()
    try {
      await p.goto(demoUrl())
      await expect(p.locator('[data-composer-card]')).toHaveAttribute('data-mobile-workbench-composer', 'true')
      await expect(p.locator(editorSelector)).toHaveAttribute('contenteditable', 'true')
      await p.locator(editorSelector).tap()
      await p.locator(editorSelector).fill('')
      for (const theme of ['light', 'dark'] as const) {
        await p.emulateMedia({ colorScheme: theme })
        await p.waitForFunction(dark => document.body.hasAttribute('data-ds-dark-theme') === dark, theme === 'dark')
        for (const width of [320, 360, 390]) {
          await p.setViewportSize({ width, height: 844 })
          await expect(p.locator('[data-mobile-compose-bar]')).toHaveCSS('height', '40px')
          await expect(p.locator('[data-composer-placeholder]')).toBeVisible()
          const sample = await p.evaluate(geometry, { modelSelector, permissionSelector, sendSelector, editorSelector })
          samples.push({ locale, theme, ...sample })
          expect(sample.gaps.left).toBeCloseTo(8, 0)
          // The native chat body's 2px scrollbar gutter remains host-owned.
          expect(sample.gaps.right).toBeGreaterThanOrEqual(7.5)
          expect(sample.gaps.right).toBeLessThanOrEqual(10.5)
          expect(sample.gaps.bottom).toBeCloseTo(8, 0)
          expect(sample.hitSizes.every(size => size.width >= 40 && size.height >= 40)).toBe(true)
          expect(sample.edges).toBe(true)
          expect(sample.overlap).toBe(false)
          expect(sample.placeholder.bottom).toBeLessThanOrEqual(sample.scroll.bottom + .5)
          expect(Math.abs(sample.axes.textAndPlus)).toBeLessThan(.5)
          expect(Math.abs(sample.axes.cornerAndSend)).toBeLessThan(.5)
          expect(Math.abs(sample.axes.middle)).toBeLessThan(2.5)
          expect(Math.abs(sample.axes.navLeft)).toBeLessThan(.5)
          expect(Math.abs(sample.axes.navRight)).toBeLessThan(2.5)
          expect(sample.border).toBe('rgba(0, 0, 0, 0)')
          expect(await p.locator(modelSelector).evaluate(e => parseFloat(getComputedStyle(e).maxWidth))).toBeNaN()
          await p.screenshot({ path: resolve(pictures, 'B2-' + locale + '-' + theme + '-' + width + '-' + info.project.name + '.png') })
        }
      }
    } finally { await context.close() }
  }
  writeFileSync(resolve(pictures, 'geometry-' + info.project.name + '.json'), JSON.stringify(samples, null, 2) + String.fromCharCode(10))
})

test('touch taps on native permission and corner preserve an existing text selection and draft', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Mobile touch path')
  await fixtureSession(page)
  const editor = page.locator(editorSelector)
  await editor.tap()
  await editor.fill('alpha beta gamma')
  // The headless Linux browser has no Android/iOS long-press selection handles.
  // Seed only the standard DOM selection; every control interaction below is trusted touch.
  const selected = await editor.evaluate(element => {
    const text = document.createTreeWalker(element, NodeFilter.SHOW_TEXT).nextNode()!
    getSelection()!.setBaseAndExtent(text, 0, text, 5)
    return getSelection()!.toString()
  })
  expect(selected).toBe('alpha')
  const handle = (await editor.elementHandle())!
  await page.locator(permissionSelector).tap()
  await expect(page.getByRole('menu')).toBeVisible()
  await page.getByRole('menuitem', { name: 'Workspace Write', exact: true }).tap()
  await expect(page.getByRole('menu')).toHaveCount(0)
  await expect(editor).toHaveText('alpha beta gamma')
  expect(await page.evaluate(() => getSelection()!.toString())).toBe(selected)
  await page.locator('[data-mobile-compose-toggle]').tap()
  await expect(page.locator('[data-composer-card]')).toHaveAttribute('aria-modal', 'true')
  expect(await page.evaluate(() => getSelection()!.toString())).toBe(selected)
  await page.getByRole('button', { name: 'Collapse editor', exact: true }).tap()
  expect(await handle.evaluate(element => element === document.querySelector('[data-composer-input]'))).toBe(true)
  await expect(editor).toHaveText('alpha beta gamma')
  expect(await page.evaluate(() => getSelection()!.toString())).toBe(selected)
  await editor.tap()
  await editor.fill('')
})

test('dark send has no permanent mat, retains focus-visible outline and native Stop', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Desktop border remains host-owned')
  await fixtureSession(page)
  await page.emulateMedia({ colorScheme: 'dark' })
  const editor = page.locator(editorSelector)
  const send = page.locator(sendSelector)
  await editor.tap()
  await editor.fill('')
  await expect(send).toBeDisabled()
  await expect(send).toHaveCSS('border-color', 'rgba(0, 0, 0, 0)')
  await editor.fill('dark send')
  await expect(send).toBeEnabled()
  await send.hover()
  await expect(send).toHaveCSS('border-color', 'rgba(0, 0, 0, 0)')
  await page.keyboard.press('Tab')
  await send.focus()
  expect(await send.evaluate(e => e.matches(':focus-visible'))).toBe(true)
  expect(await send.evaluate(e => getComputedStyle(e).outlineStyle)).not.toBe('none')
  expect(await send.evaluate(e => parseFloat(getComputedStyle(e).outlineWidth))).toBeGreaterThanOrEqual(2)
  await editor.tap()
  await editor.fill('开始手机界面审计')
  const running = page.waitForFunction(() => document.querySelector('[data-composer-card] button[class*="_primary"]')?.getAttribute('aria-label') === 'Stop generating')
  await send.tap()
  await running
  await expect(send).toHaveCSS('border-color', 'rgba(0, 0, 0, 0)')
  await send.tap()
  await expect(send).toHaveAttribute('aria-label', 'Send message')
})

test('safe-area remains navigation-owned and shrink keeps send above keyboard', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Mobile viewport geometry')
  const width = page.viewportSize()!.width
  await page.setViewportSize({ width, height: 844 })
  await fixtureSession(page)
  const session = await page.context().newCDPSession(page)
  try {
    await session.send('Emulation.setSafeAreaInsetsOverride', { insets: { bottom: 34 } })
    await expect(page.locator('[data-mobile-workbench="navigation"]')).toHaveCSS('height', '90px')
    const gaps = await page.evaluate(() => {
      const card = document.querySelector('[data-composer-card]')!.getBoundingClientRect()
      const nav = document.querySelector('[data-mobile-workbench="navigation"]')!.getBoundingClientRect()
      const buttons = [...document.querySelectorAll('[data-mobile-workbench="navigation"] button')].map(e => e.getBoundingClientRect())
      return { gap: nav.top - card.bottom, bottom: nav.bottom, targetsBottom: Math.max(...buttons.map(b => b.bottom)) }
    })
    expect(gaps.gap).toBeCloseTo(8, 0)
    expect(gaps.targetsBottom).toBeLessThanOrEqual(gaps.bottom - 34)
    await session.send('Emulation.setSafeAreaInsetsOverride', { insets: {} })
  } finally { await session.detach() }
  await page.setViewportSize({ width, height: 520 })
  await expect(page.locator('[data-mobile-workbench="navigation"]')).toBeHidden()
  const send = (await page.locator(sendSelector).boundingBox())!
  expect(send.y + send.height).toBeLessThanOrEqual(520)
})

test('corner stays below the attachment rail and cannot block removal', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Mobile corner placement')
  await fixtureSession(page)
  const png = readFileSync(new URL('../../assets/workbench-192.png', import.meta.url))
  await page.locator('input[type=file]').setInputFiles(Array.from({ length: 6 }, (_, i) => ({ name: 'corner-' + i + '.png', mimeType: 'image/png', buffer: png })))
  const removes = page.locator('[data-composer-card] button[class*="_remove"]')
  await expect(removes).toHaveCount(6)
  await expect.poll(async () => page.evaluate(() => {
    const corner = document.querySelector('[data-mobile-compose-toggle]')!.getBoundingClientRect()
    return [...document.querySelectorAll('[data-composer-card] button[class*="_remove"]')].some(button => {
      const box = button.getBoundingClientRect()
      return Math.min(corner.right, box.right) > Math.max(corner.left, box.left) && Math.min(corner.bottom, box.bottom) > Math.max(corner.top, box.top)
    })
  }), { message: 'The expand corner must not cover an attachment remove button' }).toBe(false)
  mkdirSync(pictures, { recursive: true })
  await page.screenshot({ path: resolve(pictures, 'B2-six-attachments-' + page.viewportSize()!.width + '.png') })
  for (let remaining = 6; remaining > 0; remaining--) {
    await removes.first().tap()
    await expect(removes).toHaveCount(remaining - 1)
  }
})
