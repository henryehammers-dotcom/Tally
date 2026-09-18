import './Popup.css'
import './CreateRoutinePopup.css'

export default function CreateRoutinePopup({ onScratch, onPreset, onClose }) {
  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-card" onClick={(e) => e.stopPropagation()}>
        <button className="popup-close" onClick={onClose}>
          <svg width="16" height="16" viewBox="0 0 16 16">
            <line x1="2" y1="2" x2="14" y2="14" stroke="black" strokeWidth="2" strokeLinecap="round" />
            <line x1="14" y1="2" x2="2" y2="14" stroke="black" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <div className="popup-title">New Routine</div>
        <div className="create-routine-options">
          <button className="create-routine-option" onClick={onScratch}>
            Start from Scratch
          </button>
          <button className="create-routine-option create-routine-option-alt" onClick={onPreset}>
            Choose a Preset
          </button>
        </div>
      </div>
    </div>
  )
}
