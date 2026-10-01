import { rmSync } from 'node:fs'

// TypeScript does not remove declarations for deleted or unreachable modules.
for (const directory of ['../lib/', '../.client-build/']) {
  rmSync(new URL(directory, import.meta.url), { recursive: true, force: true })
}
