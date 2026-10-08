// Render the SVG source with librsvg; PNGs are committed release assets.
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const source = fileURLToPath(new URL('../assets/workbench.svg', import.meta.url))
for (const size of [180, 192, 512]) {
  const output = fileURLToPath(new URL(`../assets/workbench-${size}.png`, import.meta.url))
  execFileSync('rsvg-convert', ['--width', String(size), '--height', String(size), '--output', output, source], { stdio: 'inherit' })
}
