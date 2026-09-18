import { useState } from 'react'
import { getRoutines } from '../lib/storage'
import { createRoutineFromScratch, addExerciseToRoutine } from '../lib/routines'
import NewRoutineForm from './NewRoutineForm'
import './Popup.css'
import './RoutinePickerPopup.css'

export default function RoutinePickerPopup({ exercise, onClose, onAdded }) {
  const [showCreate, setShowCreate] = useState(false)
  const [error, setError] = useState(null)
  const routines = getRoutines()

  function handlePick(routine) {
    try {
      addExerciseToRoutine(routine.id, exercise.id, {
        sets: exercise.defaultSets,
        reps: exercise.defaultReps,
        rest: exercise.defaultRest,
        duration: exercise.defaultDuration,
        distance: exercise.defaultDistance,
      })
      onAdded(routine.id)
    } catch (e) {
      setError(e.message)
    }
  }

  function handleCreate({ name, color }) {
    const routine = createRoutineFromScratch(name, color)
    addExerciseToRoutine(routine.id, exercise.id, {
      sets: exercise.defaultSets,
      reps: exercise.defaultReps,
      rest: exercise.defaultRest,
      duration: exercise.defaultDuration,
      distance: exercise.defaultDistance,
    })
    onAdded(routine.id)
  }

  if (showCreate) {
    return (
      <NewRoutineForm
        title="Create New Routine"
        onClose={() => setShowCreate(false)}
        onCreate={handleCreate}
      />
    )
  }

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-card" onClick={(e) => e.stopPropagation()}>
        <button className="popup-close" onClick={onClose}>
          <svg width="16" height="16" viewBox="0 0 16 16">
            <line x1="2" y1="2" x2="14" y2="14" stroke="black" strokeWidth="2" strokeLinecap="round" />
            <line x1="14" y1="2" x2="2" y2="14" stroke="black" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <div className="popup-title">Choose Routine</div>

        {error && <div className="popup-error">{error}</div>}

        <div className="routine-picker-list">
          {routines.map((r) => (
            <button key={r.id} className="routine-picker-row" onClick={() => handlePick(r)}>
              <span className="routine-picker-dot" style={{ background: r.color }} />
              {r.name}
            </button>
          ))}
          <button className="routine-picker-row routine-picker-create" onClick={() => setShowCreate(true)}>
            <span className="routine-picker-plus">+</span>
            Create New Routine
          </button>
        </div>
      </div>
    </div>
  )
}
