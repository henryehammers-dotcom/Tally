// On iOS standalone PWAs with a black-translucent status bar, the page's
// layout viewport ends `outerHeight - innerHeight` px above the real
// bottom of the screen (the page can't draw in that strip — iOS fills it
// with the background color). The home-indicator zone lives inside that
// strip, so the nav only needs to clear whatever part of the bottom
// safe-area inset is NOT already covered by it.
function measureInsetBottom() {
  const probe = document.createElement('div')
  probe.style.cssText = 'position:fixed;top:0;visibility:hidden;padding-bottom:env(safe-area-inset-bottom)'
  document.body.appendChild(probe)
  const px = parseFloat(getComputedStyle(probe).paddingBottom) || 0
  document.body.removeChild(probe)
  return px
}

function sync() {
  const standalone = window.navigator.standalone === true
  const strip = standalone ? Math.max(0, window.outerHeight - window.innerHeight) : 0
  const effective = Math.max(0, measureInsetBottom() - strip)
  document.documentElement.style.setProperty('--safe-bottom', `${effective}px`)
}

export function initSafeBottom() {
  sync()
  window.addEventListener('resize', sync)
  window.addEventListener('orientationchange', sync)
}
