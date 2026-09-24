import { useState, useEffect } from 'react'
import { getRoutines, hasScheduleIntroBeenShown, markScheduleIntroShown } from '../lib/storage'
import {
  DAYS,
  MAX_ROUTINES_PER_DAY,
  REST_ENTRY,
  getScheduledRoutines,
  addRoutineToDay,
  removeRoutineFromDay,
  todayDayIndex,
} from '../lib/schedule'
import './Popup.css'
import './SchedulePopup.css'

function CloseButton({ onClose }) {
  return (
    <button className="popup-close" onClick={onClose}>
      <svg width="16" height="16" viewBox="0 0 16 16">
        <line x1="2" y1="2" x2="14" y2="14" stroke="var(--black)" strokeWidth="2" strokeLinecap="round" />
        <line x1="14" y1="2" x2="2" y2="14" stroke="var(--black)" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </button>
  )
}

function DayValue({ routines }) {
  if (routines.length === 1) {
    return (
      <span className="schedule-pill" style={{ background: routines[0].color }}>
        {routines[0].name.toLowerCase()}
      </span>
    )
  }
  return (
    <span className="schedule-dots">
      {routines.map((r) => (
        <span key={r.id} className="schedule-dot" style={{ background: r.color }} />
      ))}
    </span>
  )
}

export default function SchedulePopup({ onClose }) {
  // Views: intro (first time only) -> week -> day (edit one day) -> pick (add a routine).
  const [view, setView] = useState(() => (hasScheduleIntroBeenShown() ? { name: 'week' } : { name: 'intro' }))
  const [scheduled, setScheduled] = useState(getScheduledRoutines)
  const today = todayDayIndex()

  useEffect(() => {
    markScheduleIntroShown()
  }, [])

  function refresh() {
    setScheduled(getScheduledRoutines())
  }

  function handlePick(dayIndex, routine, returnTo) {
    addRoutineToDay(dayIndex, routine.id)
    refresh()
    setView({ name: returnTo, day: dayIndex })
  }

  function handleRemove(dayIndex, routine) {
    removeRoutineFromDay(dayIndex, routine.id)
    refresh()
    // A day with nothing left goes back to the week view.
    if (scheduled[dayIndex].length <= 1) setView({ name: 'week' })
  }

  let card
  if (view.name === 'intro') {
    card = (
      <>
        <CloseButton onClose={onClose} />
        <div className="popup-title schedule-title">Your Schedule</div>
        <div className="popup-message schedule-intro-message">
          Have a specific routine you do each day? Schedule them here so you don't forget!
        </div>
        <div className="popup-actions">
          <button className="popup-btn-primary" onClick={() => setView({ name: 'week' })}>Let's go</button>
        </div>
      </>
    )
  } else if (view.name === 'week') {
    card = (
      <>
        <CloseButton onClose={onClose} />
        <div className="popup-title schedule-title">Your Schedule</div>
        <div className="schedule-rule" />
        <div className="schedule-week">
          {DAYS.map((day, i) => {
            const routines = scheduled[i]
            const open = () => setView(routines.length ? { name: 'day', day: i } : { name: 'pick', day: i, returnTo: 'week' })
            return (
              <div key={day.short} className="schedule-row">
                <button className={`schedule-day ${i === today ? 'schedule-day-today' : ''}`} onClick={open}>
                  {day.short}
                </button>
                {routines.length === 0 ? (
                  <button className="schedule-plus" onClick={open} aria-label={`Add a routine on ${day.name}`}>
                    <svg width="18" height="18" viewBox="0 0 18 18">
                      <line x1="9" y1="3" x2="9" y2="15" stroke="white" strokeWidth="2.6" strokeLinecap="round" />
                      <line x1="3" y1="9" x2="15" y2="9" stroke="white" strokeWidth="2.6" strokeLinecap="round" />
                    </svg>
                  </button>
                ) : (
                  <button className="schedule-value" onClick={open}>
                    <DayValue routines={routines} />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </>
    )
  } else if (view.name === 'day') {
    const routines = scheduled[view.day]
    card = (
      <>
        <CloseButton onClose={onClose} />
        <div className="popup-title schedule-title">{DAYS[view.day].name}</div>
        <div className="schedule-rule" />
        <div className="schedule-day-list">
          {routines.map((r) => (
            <div key={r.id} className="schedule-day-item">
              <span className="schedule-day-item-dot" style={{ background: r.color }} />
              <span className="schedule-day-item-name">{r.name.toLowerCase()}</span>
              <button className="schedule-remove" onClick={() => handleRemove(view.day, r)} aria-label={`Remove ${r.name}`}>
                <svg width="12" height="12" viewBox="0 0 12 12">
                  <line x1="2" y1="2" x2="10" y2="10" stroke="var(--black)" strokeWidth="2" strokeLinecap="round" />
                  <line x1="10" y1="2" x2="2" y2="10" stroke="var(--black)" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          ))}
          {routines.length < MAX_ROUTINES_PER_DAY && !routines.some((r) => r.isRest) && (
            <button className="schedule-add-row" onClick={() => setView({ name: 'pick', day: view.day, returnTo: 'day' })}>
              <span className="schedule-plus schedule-plus-small">
                <svg width="14" height="14" viewBox="0 0 18 18">
                  <line x1="9" y1="3" x2="9" y2="15" stroke="white" strokeWidth="3" strokeLinecap="round" />
                  <line x1="3" y1="9" x2="15" y2="9" stroke="white" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </span>
              Add a routine
            </button>
          )}
        </div>
        <div className="popup-actions">
          <button className="popup-btn-secondary" onClick={() => setView({ name: 'week' })}>Back</button>
        </div>
      </>
    )
  } else {
    const allRoutines = getRoutines()
    const taken = new Set(scheduled[view.day].map((r) => r.id))
    const choices = allRoutines.filter((r) => !taken.has(r.id))
    const restBlocked = scheduled[view.day].length > 0
    card = (
      <>
        <CloseButton onClose={onClose} />
        <div className="popup-title schedule-title">Add to {DAYS[view.day].name}</div>
        <div className="schedule-rule" />
        {allRoutines.length === 0 ? (
          <div className="popup-message schedule-empty">
            You haven't made any routines yet. Head to Library to build one.
          </div>
        ) : choices.length === 0 ? (
          <div className="popup-message schedule-empty">Every routine you have is already scheduled for this day.</div>
        ) : (
          <div className="schedule-day-list">
            {choices.map((r) => (
              <button key={r.id} className="schedule-choice" onClick={() => handlePick(view.day, r, view.returnTo)}>
                <span className="schedule-day-item-dot" style={{ background: r.color }} />
                {r.name.toLowerCase()}
              </button>
            ))}
          </div>
        )}
        <div className="schedule-day-list schedule-rest-list">
          <button
            className="schedule-choice"
            disabled={restBlocked}
            onClick={() => handlePick(view.day, REST_ENTRY, view.returnTo)}
          >
            <span className="schedule-day-item-dot" style={{ background: REST_ENTRY.color }} />
            rest
          </button>
          {restBlocked && (
            <div className="schedule-rest-note">Rest can't be added to a day that already has a routine.</div>
          )}
        </div>
        <div className="popup-actions">
          <button className="popup-btn-secondary" onClick={() => setView(view.returnTo === 'day' ? { name: 'day', day: view.day } : { name: 'week' })}>Back</button>
        </div>
      </>
    )
  }

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-card schedule-card" onClick={(e) => e.stopPropagation()}>
        {card}
      </div>
    </div>
  )
}
