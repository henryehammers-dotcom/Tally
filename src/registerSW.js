// Belt-and-suspenders for PWA staleness. clientsClaim + skipWaiting (set
// in vite.config.js) handle the common case, but if the app is sitting
// open in the background when a new version ships, this catches the
// "waiting" worker and activates it without needing the person to force-
// quit and reopen the app.
import { registerSW } from 'virtual:pwa-register'

export function initServiceWorker() {
  registerSW({
    immediate: true,
    onRegisteredSW(swUrl, registration) {
      if (!registration) return
      setInterval(() => {
        registration.update()
      }, 60 * 60 * 1000)
    },
  })
}
