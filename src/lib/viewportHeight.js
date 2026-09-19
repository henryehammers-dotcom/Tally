// iOS WebKit bug (standalone PWA + apple-mobile-web-app-status-bar-style:
// black-translucent): content correctly paints under the status bar, but
// window.innerHeight / document.documentElement.clientHeight are NOT
// updated to include that space — they under-report by exactly the top
// safe-area-inset. Anything sized off those values (including CSS
// position:fixed + inset:0, and dvh/vh units) comes up short at the
// bottom by that same amount. Compute the real height ourselves and
// expose it as a CSS custom property instead of trusting the browser.
function measureSafeAreaInsetTop() {
  const probe = document.createElement('div')
  probe.style.position = 'fixed'
  probe.style.top = '0'
  probe.style.paddingTop = 'env(safe-area-inset-top)'
  probe.style.visibility = 'hidden'
  document.body.appendChild(probe)
  const px = parseFloat(getComputedStyle(probe).paddingTop) || 0
  document.body.removeChild(probe)
  return px
}

function syncTrueAppHeight() {
  const safeTop = measureSafeAreaInsetTop()
  const trueHeight = window.innerHeight + safeTop
  document.documentElement.style.setProperty('--true-app-height', `${trueHeight}px`)
}

export function initViewportHeightSync() {
  syncTrueAppHeight()
  window.addEventListener('resize', syncTrueAppHeight)
  window.addEventListener('orientationchange', syncTrueAppHeight)
}
