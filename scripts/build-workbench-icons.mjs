import { writeFileSync } from 'node:fs'
import { deflateSync } from 'node:zlib'

function crc32(bytes) {
  let value = 0xffffffff
  for (const byte of bytes) {
    value ^= byte
    for (let bit = 0; bit < 8; bit++) value = (value >>> 1) ^ ((value & 1) ? 0xedb88320 : 0)
  }
  return (value ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const body = Buffer.concat([Buffer.from(type), data])
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([length, body, crc])
}

function lineDistance(x, y, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1]
  const t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / (dx * dx + dy * dy)))
  return Math.hypot(x - a[0] - t * dx, y - a[1] - t * dy)
}

// Original workbench mark: a white W inside the maskable safe zone.
for (const size of [192, 512]) {
  const pixels = Buffer.alloc(size * (size * 4 + 1))
  const points = [[0.27, 0.35], [0.37, 0.67], [0.5, 0.43], [0.63, 0.67], [0.73, 0.35]]
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const x = (col + 0.5) / size, y = (row + 0.5) / size
      const white = points.slice(1).some((point, index) => lineDistance(x, y, points[index], point) < 0.029)
      const dot = Math.hypot(x - 0.73, y - 0.24) < 0.033
      const rgba = white ? [249, 250, 255, 255] : dot ? [130, 230, 204, 255] : [49 + Math.round(32 * x), 57 + Math.round(20 * y), 129 + Math.round(33 * x), 255]
      const offset = row * (size * 4 + 1) + 1 + col * 4
      pixels.set(rgba, offset)
    }
  }
  const header = Buffer.alloc(13)
  header.writeUInt32BE(size, 0)
  header.writeUInt32BE(size, 4)
  header[8] = 8
  header[9] = 6
  const png = Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', header), chunk('IDAT', deflateSync(pixels)), chunk('IEND', Buffer.alloc(0))])
  writeFileSync(new URL(`../assets/workbench-${size}.png`, import.meta.url), png)
}
