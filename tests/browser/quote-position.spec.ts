import { expect, test } from '@playwright/test'
import { fixtureSession } from './demo.ts'

test('selection tools stay above the touch composer but follow selected text on desktop', async ({ page, isMobile }, info) => {
  await fixtureSession(page)
  const text = page.getByText(/这是固定的中文长段落/).last()
  const seat = page.locator('[data-conversation-scroll] [data-composer-seat]')
  const surface = page.locator('[data-text-interaction-surface][aria-hidden="false"]')
  await text.scrollIntoViewIfNeeded()
  for (const position of isMobile ? ['middle', 'top', 'near-composer'] : ['desktop']) {
    const composer = (await seat.boundingBox())!
    const selected = await text.evaluate((node, y) => {
      const scroll = node.closest('[data-conversation-scroll]')!
      const range = document.createRange()
      range.setStart(node.firstChild!, 0)
      range.setEnd(node.firstChild!, 12)
      if (y !== null) scroll.scrollTop += range.getBoundingClientRect().y - y
      const selection = getSelection()!
      selection.removeAllRanges()
      selection.addRange(range)
      return range.getBoundingClientRect().toJSON() as { x: number; y: number; width: number; height: number; bottom: number }
    }, position === 'top' ? 130 : position === 'near-composer' ? composer.y - 65 : null)
    await expect(surface).toBeVisible()
    const toolbar = (await surface.boundingBox())!
    if (isMobile) {
      expect(composer.y - (toolbar.y + toolbar.height)).toBeCloseTo(8, 0)
      expect(toolbar.x + toolbar.width / 2).toBeCloseTo(composer.x + composer.width / 2, 0)
      const overlaps = toolbar.y < selected.bottom && toolbar.y + toolbar.height > selected.y
        && toolbar.x < selected.x + selected.width && toolbar.x + toolbar.width > selected.x
      expect(overlaps).toBe(false)
    } else {
      expect(selected.y - (toolbar.y + toolbar.height)).toBeCloseTo(8, 0)
      expect(toolbar.x + toolbar.width / 2).toBeCloseTo(selected.x + selected.width / 2, 0)
    }
    await page.screenshot({ path: '.validation/quote-' + info.project.name + '-' + position + '.png', animations: 'disabled' })
    await page.evaluate(() => getSelection()?.removeAllRanges())
    await expect(surface).toBeHidden()
  }
})
