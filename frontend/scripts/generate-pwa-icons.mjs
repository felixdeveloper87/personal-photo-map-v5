// Renders the PWA / home-screen icons from src/assets/logo.png.
// Run with: node scripts/generate-pwa-icons.mjs
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import sharp from 'sharp'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const publicDir = join(root, 'public')
const logoPath = join(root, 'src', 'assets', 'logo.png')

const BG = '#ffffff'

// Logo centred on a background tile.
// `scale` = logo size relative to the tile; `radius` = corner radius ratio (0 = full-bleed).
async function render({ file, size, scale, radius }) {
  const logoSize = Math.round(size * scale)
  const logo = await sharp(logoPath).resize(logoSize, logoSize).png().toBuffer()
  const r = Math.round(size * radius)
  const tile = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">` +
      `<rect width="${size}" height="${size}" rx="${r}" fill="${BG}"/></svg>`
  )
  const offset = Math.round((size - logoSize) / 2)
  await sharp(tile)
    .composite([{ input: logo, top: offset, left: offset }])
    .png({ compressionLevel: 9 })
    .toFile(join(publicDir, file))
  console.log(`wrote public/${file}`)
}

const outputs = [
  // Regular icons: rounded tile, logo fills most of it.
  { file: 'pwa-64x64.png', size: 64, scale: 0.82, radius: 0.22 },
  { file: 'pwa-192x192.png', size: 192, scale: 0.82, radius: 0.22 },
  { file: 'pwa-512x512.png', size: 512, scale: 0.82, radius: 0.22 },
  // Maskable and Apple icons must be full-bleed: the OS applies its own mask.
  // Keep the logo inside the maskable safe zone (80% centre circle).
  { file: 'maskable-icon-512x512.png', size: 512, scale: 0.6, radius: 0 },
  { file: 'apple-touch-icon-180x180.png', size: 180, scale: 0.78, radius: 0 },
  // Favicon.
  { file: 'favicon-32x32.png', size: 32, scale: 0.9, radius: 0.22 },
]

for (const o of outputs) await render(o)
