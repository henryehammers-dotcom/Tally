import { useState, useMemo } from 'react'
import {
  todayKey, getMonthLabel, addMonths, getCalendarCells, formatMonthDayYear, formatDayOfWeek,
} from '../lib/dates'
import { getDayActivitySummary, getSessionsForDate, getLoggedEntriesForExercise } from '../lib/sessions'
import { getExerciseById, ALL_EXERCISES } from '../lib/library'
import { get7DayBarData } from '../lib/stats'
import EditSetPopup from '../components/EditSetPopup'
import './LibraryHistory.css'

const WEEKDAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

function ZzzDot() {
  return <span className="history-dot history-rest-dot">z</span>
}

function formatSetLine(logType, set) {
  if (logType === 'weighted') return `${set.reps} reps @ ${set.weight} lbs`
  if (logType === 'bodyweight') return `${set.reps} reps`
  if (logType === 'timed') {
    const m = Math.floor(set.duration / 60)
    const s = set.duration % 60
    const dur = `${m}:${String(s).padStart(2, '0')}`
    return set.distance != null ? `${dur} · ${set.distance} mi` : dur
  }
  return ''
}

function formatBarValue(logType, metric, value) {
  if (value == null) return '—'
  if (logType === 'weighted') return `${Math.round(value)} e1RM`
  if (logType === 'bodyweight') return `${value} reps`
  if (logType === 'timed') {
    if (metric === 'distance') return `${value} mi`
    const m = Math.floor(value / 60)
    const s = Math.round(value % 60)
    return `${m}:${String(s).padStart(2, '0')}`
  }
  return String(value)
}

const BAR_COLOR = {
  up: 'var(--green)',
  down: 'var(--red)',
  equal: '#eceb36',
  pr: 'var(--blue)',
}

export default function LibraryHistory() {
  const now = new Date()
  const [cursor, setCursor] = useState({ year: now.getFullYear(), monthIndex: now.getMonth() })
  const [selectedDateKey, setSelectedDateKey] = useState(null)
  const [browseMode, setBrowseMode] = useState('routine')
  const [selectedSessionId, setSelectedSessionId] = useState(null)
  const [selectedExerciseId, setSelectedExerciseId] = useState(null)
  const [exerciseQuery, setExerciseQuery] = useState('')
  const [distanceMode, setDistanceMode] = useState(false)
  const [editing, setEditing] = useState(null)
  const [refreshTick, setRefreshTick] = useState(0)

  const cells = useMemo(() => getCalendarCells(cursor.year, cursor.monthIndex), [cursor, refreshTick])

  function selectDate(dateKey) {
    setSelectedDateKey(dateKey)
    setSelectedSessionId(null)
  }

  function changeMonth(delta) {
    setCursor((c) => addMonths(c.year, c.monthIndex, delta))
    setSelectedDateKey(null)
    setSelectedSessionId(null)
  }

  function refresh() {
    setRefreshTick((t) => t + 1)
  }

  const daySummary = selectedDateKey ? getDayActivitySummary(selectedDateKey) : null
  const daySessions = selectedDateKey ? getSessionsForDate(selectedDateKey) : []
  const selectedSession = daySessions.find((s) => s.id === selectedSessionId) || null

  const selectedExercise = selectedExerciseId ? getExerciseById(selectedExerciseId) : null
  const exerciseHasDistance = selectedExercise?.logType === 'timed' && selectedExercise?.defaultDistance != null
  const metric = exerciseHasDistance && distanceMode ? 'distance' : 'time'
  const barData = selectedExercise ? get7DayBarData(selectedExercise.id, metric) : []
  const entries = selectedExercise ? getLoggedEntriesForExercise(selectedExercise.id) : []

  const entriesByMonth = useMemo(() => {
    const groups = new Map()
    entries.forEach((e) => {
      const [y, m] = e.dateKey.split('-')
      const key = `${y}-${m}`
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key).push(e)
    })
    return Array.from(groups.entries()).map(([key, items]) => {
      const [y, m] = key.split('-').map(Number)
      return { label: new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }), items }
    })
  }, [entries])

  const searchResults = exerciseQuery.trim()
    ? ALL_EXERCISES.filter((ex) => ex.name.toLowerCase().includes(exerciseQuery.trim().toLowerCase())).slice(0, 12)
    : []

  return (
    <div className="history-root">
      <div className="history-calendar-header">
        <button className="history-nav-arrow" onClick={() => changeMonth(-1)}>◀</button>
        <div className="history-month-label">{getMonthLabel(cursor.year, cursor.monthIndex)}</div>
        <button className="history-nav-arrow" onClick={() => changeMonth(1)}>▶</button>
      </div>

      <div className="history-weekday-row">
        {WEEKDAY_LABELS.map((w, i) => <div key={i} className="history-weekday">{w}</div>)}
      </div>

      <div className="history-calendar-grid">
        {cells.map((cell, i) => {
          if (!cell) return <div key={i} className="history-cell history-cell-blank" />
          const summary = getDayActivitySummary(cell.dateKey)
          const isSelected = cell.dateKey === selectedDateKey
          const isToday = cell.dateKey === todayKey()
          return (
            <button
              key={cell.dateKey}
              className={`history-cell ${isSelected ? 'history-cell-selected' : ''} ${isToday ? 'history-cell-today' : ''}`}
              onClick={() => selectDate(cell.dateKey)}
            >
              <span className="history-day-num">{cell.dayNum}</span>
              {summary.isRestDay ? (
                <ZzzDot />
              ) : summary.routines.length > 0 ? (
                <span className="history-dots">
                  {summary.routines.slice(0, 4).map((r) => (
                    <span key={r.routineId} className="history-dot" style={{ background: r.color }} />
                  ))}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>

      <div className="history-browse-toggle">
        <button className={`toggle-btn ${browseMode === 'routine' ? 'toggle-active' : ''}`} onClick={() => { setBrowseMode('routine'); setSelectedExerciseId(null) }}>
          By Routine
        </button>
        <button className={`toggle-btn ${browseMode === 'exercise' ? 'toggle-active' : ''}`} onClick={() => setBrowseMode('exercise')}>
          By Exercise
        </button>
      </div>

      {browseMode === 'routine' && (
        <div className="history-browse-section">
          {!selectedDateKey && (
            <div className="empty-state">Pick a date on the calendar to see what you logged.</div>
          )}
          {selectedDateKey && daySummary?.isRestDay && (
            <div className="empty-state">This day was marked as a rest day.</div>
          )}
          {selectedDateKey && !daySummary?.isRestDay && daySessions.length === 0 && (
            <div className="empty-state">No activity logged on {formatMonthDayYear(selectedDateKey)}.</div>
          )}
          {selectedDateKey && !selectedSession && daySessions.length > 0 && (
            <div className="history-session-list">
              {daySessions.map((s) => (
                <button key={s.id} className="history-session-row" onClick={() => setSelectedSessionId(s.id)}>
                  {s.routineName}
                </button>
              ))}
            </div>
          )}
          {selectedSession && (
            <div>
              <button className="back-link history-back" onClick={() => setSelectedSessionId(null)}>← {selectedSession.routineName}</button>
              <div className="history-session-list">
                {selectedSession.loggedExercises.map((entry) => {
                  const exercise = getExerciseById(entry.exerciseId)
                  return (
                    <div key={entry.exerciseId} className="history-exercise-block">
                      <div className="history-exercise-name">{exercise?.name || entry.exerciseName}</div>
                      {entry.sets.map((set, setIndex) => (
                        <button
                          key={setIndex}
                          className="history-set-row"
                          onClick={() => setEditing({
                            exercise: exercise || { id: entry.exerciseId, logType: entry.logType },
                            dateKey: selectedDateKey,
                            sessionId: selectedSession.id,
                            set,
                            setIndex,
                          })}
                        >
                          {formatSetLine(entry.logType, set)}
                        </button>
                      ))}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {browseMode === 'exercise' && (
        <div className="history-browse-section">
          {!selectedExercise && (
            <>
              <input
                className="search-input"
                type="text"
                placeholder="Search exercises..."
                value={exerciseQuery}
                onChange={(e) => setExerciseQuery(e.target.value)}
              />
              <div className="history-session-list">
                {searchResults.map((ex) => (
                  <button key={ex.id} className="history-session-row" onClick={() => { setSelectedExerciseId(ex.id); setDistanceMode(false) }}>
                    {ex.name}
                  </button>
                ))}
              </div>
            </>
          )}

          {selectedExercise && (
            <div>
              <button className="back-link history-back" onClick={() => setSelectedExerciseId(null)}>← {selectedExercise.name}</button>

              {exerciseHasDistance && (
                <div className="history-browse-toggle">
                  <button className={`toggle-btn ${!distanceMode ? 'toggle-active' : ''}`} onClick={() => setDistanceMode(false)}>Time</button>
                  <button className={`toggle-btn ${distanceMode ? 'toggle-active' : ''}`} onClick={() => setDistanceMode(true)}>Distance</button>
                </div>
              )}

              <div className="history-bar-graph">
                {barData.map((d) => (
                  <div key={d.dateKey} className="history-bar-col">
                    <div className="history-bar-value">{d.value != null ? formatBarValue(selectedExercise.logType, metric, d.value) : ''}</div>
                    <div
                      className="history-bar"
                      style={{
                        height: d.value != null ? `${Math.max(8, Math.min(80, (d.value / (Math.max(...barData.map(b => b.value || 0)) || 1)) * 80))}px` : '4px',
                        background: d.color ? BAR_COLOR[d.color] : 'var(--off-white)',
                      }}
                    />
                    <div className="history-bar-day">{formatDayOfWeek(d.dateKey)[0]}</div>
                  </div>
                ))}
              </div>

              {entries.length === 0 ? (
                <div className="empty-state">No history logged for this exercise yet.</div>
              ) : (
                entriesByMonth.map((group) => (
                  <div key={group.label} className="history-month-group">
                    <div className="history-month-group-label">{group.label}</div>
                    {group.items.map((item) => (
                      <button
                        key={`${item.dateKey}-${item.sessionId}-${item.setIndex}`}
                        className="history-set-row"
                        onClick={() => setEditing({
                          exercise: selectedExercise,
                          dateKey: item.dateKey,
                          sessionId: item.sessionId,
                          set: item.set,
                          setIndex: item.setIndex,
                        })}
                      >
                        <span>{formatMonthDayYear(item.dateKey)}</span>
                        <span>{formatSetLine(item.logType, item.set)}</span>
                      </button>
                    ))}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {editing && (
        <EditSetPopup
          exercise={editing.exercise}
          dateKey={editing.dateKey}
          sessionId={editing.sessionId}
          set={editing.set}
          setIndex={editing.setIndex}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); refresh() }}
        />
      )}
    </div>
  )
}
