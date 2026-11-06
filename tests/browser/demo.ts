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

/** Navigate through the plugin's bottom pages when the phone shell is active. */
async function navigate(page: Page, destination: string): Promise<void> {
  if (await page.evaluate(() => matchMedia('(max-width: 1023px) and (pointer: coarse)').matches)) {
    await page.locator('[data-workbench-destination="' + destination + '"]').click()
  }
}

/** Create a fresh session through the visible Host UI and send one prompt. */
async function startSession(page: Page, prompt: string, workspace: string): Promise<void> {
  await page.getByRole('button', { name: 'New session', exact: true }).first().click()
  await navigate(page, 'session')
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
  await editor.fill(prompt)
  await page.getByRole('button', { name: 'Send message', exact: true }).click()
}

/** Start a new session with any fixture prompt, without waiting for the audit marker. */
export async function freshSession(page: Page, prompt: string, options: DemoSessionOptions = {}): Promise<void> {
  await openDemo(page)
  await navigate(page, 'sessions')
  const workspace = options.workspace ?? process.env.DSH_BROWSER_WORKSPACE ?? resolve(root, 'dev/fixture/workspace')
  await startSession(page, prompt, workspace)
}

/** Create or reuse a real Mobile Audit session using only the visible Host UI. */
export async function fixtureSession(page: Page, options: DemoSessionOptions = {}): Promise<void> {
  await openDemo(page)
  await navigate(page, 'sessions')
  const sessionId = options.sessionId ?? process.env.DSH_BROWSER_SESSION_ID
  const existing = page.locator('[data-row-key^="session:"]').filter({ hasText: auditPrompt }).first()
  let reused = false
  if (sessionId) {
    await page.locator('[data-row-key="session:' + sessionId + '"] [class*="_title"]').click()
    reused = true
    await navigate(page, 'session')
  } else if (options.reuse !== false && await existing.count() > 0) {
    await existing.locator('[class*="_title"]').click()
    reused = true
    await navigate(page, 'session')
  } else {
    const workspace = options.workspace ?? process.env.DSH_BROWSER_WORKSPACE ?? resolve(root, 'dev/fixture/workspace')
    await startSession(page, auditPrompt, workspace)
  }
  await waitForAudit(page, reused)
}

/** Reveal historical audit turns through the native virtual scroller, then return to the tail. */
export async function waitForAudit(page: Page, reused = false): Promise<void> {
  const marker = page.getByText(/MOBILE_AUDIT_COMPLETE —/).first()
  const send = page.getByRole('button', { name: 'Send message', exact: true })
  if (reused) {
    await expect(send).toBeVisible({ timeout: 60_000 })
    const scroll = page.locator('[data-conversation-scroll]:visible')
    await scroll.waitFor()
    await scroll.evaluate(node => { node.scrollTop = 0 })
    await expect.poll(async () => {
      if (await marker.isVisible()) return true
      // A frame lets the Host mount the newly revealed virtual window before the next check.
      await scroll.evaluate(async node => {
        node.scrollTop += Math.max(1, node.clientHeight * .75)
        await new Promise<void>(resolve => requestAnimationFrame(() => { resolve() }))
      })
      return await marker.isVisible()
    }, { timeout: 60_000, message: 'Historical fixture audit marker must exist in the virtual conversation' }).toBe(true)
    await scroll.evaluate(node => { node.scrollTop = node.scrollHeight })
  } else {
    await expect(marker).toBeVisible({ timeout: 60_000 })
  }
  await expect(send).toBeVisible({ timeout: 60_000 })
}
