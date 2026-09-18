import { getWeekSessionLengthsByDay, formatSessionLength } from '../lib/stats'
import { formatDayOfWeek } from '../lib/dates'
import './Popup.css'
import './RoutinePickerPopup.css'

export default function WeekSessionLengthsPopup({ onClose }) {
  const days = getWeekSessionLengthsByDay()

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-card" onClick={(e) => e.stopPropagation()}>
        <button className="popup-close" onClick={onClose}>
          <svg width="16" height="16" viewBox="0 0 16 16">
            <line x1="2" y1="2" x2="14" y2="14" stroke="black" strokeWidth="2" strokeLinecap="round" />
            <line x1="14" y1="2" x2="2" y2="14" stroke="black" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <div className="popup-title">This Week's Sessions</div>

        <div className="routine-picker-list">
          {days.map((d) => (
            <div key={d.dateKey} className="routine-picker-row" style={{ justifyContent: 'space-between' }}>
              <span>{formatDayOfWeek(d.dateKey)}</span>
              <span>{d.minutes > 0 ? formatSessionLength(d.minutes) : '—'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
