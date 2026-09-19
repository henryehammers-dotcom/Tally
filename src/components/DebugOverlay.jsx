import { useState, useEffect } from 'react'

// TEMPORARY — diagnosing the bottom-gap bug. Remove once fixed.
export default function DebugOverlay() {
  const [info, setInfo] = useState(null)

  useEffect(() => {
    function measure() {
      const root = document.getElementById('root')
      const rootRect = root.getBoundingClientRect()

      const probe = document.createElement('div')
      probe.style.position = 'fixed'
      probe.style.top = '0'
      probe.style.paddingTop = 'env(safe-area-inset-top)'
      probe.style.paddingBottom = 'env(safe-area-inset-bottom)'
      probe.style.visibility = 'hidden'
      document.body.appendChild(probe)
      const cs = getComputedStyle(probe)
      const safeTop = cs.paddingTop
      const safeBottom = cs.paddingBottom
      document.body.removeChild(probe)

      const isStandalone = window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches
      const trueAppHeight = getComputedStyle(document.documentElement).getPropertyValue('--true-app-height')

      setInfo({
        innerHeight: window.innerHeight,
        outerHeight: window.outerHeight,
        docClientHeight: document.documentElement.clientHeight,
        rootTop: Math.round(rootRect.top),
        rootBottom: Math.round(rootRect.bottom),
        rootHeight: Math.round(rootRect.height),
        safeTop,
        safeBottom,
        isStandalone,
        dpr: window.devicePixelRatio,
        trueAppHeight,
      })
    }
    measure()
    window.addEventListener('resize', measure)
    const t = setTimeout(measure, 500)
    return () => {
      window.removeEventListener('resize', measure)
      clearTimeout(t)
    }
  }, [])

  if (!info) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 4,
        left: 4,
        right: 4,
        zIndex: 99999,
        background: 'black',
        color: '#0f0',
        fontSize: 10,
        fontFamily: 'monospace',
        padding: 6,
        borderRadius: 6,
        lineHeight: 1.5,
        pointerEvents: 'none',
      }}
    >
      standalone: {String(info.isStandalone)} | dpr: {info.dpr}<br />
      innerH: {info.innerHeight} outerH: {info.outerHeight} docClientH: {info.docClientHeight}<br />
      root top:{info.rootTop} bottom:{info.rootBottom} h:{info.rootHeight}<br />
      safeTop:{info.safeTop} safeBottom:{info.safeBottom} trueAppH:{info.trueAppHeight}
    </div>
  )
}
