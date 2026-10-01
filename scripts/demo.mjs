import { spawnSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'

const root = dirname(fileURLToPath(new URL('../package.json', import.meta.url)))
const { values } = parseArgs({ options: { port: { type: 'string', default: '54076' } } })
const home = join(root, '.demo-home')
const workspace = join(root, 'dev/fixture/workspace')
const env = { ...process.env, DSH_HOME: home }
mkdirSync(home, { recursive: true })

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { cwd: root, env, stdio: 'inherit', ...options })
  if (result.error) throw result.error
  if (result.status !== 0) process.exit(result.status ?? 1)
}

run(process.execPath, ['dev/fixture/build.mjs'])
run('dsh', ['--profile', 'web', '--dump-config'], { stdio: 'ignore' })
run('dsh', ['plugin', '--profile', 'web', 'add', `link:${root}`, '--config.auto-install-peers=false'])
const picker = join(home, 'browser-picker.yml')
writeFileSync(picker, `- id: directory-picker\n  disabled: true\n- insert:\n    - id: directory-picker-browse\n      name: '@deepseek-ai/dsh-host-directory-picker-browse'\n    - id: ui-directory-picker-browse\n      name: '@deepseek-ai/dsh-client-ui-directory-picker-browse'\n`)
console.log(`\nMobile Workbench demo\nIsolated home: ${home}\nWorkspace: ${workspace}\nModel: Mobile Audit (local, no API key)\nPrompts: 开始手机界面审计 / 演示子智能体 / 演示提问\n`)
run('dsh', ['--profile', 'web', '--patch', join(root, 'dev/fixture/overlay.yml'), '--patch', picker,
  '--host', '127.0.0.1', '--port', values.port, '--no-open'], { cwd: workspace })
