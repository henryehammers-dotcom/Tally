import { useState, useEffect } from 'react'
import Questionnaire from './Questionnaire'

export default function Welcome() {
  const [started, setStarted] = useState(false)

  // Belt-and-suspenders for the standalone-mode bottom gap: position:fixed
  // + inset:0 should already cover the full viewport on its own, but if
  // any edge case still leaves a sliver, painting the body itself blue
  // means there's nothing white underneath left to show through. Only
  // while showing the welcome content itself — Questionnaire is white.
  useEffect(() => {
    if (started) {
      document.body.style.background = ''
      return
    }
    document.body.style.background = '#0cc0df'
    return () => {
      document.body.style.background = ''
    }
  }, [started])

  if (started) {
    return <Questionnaire />
  }

  return (
    <div
      data-debug-target
      style={{
        // Same fix as #root (see index.css): position:fixed elements
        // can visually clip to a stale viewport on iOS even when their
        // computed layout box is correct, so this stays in normal flow
        // with an explicit min-height from --true-app-height instead.
        minHeight: 'var(--true-app-height, 100dvh)',
        width: '100%',
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
