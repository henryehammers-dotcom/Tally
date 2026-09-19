import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE = '/Tally/'

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

function injectIconLinks() {
  return {
    name: 'inject-icon-links',
    transformIndexHtml(html) {
      if (!icon) return html
      return html.replace(
        '</head>',
        `    <link rel="icon" href="${icon.filename}">\n` +
        `    <link rel="apple-touch-icon" href="${icon.filename}">\n` +
        `  </head>`
      )
    },
  }
}

export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    injectIconLinks(),
    VitePWA({
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
