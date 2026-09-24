import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getRoutineById } from '../lib/routines'
import { getExerciseById } from '../lib/library'
import { logSet, getCurrentSetCount } from '../lib/sessions'
import ExerciseInfoPopup from '../components/ExerciseInfoPopup'
import './LogPage.css'

function parseRestSeconds(restStr) {
  if (!restStr) return null
  const match = restStr.match(/(\d+)(?:-(\d+))?\s*(sec|min)/i)
  if (!match) return null
  const value = parseInt(match[1], 10)
  const unit = match[3].toLowerCase()
  return unit === 'min' ? value * 60 : value
}

export default function LogPage() {
  const { routineId, exerciseId } = useParams()
  const navigate = useNavigate()
  const [routine, setRoutine] = useState(null)
  const [exercise, setExercise] = useState(null)
  const [targets, setTargets] = useState(null)
  const [setsLogged, setSetsLogged] = useState(0)
  const [showInfo, setShowInfo] = useState(false)

  const [reps, setReps] = useState('')
  const [weight, setWeight] = useState('')
  const [hr, setHr] = useState('')
  const [min, setMin] = useState('')
  const [sec, setSec] = useState('')
  const [miles, setMiles] = useState('')

  const [resting, setResting] = useState(false)
  const [arcRunning, setArcRunning] = useState(false)
  const [restRemaining, setRestRemaining] = useState(0)
  const [restTotal, setRestTotal] = useState(0)
  const intervalRef = useRef(null)

  useEffect(() => {
    const r = getRoutineById(routineId)
    const ex = getExerciseById(exerciseId)
    setRoutine(r)
    setExercise(ex)
    if (r) {
      const t = r.exercises.find((e) => e.exerciseId === exerciseId)
      setTargets(t)
      setSetsLogged(getCurrentSetCount(routineId, exerciseId))
    }
  }, [routineId, exerciseId])

  useEffect(() => {
    return () => clearInterval(intervalRef.current)
  }, [])

  if (!routine || !exercise || !targets) {
    return (
      <div className="screen">
        <p>Loading...</p>
      </div>
    )
  }

  const isCardio = exercise.type === 'cardio'
  const hasDistance = exercise.defaultDistance != null || targets.distance != null
  const restSeconds = !isCardio ? parseRestSeconds(targets.rest) : null
  const countsSets = !isCardio

  function clearInputs() {
    setReps('')
    setWeight('')
    setHr('')
    setMin('')
    setSec('')
    setMiles('')
  }

  function startRest() {
    if (!restSeconds) {
      return
    }
    setRestTotal(restSeconds)
    setRestRemaining(restSeconds)
    setArcRunning(false)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setArcRunning(true))
    })
    setResting(true)
    intervalRef.current = setInterval(() => {
      setRestRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          setResting(false)
          setArcRunning(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  function skipRest() {
    clearInterval(intervalRef.current)
    setResting(false)
    setArcRunning(false)
    setRestRemaining(0)
  }

  function handleLog() {
    let setData = {}
    if (exercise.logType === 'weighted') {
      if (!reps || !weight) return
      setData = { reps: Number(reps), weight: Number(weight), unit: 'lbs' }
    } else if (exercise.logType === 'bodyweight') {
      if (!reps) return
      setData = { reps: Number(reps) }
    } else if (exercise.logType === 'timed') {
      const totalSeconds = (Number(hr) || 0) * 3600 + (Number(min) || 0) * 60 + (Number(sec) || 0)
      if (totalSeconds === 0) return
      setData = { duration: totalSeconds }
      if (hasDistance && miles) {
        setData.distance = Number(miles)
      }
    }

    logSet({
      routineId: routine.id,
      routineName: routine.name,
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      logType: exercise.logType,
      setData,
    })

    setSetsLogged(getCurrentSetCount(routine.id, exercise.id))
    clearInputs()
    startRest()
  }

  function formatCountdown(s) {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${String(sec).padStart(2, '0')}`
  }

  const arcProgress = restTotal > 0 ? 1 - restRemaining / restTotal : 0
  const circumference = 2 * Math.PI * 46
  const dashOffset = circumference * (1 - arcProgress)

  return (
    <div className="screen log-screen">
      <div className="log-header">
        <div className="log-title-group">
          <div className="log-title">{exercise.name}</div>
          <button className="log-info-button" onClick={() => setShowInfo(true)} aria-label="How to do this exercise">
            <svg width="26" height="26" viewBox="0 0 26 26">
              <circle cx="13" cy="13" r="11" stroke="var(--black)" strokeWidth="2" fill="none" />
              <circle cx="13" cy="7.6" r="1.4" fill="var(--black)" />
              <line x1="13" y1="11" x2="13" y2="19" stroke="var(--black)" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <button className="log-close" onClick={() => navigate(-1)}>
          <svg width="18" height="18" viewBox="0 0 18 18">
            <line x1="2" y1="2" x2="16" y2="16" stroke="var(--black)" strokeWidth="2" strokeLinecap="round" />
            <line x1="16" y1="2" x2="2" y2="16" stroke="var(--black)" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="log-circle-area">
        <div className="log-circle">
          <svg className="log-circle-arc" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" fill={routine.color} />
            <circle
              className={resting ? 'rest-arc rest-arc-active' : 'rest-arc'}
              cx="50" cy="50" r="46"
              fill="none"
              stroke="var(--amber)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={arcRunning ? 0 : circumference}
              style={resting ? { transitionDuration: `${restTotal}s` } : undefined}
              transform="rotate(-90 50 50)"
            />
          </svg>
          <div className="log-circle-content">
            {resting ? (
              <>
                <div className="log-circle-label">REST</div>
                <div className={`log-circle-countdown ${formatCountdown(restRemaining).length > 4 ? 'log-circle-countdown-long' : ''}`}>
                  {formatCountdown(restRemaining)}
                </div>
              </>
            ) : countsSets ? (
              <div className="log-circle-set">Set {setsLogged + 1}</div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="log-bottom">
        <div className="log-summary">
          {isCardio ? (
            <span>{targets.duration || exercise.defaultDuration}</span>
          ) : exercise.logType === 'timed' ? (
            <span>{targets.sets} sets &middot; {targets.duration || exercise.defaultDuration} &middot; {targets.rest} rest</span>
          ) : (
            <span>{targets.sets} sets &middot; {targets.reps} reps &middot; {targets.rest} rest</span>
          )}
        </div>

        {resting ? (
          <button className="log-action-button" style={{ background: routine.color }} onClick={skipRest}>
            SKIP
          </button>
        ) : (
          <>
            {exercise.logType === 'weighted' && (
              <div className="log-inputs">
                <input type="text" inputMode="numeric" placeholder="Reps" value={reps} onChange={(e) => setReps(e.target.value)} />
                <input type="text" inputMode="numeric" placeholder="Weight" value={weight} onChange={(e) => setWeight(e.target.value)} />
              </div>
            )}
            {exercise.logType === 'bodyweight' && (
              <div className="log-inputs">
                <input type="text" inputMode="numeric" placeholder="Reps" value={reps} onChange={(e) => setReps(e.target.value)} />
              </div>
            )}
            {exercise.logType === 'timed' && (
              <>
                <div className="log-inputs log-inputs-time">
                  <input type="text" inputMode="numeric" placeholder="hr" value={hr} onChange={(e) => setHr(e.target.value)} />
                  <input type="text" inputMode="numeric" placeholder="min" value={min} onChange={(e) => setMin(e.target.value)} />
                  <input type="text" inputMode="numeric" placeholder="sec" value={sec} onChange={(e) => setSec(e.target.value)} />
                </div>
                {hasDistance && (
                  <div className="log-inputs">
                    <input type="text" inputMode="decimal" placeholder="Miles" value={miles} onChange={(e) => setMiles(e.target.value)} />
                  </div>
                )}
              </>
            )}

            <button className="log-action-button" style={{ background: routine.color }} onClick={handleLog}>
              LOG IT
            </button>
          </>
        )}
      </div>

      {showInfo && <ExerciseInfoPopup exercise={exercise} onClose={() => setShowInfo(false)} />}
    </div>
  )
}
