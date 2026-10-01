/** Build the fixture and regenerate its location-specific overlay. */
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { pathToFileURL, fileURLToPath } from 'node:url'
import { hostRequire } from './runtime.mjs'

const sourceUrl = new URL('./src/index.ts', import.meta.url)
const source = readFileSync(sourceUrl, 'utf8')
let output = stripTypeScriptTypes(source, { mode: 'transform', sourceUrl: sourceUrl.href })
const require = hostRequire()
// Reuse the installed Host's existing peers without bundling another service copy.
for (const name of ['@deepseek-ai/dsh-llm', '@deepseek-ai/schemastery']) {
  output = output.replaceAll("'" + name + "'", JSON.stringify(pathToFileURL(require.resolve(name)).href))
}
mkdirSync(new URL('./dist/', import.meta.url), { recursive: true })
writeFileSync(new URL('./dist/index.js', import.meta.url), output)
const entry = fileURLToPath(new URL('./dist/index.js', import.meta.url))
const fixtureFile = fileURLToPath(new URL('./workspace/mobile-audit.md', import.meta.url))
const overlay = [
  '- id: agent-default-model',
  '  config:',
  '    provider: mobile-audit',
  '    model: mobile-audit',
  '- id: session-title-llm',
  '  disabled: true',
  '- insert:',
  '    - id: mobile-audit-fixture',
  '      name: ' + JSON.stringify(entry),
  '      config:',
  '        fixtureFile: ' + JSON.stringify(fixtureFile),
  '        paceMs: 35',
  '',
].join('\n')
writeFileSync(new URL('./overlay.yml', import.meta.url), overlay)
console.log('Built dist/index.js and overlay.yml for ' + fileURLToPath(new URL('.', import.meta.url)))
