import { useState, useEffect, useRef } from 'react'
import './Timer.css'

const ITEM_HEIGHT = 52
const VISIBLE_ITEMS = 3
const PAD = (ITEM_HEIGHT * (VISIBLE_ITEMS - 1)) / 2

function range(n) {
  return Array.from({ length: n }, (_, i) => i)
}

function DrumColumn({ max, value, onChange, label }) {
  const ref = useRef(null)
  const scrolling = useRef(false)

  useEffect(() => {
    if (ref.current && !scrolling.current) {
      ref.current.scrollTop = value * ITEM_HEIGHT
    }
  }, [value])

  function handleScroll() {
    scrolling.current = true
    clearTimeout(ref.current._t)
    ref.current._t = setTimeout(() => {
      const idx = Math.round(ref.current.scrollTop / ITEM_HEIGHT)
      scrolling.current = false
      if (idx !== value) onChange(idx)
      ref.current.scrollTop = idx * ITEM_HEIGHT
    }, 120)
  }

  return (
    <div className="drum-col-wrap">
      <div className="drum-col" ref={ref} onScroll={handleScroll} style={{ paddingTop: PAD, paddingBottom: PAD }}>
        {range(max).map((n) => (
          <div key={n} className={`drum-item ${n === value ? 'drum-item-active' : ''}`} style={{ height: ITEM_HEIGHT }}>
            {String(n).padStart(2, '0')}
          </div>
        ))}
      </div>
      <div className="drum-label">{label}</div>
    </div>
  )
}

function formatClock(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = String(totalSeconds % 60).padStart(2, '0')
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${s}`
  return `${m}:${s}`
}

// status: 'idle' | 'running' | 'paused'
export default function Timer() {
  const [mode, setMode] = useState('timer')
  const [hr, setHr] = useState(0)
  const [min, setMin] = useState(0)
  const [sec, setSec] = useState(0)
  const [status, setStatus] = useState('idle')
  const [remaining, setRemaining] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const intervalRef = useRef(null)

  function clearTimer() {
    clearInterval(intervalRef.current)
    intervalRef.current = null
  }

  function resetAll() {
    clearTimer()
    setStatus('idle')
    setRemaining(0)
    setElapsed(0)
  }

  function switchMode(next) {
    if (next === mode) return
    resetAll()
    setMode(next)
  }

  function tickTimer() {
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearTimer()
          setStatus('idle')
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  function tickStopwatch() {
    intervalRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1)
    }, 1000)
  }

  function handleStartOrResume() {
    if (mode === 'timer') {
      if (status === 'idle') {
        const total = hr * 3600 + min * 60 + sec
        if (total === 0) return
        setRemaining(total)
      }
      setStatus('running')
      tickTimer()
    } else {
      if (status === 'idle') {
        setElapsed(0)
      }
      setStatus('running')
      tickStopwatch()
    }
  }

  function handleStop() {
    clearTimer()
    setStatus('paused')
  }

  function handleReset() {
    resetAll()
  }

  useEffect(() => () => clearTimer(), [])

  const isDrumScrollerVisible = mode === 'timer' && status === 'idle'
  const displaySeconds = mode === 'timer' ? remaining : elapsed

  return (
    <div className="screen timer-screen">
      <div className="timer-toggle-row">
        <button className={`toggle-btn ${mode === 'timer' ? 'toggle-active' : ''}`} onClick={() => switchMode('timer')}>Timer</button>
        <button className={`toggle-btn ${mode === 'stopwatch' ? 'toggle-active' : ''}`} onClick={() => switchMode('stopwatch')}>Stopwatch</button>
      </div>

      <div className="timer-circle-area">
        <div className="timer-circle">
          {isDrumScrollerVisible ? (
            <div className="drum-scroller">
              <DrumColumn max={24} value={hr} onChange={setHr} label="hr" />
              <DrumColumn max={60} value={min} onChange={setMin} label="min" />
              <DrumColumn max={60} value={sec} onChange={setSec} label="sec" />
            </div>
          ) : (
            <div className={`timer-clock ${formatClock(displaySeconds).length > 5 ? 'timer-clock-long' : ''}`}>
              {formatClock(displaySeconds)}
            </div>
          )}
        </div>
      </div>

      <div className="timer-buttons">
        <button className="timer-btn timer-btn-stop" onClick={handleReset}>Reset</button>
        {status === 'running' ? (
          <button className="timer-btn timer-btn-start" onClick={handleStop}>Stop</button>
        ) : (
          <button className="timer-btn timer-btn-start" onClick={handleStartOrResume}>Start</button>
        )}
      </div>
    </div>
  )
}
