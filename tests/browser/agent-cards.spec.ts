import { expect, test } from '@playwright/test'
import { freshSession } from './demo.ts'

for (const team of [false, true]) {
  test('mobile agent cards preserve live order, count and navigation, Team=' + team, async ({ page, isMobile }) => {
    test.skip(!isMobile)
    await freshSession(page, '演示子智能体')
    const composer = page.locator('[data-composer-input]')
    const send = page.getByRole('button', { name: 'Send message', exact: true })
    await expect(send).toBeVisible()
    if (team) {
      await page.getByRole('button', { name: /Select model/i }).first().click()
      const enable = page.getByRole('switch', { name: 'Enable agent teamwork', exact: true })
      await enable.click()
      await expect(enable).toBeChecked()
      await page.keyboard.press('Escape')
    }
    await composer.fill(team ? 'GRID_TEAM_DEMO' : 'GRID_DEMO')
    await send.click()
    await expect(page.getByText('GRID_READY', { exact: true }).last()).toBeVisible({ timeout: 60_000 })
    const trigger = page.locator('[data-mobile-workbench="agents"]')
    await trigger.tap()
    const panel = page.locator('[data-subagent-panel]')
    const cards = panel.locator('[data-agent-cards="root"] > [data-agent-card]')
    await expect(cards).toHaveCount(13)
    await expect(trigger.locator('[data-workbench-count]')).toHaveText('2/14')
    await expect(cards.nth(0).locator('[data-agent-card-name]')).toHaveText('agent-13')
    await expect(cards.nth(1).locator('[data-agent-card-name]')).toHaveText('agent-3')
    await expect(cards.nth(2).locator('[data-agent-card-name]')).toHaveText('agent-12')
    await expect(cards.nth(0).locator('[data-state="ongoing"]')).toBeVisible()
    await expect(cards.nth(1).locator('[data-state="ongoing"]')).toBeVisible()
    await expect(cards.nth(2).locator('[data-state="done"]')).toBeVisible()
    await expect(panel).toHaveCSS('background-color', /^(?:rgb\(|#[\da-f]{6}$)/i)
    await expect.poll(async () => [...new Set(await cards.locator('[data-agent-card-model]').allTextContents())].sort()).toEqual([
      'mobile-audit', 'mobile-audit-extended-preview', 'mobile-audit-fast',
    ])
    const board = panel.locator('[data-team-panel]')
    if (team) {
      await expect(board).toContainText('复核结果')
      await expect(board).toContainText('汇总任务')
    } else await expect(board).toHaveCount(0)
    await panel.getByRole('button', { name: /Expand agent-2 descendants/ }).tap()
    await expect(panel.locator('[data-agent-cards="nested"] [data-agent-card]')).toHaveCount(1)
    // The older slow card moves down once it stops without the panel closing.
    if (!team) {
      await expect(trigger.locator('[data-workbench-count]')).toHaveText('0/14', { timeout: 45_000 })
      await expect(cards.nth(1).locator('[data-agent-card-name]')).toHaveText('agent-12')
    }
    await cards.filter({ hasText: '检查移动布局 · 11' }).locator('[data-agent-card-open]').tap()
    await expect(panel).toHaveCount(0)
    await expect(page.locator('[data-mobile-workbench="parent"]')).toBeVisible()
  })
}
