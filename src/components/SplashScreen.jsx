import { useEffect, useRef, useState } from 'react'
import { Capacitor } from '@capacitor/core'
import { STATUS_COLORS, holdStatusBarColor, releaseStatusBarColor } from '../lib/nativeStatusBar'
import logo from '../assets/logo.json'
import './SplashScreen.css'

// Timeline (ms): logo alone -> logo lifts and "tally" fades in -> hold ->
// zoom into a white dot until the screen is the next screen's color -> fade.
const HOLD_START = 250
const MOVE = 550
const HOLD_END = 900
const ZOOM = 650
const FADE = 250
// Lift is a fraction of the logo's width so it looks the same on every phone.
const LIFT = 0.245

const REDUCED_MOTION_HOLD = 900

function shouldShow() {
  return (
    window.navigator.standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches ||
    Capacitor.isNativePlatform() ||
    new URLSearchParams(window.location.search).has('splash')
  )
}

function endBoot() {
  document.documentElement.classList.remove('booting')
}

// First-time users land on the (black) welcome screen, everyone else on the
// app background; the zoom ends on that color so nothing changes at the swap.
function destinationColor() {
  return window.location.hash.startsWith('#/welcome') ? STATUS_COLORS.black : STATUS_COLORS.app
}

export default function SplashScreen() {
  const [show] = useState(() => {
    const visible = shouldShow()
    // Before the first effect runs, so screens mounting underneath can't
    // change the status bar while the splash is up.
    if (visible) holdStatusBarColor(STATUS_COLORS.black)
    return visible
  })
  const [done, setDone] = useState(!show)
  const overlayRef = useRef(null)
  const zoomRef = useRef(null)
  const groupRef = useRef(null)
  const wordRef = useRef(null)
  const dotRef = useRef(null)

  useEffect(() => {
    if (!show) {
      endBoot()
      releaseStatusBarColor()
    }
  }, [show])

  useEffect(() => {
    if (!show || !overlayRef.current) return
    const timers = []
    const animations = []
    let cancelled = false

    const later = (fn, ms) => timers.push(setTimeout(fn, ms))
    const run = (el, keyframes, options) => {
      const a = el.animate(keyframes, { fill: 'forwards', ...options })
      animations.push(a)
      return a
    }

    function finish(endColor) {
      if (cancelled) return
      const fade = run(overlayRef.current, [{ opacity: 1 }, { opacity: 0 }], { duration: FADE })
      fade.finished.then(() => {
        if (cancelled) return
        releaseStatusBarColor()
        setDone(true)
      }).catch(() => {})
    }

    function zoomIntoDot() {
      if (cancelled) return
      const endColor = destinationColor()
      const overlay = overlayRef.current.getBoundingClientRect()
      const dot = dotRef.current.getBoundingClientRect()
      const cx = dot.left + dot.width / 2 - overlay.left
      const cy = dot.top + dot.height / 2 - overlay.top
      const scale = (Math.hypot(overlay.width, overlay.height) / 2 / (dot.width / 2)) * 1.06
      zoomRef.current.style.transformOrigin = `${cx}px ${cy}px`
      // The dot settles into the next screen's color as it fills the screen.
      run(dotRef.current, [{ fill: logo.big }, { fill: endColor }], {
        duration: ZOOM * 0.55,
        delay: ZOOM * 0.45,
        easing: 'linear',
      })
      const zoom = run(
        zoomRef.current,
        [
          { transform: 'translate(0, 0) scale(1)' },
          { transform: `translate(${overlay.width / 2 - cx}px, ${overlay.height / 2 - cy}px) scale(${scale})` },
        ],
        { duration: ZOOM, easing: 'cubic-bezier(0.6, 0, 0.9, 0.5)' }
      )
      zoom.finished.then(() => {
        if (cancelled) return
        // Screen is solid endColor now: the top bar and the page underneath
        // match it, so nothing at the edges changes color on its own.
        overlayRef.current.style.background = endColor
        holdStatusBarColor(endColor)
        endBoot()
        finish(endColor)
      }).catch(() => {})
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      wordRef.current.style.opacity = 1
      groupRef.current.style.transform = `translateY(${-LIFT * groupRef.current.offsetWidth}px)`
      later(() => {
        const endColor = destinationColor()
        overlayRef.current.style.background = endColor
        holdStatusBarColor(endColor)
        endBoot()
        finish(endColor)
      }, REDUCED_MOTION_HOLD)
    } else {
      // The zoom is measured from wherever the lift actually ended, so it
      // waits on the animation itself rather than a timer that could drift.
      const liftPx = -LIFT * groupRef.current.offsetWidth
      const lift = run(groupRef.current, [{ transform: 'translateY(0)' }, { transform: `translateY(${liftPx}px)` }], {
        duration: MOVE,
        delay: HOLD_START,
        easing: 'cubic-bezier(0.65, 0, 0.35, 1)',
      })
      run(
        wordRef.current,
        [
          { opacity: 0, transform: 'translateY(10px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ],
        { duration: 380, delay: HOLD_START + MOVE * 0.4, easing: 'ease-out' }
      )
      lift.finished.then(() => later(zoomIntoDot, HOLD_END)).catch(() => {})
    }

    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
      animations.forEach((a) => a.cancel())
    }
  }, [show])

  if (done) return null

  const small = new Set(logo.smallCells.map(([r, c]) => `${r}-${c}`))
  const cells = []
  for (let row = 0; row < logo.rows; row++) {
    for (let col = 0; col < logo.columns; col++) {
      const key = `${row}-${col}`
      const isSmall = small.has(key)
      const isZoomTarget = row === logo.zoomCell[0] && col === logo.zoomCell[1]
      cells.push(
        <circle
          key={key}
          ref={isZoomTarget ? dotRef : undefined}
          cx={logo.bigDiameter / 2 + col * logo.pitchX}
          cy={logo.bigDiameter / 2 + row * logo.pitchY}
          r={(isSmall ? logo.smallDiameter : logo.bigDiameter) / 2}
          fill={isSmall ? logo.small : logo.big}
        />
      )
    }
  }

  return (
    <div className="splash" ref={overlayRef}>
      <div className="splash-zoom" ref={zoomRef}>
        <div className="splash-group" ref={groupRef}>
          <svg className="splash-logo" viewBox={`0 0 ${logo.width} ${logo.height}`} aria-hidden="true">
            {cells}
          </svg>
          <div className="splash-word" ref={wordRef}>tally</div>
        </div>
      </div>
    </div>
  )
}
