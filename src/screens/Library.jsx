import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { MUSCLE_GROUPS, getMuscleGroupColor, getExercisesByMuscleGroup, getAvailableFilters, presetRoutines, ALL_EXERCISES } from '../lib/library'
import { createRoutineFromPreset, createRoutineFromScratch, addExerciseToRoutine, isNameTaken, getRoutineById } from '../lib/routines'
import Popup from '../components/Popup'
import TradingCard from '../components/TradingCard'
import RoutinePickerPopup from '../components/RoutinePickerPopup'
import CreateRoutinePopup from '../components/CreateRoutinePopup'
import NewRoutineForm from '../components/NewRoutineForm'
import FiltersPopup from '../components/FiltersPopup'
import LibraryHistory from './LibraryHistory'
import { hasPlusTooltipBeenShown, markPlusTooltipShown } from '../lib/storage'
import './Library.css'

function matchesFilters(exercise, filters) {
  const typeOk = filters.types.length === 0 || filters.types.includes(exercise.type)
  const equipmentOk = filters.equipment.length === 0 || filters.equipment.includes(exercise.equipment)
  return typeOk && equipmentOk
}

export default function Library() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const addToRoutineId = searchParams.get('addTo')
  const addToRoutine = addToRoutineId ? getRoutineById(addToRoutineId) : null
  const [tab, setTab] = useState('exercises')
  const [activeMuscleGroup, setActiveMuscleGroup] = useState(null)
  const [filters, setFilters] = useState({ types: [], equipment: [] })
  const [showFilters, setShowFilters] = useState(false)
  const [showPresetPicker, setShowPresetPicker] = useState(false)
  const [showCreateChoice, setShowCreateChoice] = useState(false)
  const [showScratchForm, setShowScratchForm] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [errorPopup, setErrorPopup] = useState(null)
  const [tradingCardExercise, setTradingCardExercise] = useState(null)
  const [routinePickerExercise, setRoutinePickerExercise] = useState(null)
  const [showPlusTooltip, setShowPlusTooltip] = useState(() => !addToRoutineId && !hasPlusTooltipBeenShown())

  function dismissPlusTooltip() {
    markPlusTooltipShown()
    setShowPlusTooltip(false)
  }

  useEffect(() => {
    setFilters({ types: [], equipment: [] })
  }, [activeMuscleGroup])

  function handleAddToRoutine(exercise) {
    try {
      addExerciseToRoutine(addToRoutineId, exercise.id, {
        sets: exercise.defaultSets,
        reps: exercise.defaultReps,
        rest: exercise.defaultRest,
        duration: exercise.defaultDuration,
        distance: exercise.defaultDistance,
      })
      setTradingCardExercise(null)
      navigate(`/routine/${addToRoutineId}`)
    } catch (e) {
      setTradingCardExercise(null)
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

  function handleCreateFromScratch({ name, color }) {
    const routine = createRoutineFromScratch(name, color)
    setShowScratchForm(false)
    navigate(`/library?addTo=${routine.id}`)
  }

  const tradingCardColor = tradingCardExercise
    ? (addToRoutine ? addToRoutine.color : getMuscleGroupColor(tradingCardExercise.muscleGroup))
    : null

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
            <button key={ex.id} className="exercise-card" onClick={() => setTradingCardExercise(ex)}>
              <div className="exercise-circle" style={{ background: getMuscleGroupColor(ex.muscleGroup) }} />
              <div className="exercise-name">{ex.name}</div>
            </button>
          ))}
        </div>

        {tradingCardExercise && (
          <TradingCard
            exercise={tradingCardExercise}
            color={tradingCardColor}
            actionLabel={addToRoutineId ? 'Add to Routine' : 'Choose Routine'}
            onAction={() => {
              if (addToRoutineId) {
                handleAddToRoutine(tradingCardExercise)
              } else {
                setRoutinePickerExercise(tradingCardExercise)
                setTradingCardExercise(null)
              }
            }}
            onClose={() => setTradingCardExercise(null)}
          />
        )}
        {routinePickerExercise && (
          <RoutinePickerPopup
            exercise={routinePickerExercise}
            onClose={() => setRoutinePickerExercise(null)}
            onAdded={(routineId) => { setRoutinePickerExercise(null); navigate(`/routine/${routineId}`) }}
          />
        )}
      </div>
    )
  }

  if (activeMuscleGroup) {
    const exercises = getExercisesByMuscleGroup(activeMuscleGroup).filter((ex) => matchesFilters(ex, filters))
    const color = getMuscleGroupColor(activeMuscleGroup)
    const available = getAvailableFilters(activeMuscleGroup)
    const filtersActive = filters.types.length > 0 || filters.equipment.length > 0

    return (
      <div className="screen">
        <div className="library-header">
          <button className="back-link" onClick={() => setActiveMuscleGroup(null)}>← {activeMuscleGroup}</button>
          <button className={`filters-button ${filtersActive ? 'filters-button-active' : ''}`} onClick={() => setShowFilters(true)}>
            Filters{filtersActive ? ` (${filters.types.length + filters.equipment.length})` : ''}
          </button>
        </div>
        {exercises.length === 0 ? (
          <div className="empty-state">No exercises match these filters.</div>
        ) : (
          <div className="exercise-grid">
            {exercises.map((ex) => (
              <button key={ex.id} className="exercise-card" onClick={() => setTradingCardExercise(ex)}>
                <div className="exercise-circle" style={{ background: color }} />
                <div className="exercise-name">{ex.name}</div>
              </button>
            ))}
          </div>
        )}
        {errorPopup && (
          <Popup
            title="Already in this routine"
            message={errorPopup}
            onClose={() => setErrorPopup(null)}
          />
        )}
        {showFilters && (
          <FiltersPopup
            available={available}
            selected={filters}
            onClose={() => setShowFilters(false)}
            onApply={(next) => { setFilters(next); setShowFilters(false) }}
          />
        )}
        {tradingCardExercise && (
          <TradingCard
            exercise={tradingCardExercise}
            color={tradingCardColor}
            actionLabel={addToRoutineId ? 'Add to Routine' : 'Choose Routine'}
            onAction={() => {
              if (addToRoutineId) {
                handleAddToRoutine(tradingCardExercise)
              } else {
                setRoutinePickerExercise(tradingCardExercise)
                setTradingCardExercise(null)
              }
            }}
            onClose={() => setTradingCardExercise(null)}
          />
        )}
        {routinePickerExercise && (
          <RoutinePickerPopup
            exercise={routinePickerExercise}
            onClose={() => setRoutinePickerExercise(null)}
            onAdded={(routineId) => { setRoutinePickerExercise(null); navigate(`/routine/${routineId}`) }}
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
            <div className="plus-button-wrap">
              <button
                className="plus-button"
                onClick={() => { setShowCreateChoice(true); if (showPlusTooltip) dismissPlusTooltip() }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20">
                  <line x1="10" y1="2" x2="10" y2="18" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
                  <line x1="2" y1="10" x2="18" y2="10" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
                </svg>
              </button>
              {showPlusTooltip && (
                <button className="plus-tooltip" onClick={dismissPlusTooltip}>
                  Tap here to build a routine
                </button>
              )}
            </div>
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
              style={{ background: getMuscleGroupColor(mg), fontSize: mg === 'Shoulders' ? 22 : undefined }}
              onClick={() => setActiveMuscleGroup(mg)}
            >
              {mg}
            </button>
          ))}
        </div>
      )}

      {tab === 'history' && <LibraryHistory />}

      {showCreateChoice && (
        <CreateRoutinePopup
          onClose={() => setShowCreateChoice(false)}
          onScratch={() => { setShowCreateChoice(false); setShowScratchForm(true) }}
          onPreset={() => { setShowCreateChoice(false); setShowPresetPicker(true) }}
        />
      )}
      {showScratchForm && (
        <NewRoutineForm
          title="Start from Scratch"
          onClose={() => setShowScratchForm(false)}
          onCreate={handleCreateFromScratch}
        />
      )}
    </div>
  )
}
