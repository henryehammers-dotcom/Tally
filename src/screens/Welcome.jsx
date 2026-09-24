import { useState, useEffect } from 'react'
import Questionnaire from './Questionnaire'
import { STATUS_COLORS, setStatusBarColor } from '../lib/nativeStatusBar'

export default function Welcome() {
  const [started, setStarted] = useState(false)

  // The welcome screen and the questionnaire are both black: paint the page
  // background and the status bar to match so no edge shows a different color.
  useEffect(() => {
    document.body.style.background = STATUS_COLORS.black
    setStatusBarColor(STATUS_COLORS.black)
    return () => {
      document.body.style.background = ''
      setStatusBarColor(STATUS_COLORS.app)
    }
  }, [])

  if (started) {
    return <Questionnaire />
  }

  return (
    <div
      style={{
        minHeight: '100%',
        width: '100%',
        background: 'var(--black)',
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
          color: 'var(--brand)',
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
