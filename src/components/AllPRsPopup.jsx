import { getRecentPRs } from '../lib/stats'
import './Popup.css'
import './RoutinePickerPopup.css'

function formatPRValue(pr) {
  if (pr.logType === 'weighted') return `${Math.round(pr.value)} lbs e1RM`
  if (pr.logType === 'bodyweight') return `${pr.value} reps`
  if (pr.logType === 'timed') {
    const m = Math.floor(pr.value / 60)
    const s = Math.round(pr.value % 60)
    return `${m}:${String(s).padStart(2, '0')}`
  }
  return String(pr.value)
}

export default function AllPRsPopup({ onClose }) {
  const prs = getRecentPRs(1000)

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-card" onClick={(e) => e.stopPropagation()}>
        <button className="popup-close" onClick={onClose}>
          <svg width="16" height="16" viewBox="0 0 16 16">
            <line x1="2" y1="2" x2="14" y2="14" stroke="black" strokeWidth="2" strokeLinecap="round" />
            <line x1="14" y1="2" x2="2" y2="14" stroke="black" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <div className="popup-title">All Personal Records</div>

        {prs.length === 0 ? (
          <div className="popup-message">No PRs yet.</div>
        ) : (
          <div className="routine-picker-list">
            {prs.map((pr) => (
              <div key={pr.exerciseId} className="routine-picker-row" style={{ justifyContent: 'space-between' }}>
                <span>{pr.exerciseName}</span>
                <span>{formatPRValue(pr)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
