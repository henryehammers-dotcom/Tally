import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'

// The web app can only hint the status bar color via theme-color; the native
// iOS app can also set the text style. Blue on the Welcome screen, white
// everywhere else.
export function setStatusBarOnBlue(onBlue) {
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', onBlue ? '#0cc0df' : '#ffffff')
  if (!Capacitor.isNativePlatform()) return
  StatusBar.setStyle({ style: onBlue ? Style.Dark : Style.Light }).catch(() => {})
}
