import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// `npm run build:native` builds the bundle that ships inside the iOS app
// (Capacitor serves it from the device, so relative paths and no service
// worker). The default build is the GitHub Pages web app.
const NATIVE = process.env.TALLY_NATIVE === '1'
const BASE = NATIVE ? './' : '/Tally/'

// Drop a square image named "icon.png" / "icon.jpg" / "icon.jpeg" / "icon.webp"
// directly into public/ and it becomes the PWA + iOS home-screen icon on the
// next build — no other code changes needed. (Restart `npm run dev` to pick
// up a newly-added file locally; production always rebuilds fresh.)
const ICON_BASENAME = 'icon'
const ICON_MIME_TYPES = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
}

function findIconFile() {
  const publicDir = path.resolve(__dirname, 'public')
  if (!fs.existsSync(publicDir)) return null
  const files = fs.readdirSync(publicDir)
  for (const ext of Object.keys(ICON_MIME_TYPES)) {
    const filename = `${ICON_BASENAME}.${ext}`
    if (files.includes(filename)) {
      return { filename, mimeType: ICON_MIME_TYPES[ext] }
    }
  }
  return null
}

const icon = findIconFile()

// iOS shows a splash image only if its pixel size matches the device exactly,
// so there is one image per portrait iPhone size. Regenerate them from the
// icon with `python3 scripts/make-splash.py`.
const SPLASH_DEVICES = [
  [440, 956, 3], [402, 874, 3], [430, 932, 3], [393, 852, 3], [420, 912, 3],
  [390, 844, 3], [428, 926, 3], [375, 812, 3], [414, 896, 3], [414, 896, 2],
  [375, 667, 2], [414, 736, 3], [320, 568, 2],
]

function splashLinks() {
  const dir = path.resolve(__dirname, 'public', 'splash')
  return SPLASH_DEVICES
    .map(([w, h, r]) => {
      const file = `${w * r}x${h * r}.png`
      if (!fs.existsSync(path.join(dir, file))) return ''
      return (
        `    <link rel="apple-touch-startup-image" href="splash/${file}" ` +
        `media="(device-width: ${w}px) and (device-height: ${h}px) and ` +
        `(-webkit-device-pixel-ratio: ${r}) and (orientation: portrait)">\n`
      )
    })
    .join('')
}

function injectIconLinks() {
  return {
    name: 'inject-icon-links',
    transformIndexHtml(html) {
      const iconLinks = icon
        ? `    <link rel="icon" href="${icon.filename}">\n` +
          `    <link rel="apple-touch-icon" href="${icon.filename}">\n`
        : ''
      return html.replace('</head>', `${iconLinks}${splashLinks()}  </head>`)
    },
  }
}

export default defineConfig({
  base: BASE,
  build: { outDir: NATIVE ? 'dist-native' : 'dist' },
  plugins: [
    react(),
    injectIconLinks(),
    VitePWA({
      disable: NATIVE,
      registerType: 'autoUpdate',
      workbox: {
        clientsClaim: true,
        skipWaiting: true,
        cleanupOutdatedCaches: true,
      },
      includeAssets: icon ? [icon.filename] : [],
      manifest: {
        name: 'Tally',
        short_name: 'Tally',
        description: 'Build your own routines. Track every rep.',
        start_url: '/Tally/',
        scope: '/Tally/',
        theme_color: '#0cc0df',
        background_color: '#0cc0df',
        display: 'standalone',
        icons: icon
          ? [
              { src: icon.filename, sizes: '192x192', type: icon.mimeType },
              { src: icon.filename, sizes: '512x512', type: icon.mimeType },
            ]
          : [],
      },
    }),
  ],
})
