import { readFileSync } from 'node:fs'
import { basename, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, type Page } from '@playwright/test'

const root = fileURLToPath(new URL('../../', import.meta.url))
const auditPrompt = '开始手机界面审计'

export interface DemoSessionOptions {
  reuse?: boolean
  sessionId?: string
  workspace?: string
}

/** Resolve the current authenticated URL; never fall back to the daily Host. */
export function demoUrl(): string {
  const value = process.env.DSH_BROWSER_URL
    ?? readFileSync(resolve(root, '.demo-home/url.txt'), 'utf8').trim()
  const url = new URL(value)
  if (!['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname) || url.port === '53083') {
    throw new Error('Browser tests require an isolated localhost demo, never the daily Host on 53083')
  }
  return url.href
}

/** Authenticate, acknowledge the preview notice, and wait for native composer wiring. */
export async function openDemo(page: Page): Promise<void> {
  await page.goto(demoUrl())
  await page.locator('[data-composer-input]').waitFor({ state: 'attached' })
  const notice = page.getByRole('dialog', { name: 'Preview Notice', exact: true })
  if (await notice.isVisible()) {
    await notice.getByRole('button', { name: 'Continue', exact: true }).click()
  }
}

/** Create or reuse a real Mobile Audit session using only the visible Host UI. */
export async function fixtureSession(page: Page, options: DemoSessionOptions = {}): Promise<void> {
  await openDemo(page)
  const mobile = await page.evaluate(() => matchMedia('(max-width: 1023px) and (pointer: coarse)').matches)
  const navigate = async (destination: string): Promise<void> => {
    if (mobile) await page.locator('[data-workbench-destination="' + destination + '"]').click()
  }
  await navigate('sessions')
  const sessionId = options.sessionId ?? process.env.DSH_BROWSER_SESSION_ID
  const existing = page.locator('[data-row-key^="session:"]').filter({ hasText: auditPrompt }).first()
  if (sessionId) {
    await page.locator('[data-row-key="session:' + sessionId + '"]').click()
    await navigate('session')
  } else if (options.reuse !== false && await existing.count() > 0) {
    await existing.click()
    await navigate('session')
  } else {
    await page.getByRole('button', { name: 'New session', exact: true }).first().click()
    await navigate('session')
    const workspace = options.workspace ?? process.env.DSH_BROWSER_WORKSPACE ?? resolve(root, 'dev/fixture/workspace')
    const editor = page.locator('[data-composer-input="true"]')
    if (await editor.getAttribute('contenteditable') !== 'true') {
      await page.getByRole('button', { name: 'Choose workspace', exact: true }).click()
      await expect(page.locator('[role="menu"], [role="dialog"]')).toBeVisible()
      const menu = page.getByRole('menu')
      if (await menu.isVisible()) {
        await menu.getByRole('menuitem', { name: basename(workspace), exact: true }).click()
      } else {
        await page.getByRole('button', { name: 'Edit path', exact: true }).click()
        const path = page.getByRole('textbox', { name: 'Edit path', exact: true })
        await path.fill(workspace)
        await path.press('Enter')
        await page.getByRole('button', { name: 'Open', exact: true }).click()
      }
    }
    await expect(editor).toHaveAttribute('contenteditable', 'true')
    await expect(page.getByText('Mobile Audit', { exact: true })).toBeVisible()
    await editor.fill(auditPrompt)
    await page.getByRole('button', { name: 'Send message', exact: true }).click()
  }
  await waitForAudit(page)
}

/** Use the final assistant marker instead of sleeps or a streaming screenshot. */
export async function waitForAudit(page: Page): Promise<void> {
  await expect(page.getByText(/MOBILE_AUDIT_COMPLETE —/)).toBeVisible({ timeout: 60_000 })
  await expect(page.getByRole('button', { name: 'Send message', exact: true })).toBeVisible()
}
