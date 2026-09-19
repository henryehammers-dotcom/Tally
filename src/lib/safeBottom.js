// On iOS standalone PWAs with a black-translucent status bar, the page's
// layout viewport ends `outerHeight - innerHeight` px above the real
// bottom of the screen (the page can't draw in that strip — iOS fills it
// with the background color). The home-indicator zone lives inside that
// strip, so the nav only needs to clear whatever part of the bottom
// safe-area inset is NOT already covered by it.
function measureInsets() {
  const probe = document.createElement('div')
  probe.style.cssText = 'position:fixed;top:0;visibility:hidden;padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)'
  document.body.appendChild(probe)
  const cs = getComputedStyle(probe)
  const insets = { top: parseFloat(cs.paddingTop) || 0, bottom: parseFloat(cs.paddingBottom) || 0 }
  document.body.removeChild(probe)
  return insets
}

function sync() {
  const { top, bottom } = measureInsets()
  const standalone = window.navigator.standalone === true
  // Only the status-bar-overlay mode has the short viewport; otherwise the
  // full bottom inset applies.
  const strip = standalone && top > 0 ? Math.max(0, window.outerHeight - window.innerHeight) : 0
  const effective = Math.max(0, bottom - strip)
  document.documentElement.style.setProperty('--safe-bottom', `${effective}px`)
}

export function initSafeBottom() {
  sync()
  window.addEventListener('resize', sync)
  window.addEventListener('orientationchange', sync)
}
