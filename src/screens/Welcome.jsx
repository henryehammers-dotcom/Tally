import { useState, useEffect } from 'react'
import Questionnaire from './Questionnaire'

export default function Welcome() {
  const [started, setStarted] = useState(false)

  // Paints the page background blue too, so any strip iOS leaves outside the
  // page area matches the welcome screen. Questionnaire is white.
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
      style={{
        minHeight: '100%',
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
