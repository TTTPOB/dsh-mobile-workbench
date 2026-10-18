import { spawn, spawnSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'
import { hostRequire } from '../dev/fixture/runtime.mjs'
import { grantDemoCompatibility } from '../dev/fixture/compatibility.mjs'

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
await grantDemoCompatibility(join(home, 'profiles/web'), hostRequire())
run('dsh', ['plugin', '--profile', 'web', 'add', `link:${root}`, '--config.auto-install-peers=false'])
const picker = join(home, 'browser-picker.yml')
writeFileSync(picker, `- id: directory-picker\n  disabled: true\n- insert:\n    - id: directory-picker-browse\n      name: '@deepseek-ai/dsh-host-directory-picker-browse'\n    - id: ui-directory-picker-browse\n      name: '@deepseek-ai/dsh-client-ui-directory-picker-browse'\n`)
console.log(`\nMobile Workbench demo\nIsolated home: ${home}\nWorkspace: ${workspace}\nModel: Mobile Audit (local, no API key)\nPrompts: 开始手机界面审计 / 演示子智能体 / 演示提问\n`)
const urlFile = join(home, 'url.txt')
writeFileSync(urlFile, '', { mode: 0o600 })
writeFileSync(join(home, 'demo.pid'), String(process.pid) + '\n')
const child = spawn('dsh', ['--profile', 'web', '--patch', join(root, 'dev/fixture/overlay.yml'), '--patch', picker,
  '--host', '127.0.0.1', '--port', values.port, '--no-open'], { cwd: workspace, env, stdio: ['inherit', 'pipe', 'inherit'] })
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal))
let pending = ''
child.stdout.setEncoding('utf8')
child.stdout.on('data', chunk => {
  process.stdout.write(chunk)
  pending += chunk
  const lines = pending.split('\n')
  pending = lines.pop()
  for (const line of lines) {
    if (!line.startsWith('dsh web: http')) continue
    const url = line.slice('dsh web: '.length).trim()
    writeFileSync(urlFile, url + '\n', { mode: 0o600 })
    console.log(`Authenticated demo URL: ${url}\nURL file: ${urlFile}\nStop demo: kill -TERM ${process.pid}`)
  }
})
child.on('error', error => { console.error(error); process.exitCode = 1 })
child.on('exit', (code, signal) => { process.exitCode = code ?? (signal === 'SIGINT' ? 130 : 143) })
