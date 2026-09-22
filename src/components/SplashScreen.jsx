import { useEffect, useState } from 'react'
import { Capacitor } from '@capacitor/core'
import { setStatusBarOnBlue } from '../lib/nativeStatusBar'
import markUrl from '../assets/splash-mark.png?inline'
import './SplashScreen.css'

const HOLD_MS = 1100
const FADE_MS = 350

// Add ?splash before the # (e.g. /Tally/?splash#/home) to preview in a browser.
function shouldShow() {
  return (
    window.navigator.standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches ||
    Capacitor.isNativePlatform() ||
    new URLSearchParams(window.location.search).has('splash')
  )
}

export default function SplashScreen() {
  const [phase, setPhase] = useState(() => (shouldShow() ? 'hold' : 'done'))

  useEffect(() => {
    if (phase !== 'hold') return
    setStatusBarOnBlue(true)
    const fade = setTimeout(() => setPhase('fade'), HOLD_MS)
    return () => clearTimeout(fade)
  }, [phase])

  useEffect(() => {
    if (phase !== 'fade') return
    // Switch the status bar only once the overlay has actually finished
    // fading out — flipping it the instant the fade starts left the screen
    // still visibly blue underneath a status bar that had already gone
    // white, which read as a flash.
    const done = setTimeout(() => {
      const onWelcome = window.location.hash.startsWith('#/welcome')
      setStatusBarOnBlue(onWelcome)
      setPhase('done')
    }, FADE_MS)
    return () => clearTimeout(done)
  }, [phase])

  if (phase === 'done') return null

  return (
    <div className={`splash ${phase === 'fade' ? 'splash-fade' : ''}`}>
      <img className="splash-mark" src={markUrl} alt="" />
    </div>
  )
}
