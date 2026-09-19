import { useEffect, useState } from 'react'
import { Capacitor } from '@capacitor/core'
import { setStatusBarOnBlue } from '../lib/nativeStatusBar'
import markUrl from '../assets/splash-mark.png?inline'
import './SplashScreen.css'

const HOLD_MS = 1600
const FADE_MS = 400

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
    document.documentElement.classList.add('splash-active')
    setStatusBarOnBlue(true)
    const fade = setTimeout(() => {
      const onWelcome = window.location.hash.startsWith('#/welcome')
      setStatusBarOnBlue(onWelcome)
      setPhase('fade')
    }, HOLD_MS)
    return () => clearTimeout(fade)
  }, [phase])

  useEffect(() => {
    if (phase !== 'fade') return
    const done = setTimeout(() => {
      document.documentElement.classList.remove('splash-active')
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
