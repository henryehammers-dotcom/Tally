import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/Tally/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // autoUpdate fetches the new service worker in the background but,
      // by default, only activates it on the load AFTER that — meaning
      // one visit can still render a stale cached bundle even though a
      // newer one is already downloaded. clientsClaim + skipWaiting force
      // the new worker to take control immediately, and
      // cleanupOutdatedCaches drops leftover old-version cache entries.
      workbox: {
        clientsClaim: true,
        skipWaiting: true,
        cleanupOutdatedCaches: true,
      },
      includeAssets: ['logo.png'],
      manifest: {
        name: 'Tally',
        short_name: 'Tally',
        description: 'Build your own routines. Track every rep.',
        theme_color: '#0cc0df',
        background_color: '#0cc0df',
        display: 'standalone',
        icons: [
          {
            src: 'logo.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})
