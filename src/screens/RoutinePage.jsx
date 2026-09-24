import { useState, useEffect, useRef, forwardRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getRoutineById, removeExerciseFromRoutine, reorderRoutineExercises } from '../lib/routines'
import { getExerciseById } from '../lib/library'
import { getSessionDay } from '../lib/storage'
import { todayKey } from '../lib/dates'
import { usePressTiers } from '../lib/usePressTiers'
import './RoutinePage.css'

export default function RoutinePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [routine, setRoutine] = useState(null)
  const [loggedExerciseIds, setLoggedExerciseIds] = useState(new Set())
  const [optionsId, setOptionsId] = useState(null)
  const [draggingId, setDraggingId] = useState(null)
  const [order, setOrder] = useState([])
  const cardRefs = useRef({})

  function refresh() {
    const r = getRoutineById(id)
    setRoutine(r)
    if (r) setOrder(r.exercises.map((e) => e.exerciseId))

    const today = getSessionDay(todayKey())
    const logged = new Set()
    today?.sessions?.forEach((s) => {
      if (s.routineId === id) {
        s.loggedExercises.forEach((e) => logged.add(e.exerciseId))
      }
    })
    setLoggedExerciseIds(logged)
  }

  useEffect(() => {
    refresh()
  }, [id])

  if (!routine) {
    return (
      <div className="screen">
        <p>Routine not found.</p>
      </div>
    )
  }

  function handleDelete(exerciseId) {
    removeExerciseFromRoutine(routine.id, exerciseId)
    setOptionsId(null)
    refresh()
  }

  function handleDragMove(exerciseId, clientY) {
    let closestId = null
    let closestDist = Infinity
    Object.entries(cardRefs.current).forEach(([exId, el]) => {
      if (!el) return
      const rect = el.getBoundingClientRect()
      const centerY = rect.top + rect.height / 2
      const dist = Math.abs(clientY - centerY)
      if (dist < closestDist) {
        closestDist = dist
        closestId = exId
      }
    })
    if (closestId && closestId !== exerciseId) {
      setOrder((prev) => {
        const next = [...prev]
        const from = next.indexOf(exerciseId)
        const to = next.indexOf(closestId)
        if (from === -1 || to === -1) return prev
        next.splice(from, 1)
        next.splice(to, 0, exerciseId)
        return next
      })
    }
  }

  function handleDragEnd() {
    setDraggingId(null)
    reorderRoutineExercises(routine.id, order)
    refresh()
  }

  return (
    <div className="screen">
      <div className="routine-header">
        <div className="routine-header-title">
          <div className="routine-subtitle">Today's workout is</div>
          <div className="routine-title">{routine.name}</div>
        </div>
        <div className="routine-header-actions">
          <button className="back-button" onClick={() => navigate('/home')}>
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path d="M11 3L5 9L11 15" stroke="black" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </button>
          <button
            className="add-button"
            style={{ background: routine.color }}
            onClick={() => navigate(`/library?addTo=${routine.id}`)}
          >
            Add
          </button>
        </div>
      </div>

      {routine.exercises.length === 0 ? (
        <div className="empty-state">
          No exercises in this routine. Tap "Add" to add some.
        </div>
      ) : (
        <div className="routine-exercise-list">
          {order.map((exerciseId) => {
            const entry = routine.exercises.find((e) => e.exerciseId === exerciseId)
            const exercise = entry && getExerciseById(exerciseId)
            if (!exercise) return null
            const isLogged = loggedExerciseIds.has(exerciseId)

            return (
              <ExerciseCard
                key={exerciseId}
                ref={(el) => (cardRefs.current[exerciseId] = el)}
                exercise={exercise}
                routineColor={routine.color}
                isLogged={isLogged}
                isDragging={draggingId === exerciseId}
                showOptions={optionsId === exerciseId}
                onTap={() => navigate(`/log/${routine.id}/${exerciseId}`)}
                onOptions={() => setOptionsId(exerciseId)}
                onCloseOptions={() => setOptionsId(null)}
                onDelete={() => handleDelete(exerciseId)}
                onDragStart={() => {
                  setOptionsId(null)
                  setDraggingId(exerciseId)
                }}
                onDragMove={(clientY) => handleDragMove(exerciseId, clientY)}
                onDragEnd={handleDragEnd}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

const ExerciseCard = forwardRef(function ExerciseCard({
  exercise, routineColor, isLogged, isDragging, showOptions,
  onTap, onOptions, onCloseOptions, onDelete, onDragStart, onDragMove, onDragEnd,
}, ref) {
  const { ref: pressRef, ...pressHandlers } = usePressTiers({
    onTap: () => {
      if (showOptions) {
        onCloseOptions()
      } else {
        onTap()
      }
    },
    onOptions,
    onDragStart,
    onDragMove: (x, y) => onDragMove(y),
    onDragEnd,
  })

  return (
    <div className={`routine-exercise-card-wrap ${isDragging ? 'is-dragging' : ''}`}>
      <button
        ref={(el) => {
          pressRef(el)
          if (typeof ref === 'function') ref(el)
        }}
        className="routine-exercise-card no-select"
        style={{ borderColor: routineColor }}
        {...pressHandlers}
      >
        <div className="routine-exercise-circle" style={{ background: routineColor }} />
        <div className="routine-exercise-name">{exercise.name}</div>
        {isLogged && <div className="routine-exercise-check">✓</div>}
      </button>
      {showOptions && (
        <button className="routine-exercise-delete" onClick={onDelete}>
          Remove from routine
        </button>
      )}
    </div>
  )
})
