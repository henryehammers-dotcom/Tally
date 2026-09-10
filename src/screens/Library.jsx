import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { MUSCLE_GROUPS, getMuscleGroupColor, getExercisesByMuscleGroup, presetRoutines, ALL_EXERCISES } from '../lib/library'
import { createRoutineFromPreset, addExerciseToRoutine, isNameTaken } from '../lib/routines'
import Popup from '../components/Popup'
import './Library.css'

export default function Library() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const addToRoutineId = searchParams.get('addTo')
  const [tab, setTab] = useState('exercises')
  const [activeMuscleGroup, setActiveMuscleGroup] = useState(null)
  const [showPresetPicker, setShowPresetPicker] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [errorPopup, setErrorPopup] = useState(null)

  function handleExerciseTap(exercise) {
    if (!addToRoutineId) return
    try {
      addExerciseToRoutine(addToRoutineId, exercise.id, {
        sets: exercise.defaultSets,
        reps: exercise.defaultReps,
        rest: exercise.defaultRest,
        duration: exercise.defaultDuration,
        distance: exercise.defaultDistance,
      })
      navigate(`/routine/${addToRoutineId}`)
    } catch (e) {
      setErrorPopup(e.message)
    }
  }

  function handlePickPreset(preset) {
    let name = preset.name
    let suffix = 2
    while (isNameTaken(name)) {
      name = `${preset.name} ${suffix}`
      suffix++
    }
    createRoutineFromPreset(preset.id, name)
    setShowPresetPicker(false)
    navigate('/home')
  }

  if (showSearch) {
    const query = searchQuery.trim().toLowerCase()
    const results = query
      ? ALL_EXERCISES.filter((ex) => ex.name.toLowerCase().includes(query))
      : []
    return (
      <div className="screen">
        <div className="library-header">
          <button className="back-link" onClick={() => { setShowSearch(false); setSearchQuery('') }}>← Search</button>
        </div>
        <input
          className="search-input"
          type="text"
          placeholder="Search exercises..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoFocus
        />
        {query && results.length === 0 && (
          <div className="empty-state">No exercises found for "{searchQuery}"</div>
        )}
        <div className="exercise-grid">
          {results.map((ex) => (
            <button key={ex.id} className="exercise-card" onClick={() => handleExerciseTap(ex)}>
              <div className="exercise-circle" style={{ background: getMuscleGroupColor(ex.muscleGroup) }} />
              <div className="exercise-name">{ex.name}</div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (activeMuscleGroup) {
    const exercises = getExercisesByMuscleGroup(activeMuscleGroup)
    const color = getMuscleGroupColor(activeMuscleGroup)
    return (
      <div className="screen">
        <div className="library-header">
          <button className="back-link" onClick={() => setActiveMuscleGroup(null)}>← {activeMuscleGroup}</button>
        </div>
        <div className="exercise-grid">
          {exercises.map((ex) => (
            <button key={ex.id} className="exercise-card" onClick={() => handleExerciseTap(ex)}>
              <div className="exercise-circle" style={{ background: color }} />
              <div className="exercise-name">{ex.name}</div>
            </button>
          ))}
        </div>
        {errorPopup && (
          <Popup
            title="Already in this routine"
            message={errorPopup}
            onClose={() => setErrorPopup(null)}
          />
        )}
      </div>
    )
  }

  if (showPresetPicker) {
    return (
      <div className="screen">
        <div className="library-header">
          <button className="back-link" onClick={() => setShowPresetPicker(false)}>← Choose a Preset</button>
        </div>
        <div className="exercise-grid">
          {presetRoutines.map((p) => (
            <button key={p.id} className="exercise-card" onClick={() => handlePickPreset(p)}>
              <div className="exercise-circle" style={{ background: p.color }} />
              <div className="exercise-name">{p.name}</div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="screen">
      <div className="library-header">
        <h1>Library</h1>
        {!addToRoutineId && (
          <div className="library-header-actions">
            <button className="search-button" onClick={() => setShowSearch(true)}>
              <svg width="20" height="20" viewBox="0 0 20 20">
                <circle cx="8.5" cy="8.5" r="6.5" stroke="black" strokeWidth="2" fill="none" />
                <line x1="13.2" y1="13.2" x2="18" y2="18" stroke="black" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <button className="plus-button" onClick={() => setShowPresetPicker(true)}>
              <svg width="20" height="20" viewBox="0 0 20 20">
                <line x1="10" y1="2" x2="10" y2="18" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
                <line x1="2" y1="10" x2="18" y2="10" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <div className="toggle-row">
        <button
          className={`toggle-btn ${tab === 'exercises' ? 'toggle-active' : ''}`}
          onClick={() => setTab('exercises')}
        >
          Exercises
        </button>
        <button
          className={`toggle-btn ${tab === 'history' ? 'toggle-active' : ''}`}
          onClick={() => setTab('history')}
        >
          History
        </button>
      </div>

      {tab === 'exercises' && (
        <div className="muscle-grid">
          {MUSCLE_GROUPS.map((mg) => (
            <button
              key={mg}
              className="muscle-bubble"
              style={{ background: getMuscleGroupColor(mg) }}
              onClick={() => setActiveMuscleGroup(mg)}
            >
              {mg}
            </button>
          ))}
        </div>
      )}

      {tab === 'history' && (
        <div className="empty-state">History view coming soon.</div>
      )}
    </div>
  )
}
