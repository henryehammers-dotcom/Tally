import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'

// No-op in the browser/PWA; only the native iOS app can set this.
// Light text over the blue Welcome screen, dark text everywhere else.
export function setStatusBarOnBlue(onBlue) {
  if (!Capacitor.isNativePlatform()) return
  StatusBar.setStyle({ style: onBlue ? Style.Dark : Style.Light }).catch(() => {})
}
