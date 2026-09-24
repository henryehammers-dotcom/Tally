import { comparisonObjects } from '../lib/library'
import './Popup.css'
import './RoutinePickerPopup.css'

export default function ComparisonPickerPopup({ selectedId, onSelect, onClose }) {
  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-card" onClick={(e) => e.stopPropagation()}>
        <button className="popup-close" onClick={onClose}>
          <svg width="16" height="16" viewBox="0 0 16 16">
            <line x1="2" y1="2" x2="14" y2="14" stroke="var(--black)" strokeWidth="2" strokeLinecap="round" />
            <line x1="14" y1="2" x2="2" y2="14" stroke="var(--black)" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <div className="popup-title">Compare To</div>

        <div className="routine-picker-list">
          {comparisonObjects.map((obj) => (
            <button
              key={obj.id}
              className={`routine-picker-row ${obj.id === selectedId ? 'routine-picker-row-selected' : ''}`}
              style={{ justifyContent: 'space-between' }}
              onClick={() => onSelect(obj.id)}
            >
              <span>{obj.name}</span>
              <span>{obj.weightLbs.toLocaleString()} lbs</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
