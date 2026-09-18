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
        // Was minHeight: '100dvh'. #root is ALSO sized to 100dvh — two
        // independent dvh calculations at different DOM depths can
        // resolve a few px apart on iOS Safari as the chrome animates,
        // which is exactly the top sliver you saw. Filling #root's own
        // 100% instead removes the second independent calculation.
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
