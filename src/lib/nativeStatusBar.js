import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'

export const STATUS_COLORS = { white: '#ffffff', blue: '#0cc0df', purple: '#8c52ff' }

let holding = false
let desired = STATUS_COLORS.white

function apply(color) {
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', color)
  if (!Capacitor.isNativePlatform()) return
  const onWhite = color.toLowerCase() === STATUS_COLORS.white
  StatusBar.setStyle({ style: onWhite ? Style.Light : Style.Dark }).catch(() => {})
}

// Screens declare the color their top edge should be; the splash animation
// holds the status bar (purple, then white) and ignores them until it's done.
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
