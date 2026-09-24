import { useState } from 'react'
import ExerciseInfoPopup from './ExerciseInfoPopup'
import './Popup.css'
import './TradingCard.css'

function InfoIcon({ onClick }) {
  return (
    <button className="trading-info-icon" onClick={onClick} aria-label="How to do this exercise">
      <svg width="22" height="22" viewBox="0 0 22 22">
        <circle cx="11" cy="11" r="9.5" stroke="var(--black)" strokeWidth="1.8" fill="none" />
        <circle cx="11" cy="6.6" r="1.2" fill="var(--black)" />
        <line x1="11" y1="9.6" x2="11" y2="16" stroke="var(--black)" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </button>
  )
}

function targetSummary(exercise, targets) {
  const t = targets || exercise
  if (exercise.logType === 'timed') {
    const parts = [t.duration || exercise.defaultDuration, t.rest || exercise.defaultRest].filter(Boolean)
    if (exercise.defaultDistance != null || t.distance != null) {
      return `${parts.join(' · ')}${parts.length ? ' · ' : ''}tracks distance`
    }
    return parts.join(' · ')
  }
  const sets = t.sets ?? exercise.defaultSets
  const reps = t.reps ?? exercise.defaultReps
  const rest = t.rest ?? exercise.defaultRest
  return [sets != null ? `${sets} sets` : null, reps, rest].filter(Boolean).join(' · ')
}

export default function TradingCard({ exercise, color, targets, actionLabel, onAction, onClose }) {
  const [showInfo, setShowInfo] = useState(false)

  return (
    <>
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-card trading-card" onClick={(e) => e.stopPropagation()}>
        <button className="popup-close" onClick={onClose}>
          <svg width="16" height="16" viewBox="0 0 16 16">
            <line x1="2" y1="2" x2="14" y2="14" stroke="var(--black)" strokeWidth="2" strokeLinecap="round" />
            <line x1="14" y1="2" x2="2" y2="14" stroke="var(--black)" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <div className="trading-circle" style={{ background: color }} />
        <div className="trading-name-row">
          <div className="trading-name">{exercise.name}</div>
          <InfoIcon onClick={() => setShowInfo(true)} />
        </div>

        <div className="trading-muscles">
          {exercise.primaryMuscle}
          {exercise.secondaryMuscles?.length ? `, ${exercise.secondaryMuscles.join(', ')}` : ''}
        </div>

        <div className="trading-targets-row">
          <span>{targetSummary(exercise, targets)}</span>
        </div>

        <div className="popup-actions">
          <button className="popup-btn-primary trading-action" onClick={onAction}>
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
    {showInfo && <ExerciseInfoPopup exercise={exercise} onClose={() => setShowInfo(false)} />}
    </>
  )
}
