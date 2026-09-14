import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/Tally/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
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
        start_url: '/Tally/',
        scope: '/Tally/',
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
