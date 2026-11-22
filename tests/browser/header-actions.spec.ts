import { expect, test } from '@playwright/test'
import { freshSession } from './demo.ts'
import { HOST_AGENT_PANEL, HOST_AGENT_TRIGGER, HOST_JOB_TRIGGER } from '../../src/client/workbench/dom-observation.ts'

test('the phone separates header controls and shows native job activity', async ({ page, isMobile }, info) => {
  test.skip(!isMobile)
  await freshSession(page, '演示子智能体')

  const agents = page.locator('[data-mobile-workbench="agents"]')
  const native = page.locator(HOST_AGENT_TRIGGER)
  const jobs = page.locator(HOST_JOB_TRIGGER)
  const composer = page.locator('[data-composer-input]')
  const send = page.getByRole('button', { name: 'Send message', exact: true })
  await expect(agents).toBeEnabled()
  await expect(agents).toHaveAccessibleName(/0\/1/)
  await expect(jobs).toHaveCount(0)
  for (const count of [1, 2]) {
    await expect(send).toBeVisible()
    await composer.fill('演示后台任务')
    await send.click()
    await expect(jobs).toHaveAccessibleName(count === 1 ? '1 background job' : '2 background jobs')
    await expect(jobs).toHaveAttribute('data-workbench-job-count', `${count}/${count}`)
    await expect(jobs.locator('[class*="_textModeActivity"]')).toBeVisible()
    await expect(jobs).toBeVisible()
    await expect(native).toHaveCount(1)
    expect(await native.boundingBox(), 'Native subagent button must not have a layout box').toBeNull()
    const geometry = await agents.evaluate((button, jobSelector) => {
      const header = button.closest('header')!
      const chip = header.querySelector(jobSelector)!
      const workbench = button.getBoundingClientRect()
      const job = chip.getBoundingClientRect()
      return {
        rightDelta: Math.abs(header.querySelector('[class*="_headerUtilities"] button[aria-haspopup="menu"]')!.getBoundingClientRect().right - workbench.right),
        inViewport: workbench.left >= 0 && workbench.right <= innerWidth && workbench.top >= 0 && workbench.bottom <= innerHeight && job.left >= 0 && job.right <= innerWidth && job.top >= 0 && job.bottom <= innerHeight,
        masked: (() => {
          for (let node: Element | null = button; node && node !== header; node = node.parentElement) {
            if (getComputedStyle(node).maskImage !== 'none') return true
          }
          return false
        })(),
        sameRow: Math.abs(job.top - workbench.top) < 1,
        separated: job.right <= workbench.left,
        number: getComputedStyle(chip, '::after').content,
        liveColor: getComputedStyle(chip, '::after').color,
      }
    }, HOST_JOB_TRIGGER)
    expect(geometry.rightDelta).toBeLessThanOrEqual(1)
    expect(geometry.inViewport).toBe(true)
    expect(geometry.masked, 'The complete agent count must be painted').toBe(false)
    expect(geometry.sameRow).toBe(true)
    expect(geometry.separated).toBe(true)
    expect(geometry.number).toContain(`${count}/${count}`)
    await page.screenshot({ path: '.validation/header-r2-running-' + count + '-' + info.project.name + '.png', animations: 'disabled' })
    if (count === 2) {
      await expect(jobs.locator('[class*="_textModeActivity"]')).toHaveCount(0, { timeout: 30_000 })
      await expect(jobs).toBeVisible()
      await expect(jobs).toHaveAttribute('data-workbench-job-count', '0/2')
      const settledColor = await jobs.evaluate(chip => getComputedStyle(chip, '::after').color)
      expect(settledColor).not.toBe(geometry.liveColor)
    }
  }
  await page.screenshot({ path: '.validation/header-r2-settled-' + info.project.name + '.png', animations: 'disabled' })
  await agents.tap()
  const panel = page.locator(HOST_AGENT_PANEL)
  await expect(panel.getByRole('heading')).toBeVisible()
  await expect(panel.getByRole('treeitem')).toHaveCount(1)
  await panel.getByRole('button', { name: 'Close', exact: true }).tap()
  await expect(panel).toHaveCount(0)
  await expect(agents).toBeFocused()
})
