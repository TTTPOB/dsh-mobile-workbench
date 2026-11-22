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
    await expect(jobs.locator('[data-job-count]')).toHaveText(count === 1 ? '1 background job' : '2 background jobs')
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
        rightGap: header.getBoundingClientRect().right - workbench.right - parseFloat(getComputedStyle(header).paddingRight),
        sameRow: Math.abs(job.top - workbench.top) < 1,
        separated: job.right <= workbench.left,
        text: getComputedStyle(chip.querySelector('[data-job-count]')!).display,
        liveColor: getComputedStyle(chip).color,
      }
    }, HOST_JOB_TRIGGER)
    expect(geometry.rightGap).toBeCloseTo(0, 0)
    expect(geometry.sameRow).toBe(true)
    expect(geometry.separated).toBe(true)
    expect(geometry.text).not.toBe('none')
    await page.screenshot({ path: '.validation/header-r2-running-' + count + '-' + info.project.name + '.png', animations: 'disabled' })
    if (count === 2) {
      await expect(jobs.locator('[class*="_textModeActivity"]')).toHaveCount(0, { timeout: 30_000 })
      await expect(jobs).toBeVisible()
      const settledColor = await jobs.evaluate(chip => getComputedStyle(chip).color)
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
