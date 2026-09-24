import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getRoutines } from '../lib/storage'
import { getRoutineUsageCounts, canMarkRestDay, toggleRestDay, hasLoggedToday, isRestDay } from '../lib/sessions'
import { todayKey, formatMonthDay, formatDayOfWeek } from '../lib/dates'
import { getProfile } from '../lib/storage'
import { renameRoutine, recolorRoutine, deleteRoutine } from '../lib/routines'
import { usePressTiers } from '../lib/usePressTiers'
import RenameRecolorPopup from '../components/RenameRecolorPopup'
import SchedulePopup from '../components/SchedulePopup'
import ZzzIcon from '../components/ZzzIcon'
import './Home.css'

function ProfileIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21C4 16.5 7.5 14 12 14C16.5 14 20 16.5 20 21" />
    </svg>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const [routines, setRoutines] = useState([])
  const [restDayActive, setRestDayActive] = useState(false)
  const [restDayMessage, setRestDayMessage] = useState(null)
  const [editingRoutine, setEditingRoutine] = useState(null)
  const [showSchedule, setShowSchedule] = useState(false)

  const dateKey = todayKey()

  function refresh() {
    setRoutines(getRoutines())
    setRestDayActive(isRestDay(dateKey))
  }

  useEffect(() => {
    refresh()
  }, [])

  const usageCounts = getRoutineUsageCounts()
  const sorted = [...routines].sort(
    (a, b) => (usageCounts[b.id] || 0) - (usageCounts[a.id] || 0)
  )

  function chunkAlternating(list) {
    const rows = []
    let i = 0
    let rowIsTwoSlot = true
    while (i < list.length) {
      const n = rowIsTwoSlot ? 2 : 1
      rows.push({ items: list.slice(i, i + n), twoSlot: rowIsTwoSlot })
      i += n
      rowIsTwoSlot = !rowIsTwoSlot
    }
    return rows
  }
  const rows = chunkAlternating(sorted)

  function handleZzz() {
    if (restDayActive) {
      toggleRestDay(dateKey)
      setRestDayActive(false)
      setRestDayMessage(null)
      return
    }
    if (!canMarkRestDay(dateKey)) return
    toggleRestDay(dateKey)
    setRestDayActive(true)
    setRestDayMessage(`${formatMonthDay(dateKey)} has been logged in history as a rest day. Press again to undo.`)
    setTimeout(() => setRestDayMessage(null), 3500)
  }

  const zzzDisabled = hasLoggedToday(dateKey) && !restDayActive

  function zzzStateClass() {
    if (zzzDisabled) return 'zzz-disabled'
    if (restDayActive) return 'zzz-rest-active'
    return 'zzz-default'
  }

  return (
    <div className="screen home-screen">
      <div className="home-header">
        <div>
          <div className="home-date-small">{formatMonthDay(dateKey)}</div>
          <div className="home-date-large">{formatDayOfWeek(dateKey)}</div>
        </div>
        <div className="home-header-actions">
          <button
            className={`zzz-button ${zzzStateClass()}`}
            disabled={zzzDisabled}
            onClick={handleZzz}
          >
            <ZzzIcon />
          </button>
          <button className="profile-icon" onClick={() => navigate('/settings')}>
            <ProfileIcon />
          </button>
        </div>
      </div>

      <div className="page-divider" />

      {restDayMessage && (
        <div className="rest-day-toast">{restDayMessage}</div>
      )}

      <div className="routines-row">
        <div className="routines-label">Your Routines</div>
        <button className="schedule-button" onClick={() => setShowSchedule(true)}>Schedule</button>
      </div>

      {sorted.length === 0 ? (
        <div className="empty-state">
          You haven't made any routines yet. Head to Library to build one.
        </div>
      ) : (
        <div className="bubble-cluster">
          {rows.map((row, rowIdx) => (
            <div
              className={`bubble-row ${row.twoSlot ? 'bubble-row-double' : 'bubble-row-single'}`}
              key={rowIdx}
            >
              {row.items.map((r) => (
                <RoutineBubble
                  key={r.id}
                  routine={r}
                  onOpen={() => navigate(`/routine/${r.id}`)}
                  onLongPress={() => setEditingRoutine(r)}
                />
              ))}
            </div>
          ))}
        </div>
      )}

      {showSchedule && <SchedulePopup onClose={() => setShowSchedule(false)} />}

      {editingRoutine && (
        <RenameRecolorPopup
          routine={editingRoutine}
          onClose={() => setEditingRoutine(null)}
          onDelete={() => {
            deleteRoutine(editingRoutine.id)
            setEditingRoutine(null)
            refresh()
          }}
          onSave={({ name, color }) => {
            if (name !== editingRoutine.name) {
              renameRoutine(editingRoutine.id, name)
            }
            if (color !== editingRoutine.color) {
              recolorRoutine(editingRoutine.id, color)
            }
            setEditingRoutine(null)
            refresh()
          }}
        />
      )}
    </div>
  )
}

function RoutineBubble({ routine, onOpen, onLongPress }) {
  const press = usePressTiers({
    onTap: onOpen,
    onOptions: onLongPress,
  })

  return (
    <button
      className="routine-bubble no-select"
      style={{ background: routine.color }}
      {...press}
    >
      {routine.name.toLowerCase()}
    </button>
  )
}
