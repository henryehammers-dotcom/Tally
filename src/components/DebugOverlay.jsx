import { useEffect, useState } from 'react'

// Temporary diagnostic overlay. Reports real measured dimensions directly
// on screen so we can see actual numbers from a phone without needing a
// cable or Safari's Web Inspector. Remove once the layout bugs are
// confirmed fixed — this is not meant to ship long-term.
export default function DebugOverlay() {
  const [info, setInfo] = useState(null)

  useEffect(() => {
    function measure() {
      const root = document.getElementById('root')
      const rootRect = root?.getBoundingClientRect()
      const screenEl = document.querySelector('.screen') || document.querySelector('[data-debug-target]')
      const screenRect = screenEl?.getBoundingClientRect()

      setInfo({
        windowInner: `${window.innerWidth} x ${window.innerHeight}`,
        visualViewport: window.visualViewport
          ? `${window.visualViewport.width.toFixed(0)} x ${window.visualViewport.height.toFixed(0)} @ (${window.visualViewport.offsetLeft.toFixed(0)}, ${window.visualViewport.offsetTop.toFixed(0)})`
          : 'n/a',
        docScroll: `${document.documentElement.scrollWidth} x ${document.documentElement.scrollHeight}`,
        rootRect: rootRect
          ? `${rootRect.width.toFixed(0)} x ${rootRect.height.toFixed(0)} @ (${rootRect.left.toFixed(0)}, ${rootRect.top.toFixed(0)})`
          : 'not found',
        screenRect: screenRect
          ? `${screenRect.width.toFixed(0)} x ${screenRect.height.toFixed(0)} @ (${screenRect.left.toFixed(0)}, ${screenRect.top.toFixed(0)})`
          : 'not found',
        dpr: window.devicePixelRatio,
      })
    }

    measure()
    window.addEventListener('resize', measure)
    window.visualViewport?.addEventListener('resize', measure)
    const t = setTimeout(measure, 500) // catch late layout shifts (fonts, dvh settling)

    return () => {
      window.removeEventListener('resize', measure)
      window.visualViewport?.removeEventListener('resize', measure)
      clearTimeout(t)
    }
  }, [])

  if (!info) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 99999,
        background: 'rgba(0,0,0,0.85)',
        color: '#0f0',
        fontFamily: 'monospace',
        fontSize: 11,
        padding: '8px 10px',
        lineHeight: 1.5,
        pointerEvents: 'none',
      }}
    >
      <div>window.inner: {info.windowInner}</div>
      <div>visualViewport: {info.visualViewport}</div>
      <div>doc.scroll: {info.docScroll}</div>
      <div>#root rect: {info.rootRect}</div>
      <div>.screen rect: {info.screenRect}</div>
      <div>devicePixelRatio: {info.dpr}</div>
    </div>
  )
}
