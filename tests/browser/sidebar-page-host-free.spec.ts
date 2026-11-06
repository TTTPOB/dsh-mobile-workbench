import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { createRequire, stripTypeScriptTypes } from 'node:module'
import { dirname, join } from 'node:path'
import { LAYOUT_CSS } from '../../src/client/styles/layout.css.ts'
import { WORKBENCH_CSS } from '../../src/client/styles/workbench.css.ts'

const require = createRequire(import.meta.url)
const source = stripTypeScriptTypes(readFileSync(new URL('../../src/client/workbench/sidebar-page.ts', import.meta.url), 'utf8').replaceAll('export ', ''))
const react = join(dirname(require.resolve('react/package.json')), 'umd/react.development.js')
const reactDom = join(dirname(require.resolve('react-dom/package.json')), 'umd/react-dom.development.js')

test('retained sessions page stays clickable, scrollable and focusable after React commits and resize', async ({ page }, info) => {
  test.skip(!info.project.name.startsWith('mobile'), 'touch-only page adaptation')
  await page.setContent('<div id="app"></div>')
  await page.addStyleTag({ content: `
    html, body, #app { margin: 0; height: 100%; }
    [data-mobile-nav="frame"] { height: 100%; display: grid; grid-template-columns: 0 minmax(0, 1fr) 0; }
    ._centerCol_fixture { grid-column: 2; grid-row: 1; min-width: 0; }
    [data-rightbar-col] { grid-column: 3; grid-row: 1; }
    [class*="_sidebarCol"] { transform: translateX(-100%); visibility: hidden; }
    [role="tree"] { height: 240px; overflow-y: auto; }
    [data-sidebar-mask] { position: fixed; inset: 0; background: #888; }
    button { min-height: 44px; }
    ${LAYOUT_CSS}${WORKBENCH_CSS}
  ` })
  await page.addScriptTag({ path: react })
  await page.addScriptTag({ path: reactDom })
  await page.addScriptTag({ content: source + `
    const h = React.createElement
    const root = ReactDOM.createRoot(document.getElementById('app'))
    let collapsed = false, revision = 0, drawer = true
    window.clicks = 0
    const render = () => ReactDOM.flushSync(() => root.render(h('div', {
      'data-mobile-nav': 'frame', 'data-sidebar-collapsed': collapsed || undefined,
      'data-sidebar-drawer': drawer || undefined,
    },
      drawer && h('div', { 'data-sidebar-mask': '' }),
      h('div', { key: revision, className: '_sidebarCol_fixture', inert: drawer && collapsed ? '' : undefined },
        h('div', { role: 'tree' }, h('button', { onClick: () => { window.clicks++ } }, 'Select session'), h('div', { style: { height: 1000 } }, 'Scrollable content'))),
      h('main', { className: '_centerCol_fixture' }, h('button', {}, 'Conversation')),
      h('div', { 'data-rightbar-col': '' }),
      h('div', { 'data-shell-overlay': '' }, h('nav', { 'data-mobile-workbench': 'navigation' },
        ...['sessions', 'session', 'files'].map(id => h('button', { key: id, onClick: () => {
          const frame = document.querySelector('[data-mobile-nav]')
          frame.toggleAttribute(SESSIONS_PAGE, id === 'sessions')
        } }, id))))
    )))
    document.documentElement.setAttribute('data-mobile-workbench-active', 'true')
    render()
    const frame = document.querySelector('[data-mobile-nav]')
    const page = createSidebarPage(frame, () => { collapsed = !collapsed; render() })
    window.commit = () => { revision++; render() }
    window.resizeCommit = () => { drawer = false; render(); drawer = true; revision++; render() }
    window.disposePage = () => { page.dispose(); document.documentElement.removeAttribute('data-mobile-workbench-active'); render() }
  ` })
  const button = page.getByRole('button', { name: 'Select session' })
  const checkList = async (): Promise<void> => {
    await expect(button).toBeVisible()
    const clicks = await page.evaluate<number>('window.clicks')
    await button.click()
    await expect.poll(() => page.evaluate('window.clicks')).toBe(clicks + 1)
    await button.focus()
    await expect(button).toBeFocused()
    const list = page.locator('[role="tree"]')
    await list.evaluate(node => { node.scrollTop = 100 })
    await expect.poll(() => list.evaluate(node => node.scrollTop)).toBeGreaterThan(0)
    await expect(page.locator('[data-sidebar-mask]')).toBeHidden()
    await expect(page.locator('[data-mobile-workbench="navigation"]')).toBeVisible()
  }
  await checkList()
  await page.evaluate('window.commit()')
  await checkList()
  await page.setViewportSize({ width: 820, height: 900 })
  await page.evaluate('window.resizeCommit()')
  await checkList()
  for (const destination of ['session', 'files']) {
    await page.getByRole('button', { name: destination, exact: true }).click()
    await expect(button).toBeHidden()
    const conversation = page.getByRole('button', { name: 'Conversation', exact: true })
    await conversation.focus()
    await expect(conversation).toBeFocused()
    expect((await page.locator('main').boundingBox())!.width).toBeGreaterThan(700)
    await page.getByRole('button', { name: 'sessions', exact: true }).click()
    await checkList()
  }
  await page.evaluate('window.disposePage()')
  await expect(button).toBeHidden()
  await expect.poll(() => page.locator('[data-mobile-nav]').getAttribute('data-mobile-workbench-sessions')).toBeNull()
})
