/** Grant only catalog-verified exact pairs in the isolated demo profile. */
import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { readDependencyCatalog } from '../../../dsh-config/scripts/lib.mjs'
import { grantVerifiedCompatibility } from '../../../dsh-config/scripts/deployment.mjs'

export async function grantDemoCompatibility(profileDir, require) {
  const boot = await import(pathToFileURL(require.resolve('@deepseek-ai/dsh-app-boot')).href)
  const catalog = readDependencyCatalog()
  const runtimeVersion = boot.getDshRuntimeVersion()
  const targets = { entries: catalog.packages.filter(row => row.scope === 'global-override' && row.package.startsWith('@deepseek-ai/dsh-'))
    .map(row => ({ ...row, name: row.package, target: row.url })) }
  const issues = []
  for (const target of targets.entries) {
    const manifest = JSON.parse(readFileSync(require.resolve(target.name + '/package.json'), 'utf8'))
    const conflict = boot.evaluatePluginCompatibility(manifest, {}, runtimeVersion)
    if (conflict) issues.push({ profile: 'web', name: manifest.name, version: manifest.version, status: 'compatibility-blocked' })
  }
  const report = { blocked: issues.length, runtimeVersion, issues }
  const machine = { deployment: { profiles: { web: { packagePath: profileDir + '/package.json' } } } }
  const granted = await grantVerifiedCompatibility(machine, targets, report, catalog, boot.setProfileVersionExemption)
  if (granted.length !== issues.length) {
    throw new Error('Demo compatibility is not catalog-verified: ' + issues.map(row => row.name + '@' + row.version).join(', '))
  }
  console.log('Demo-only exact-version exemptions (possible crashes/data loss; never use this Home for real work):')
  for (const row of granted) console.log('  ' + row.packageVersion + ' on DSH ' + row.runtimeVersion)
  return granted
}
