import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'

// Must match --bg and --black in index.css.
export const STATUS_COLORS = { app: '#f7f6f3', black: '#231f20' }

let holding = false
let desired = STATUS_COLORS.app

function isLight(hex) {
  const n = parseInt(hex.slice(1), 16)
  const luminance = (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255
  return luminance > 0.5
}

function apply(color) {
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', color)
  if (!Capacitor.isNativePlatform()) return
  StatusBar.setStyle({ style: isLight(color) ? Style.Light : Style.Dark }).catch(() => {})
}

// Screens declare the color their top edge should be; the splash animation
// holds the status bar (black, then the destination color) and ignores them
// until it's done.
export function setStatusBarColor(color) {
  desired = color
  if (!holding) apply(color)
}

export function holdStatusBarColor(color) {
  holding = true
  apply(color)
}

export function releaseStatusBarColor() {
  holding = false
  apply(desired)
}
