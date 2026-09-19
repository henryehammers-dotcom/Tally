import { useState } from 'react'
import Questionnaire from './Questionnaire'

export default function Welcome() {
  const [started, setStarted] = useState(false)

  if (started) {
    return <Questionnaire />
  }

  return (
    <div
      data-debug-target
      style={{
        // position:fixed + inset:0 anchors directly to the true visual
        // viewport edges (respecting viewport-fit=cover), independent of
        // #root's dvh-based sizing. dvh has been the source of two
        // separate full-bleed bugs already (a top sliver from a double
        // dvh calculation, then a bottom gap in standalone PWA mode where
        // dvh under-counts the home-indicator safe area) — anchoring
        // directly to the viewport sidesteps both instead of chasing
        // more dvh edge cases.
        position: 'fixed',
        inset: 0,
        overflowY: 'auto',
        background: '#0cc0df',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        textAlign: 'center',
        padding: 32,
      }}
    >
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>Welcome to Tally!</h1>
      <p style={{ fontSize: 15, opacity: 0.9, marginBottom: 32 }}>
        Helping you fulfill your workout goals is what we're all about
      </p>
      <button
        onClick={() => setStarted(true)}
        style={{
          background: 'white',
          color: '#0cc0df',
          fontWeight: 800,
          padding: '14px 28px',
          borderRadius: 999,
          fontSize: 16,
        }}
      >
        Let's get started
      </button>
    </div>
  )
}
