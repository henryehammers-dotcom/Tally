import { useState } from 'react'
import './Popup.css'
import './FiltersPopup.css'

export default function MultiSelectPopup({ title, options, selected, onClose, onSave }) {
  const [values, setValues] = useState(selected)

  function toggle(value) {
    setValues((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]))
  }

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-card" onClick={(e) => e.stopPropagation()}>
        <button className="popup-close" onClick={onClose}>
          <svg width="16" height="16" viewBox="0 0 16 16">
            <line x1="2" y1="2" x2="14" y2="14" stroke="black" strokeWidth="2" strokeLinecap="round" />
            <line x1="14" y1="2" x2="2" y2="14" stroke="black" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <div className="popup-title">{title}</div>

        <div className="filter-chip-row" style={{ marginTop: 12 }}>
          {options.map((opt) => (
            <button
              key={opt}
              className={`filter-chip ${values.includes(opt) ? 'filter-chip-active' : ''}`}
              onClick={() => toggle(opt)}
            >
              {opt}
            </button>
          ))}
        </div>

        <div className="popup-actions">
          <button className="popup-btn-secondary" onClick={onClose}>Cancel</button>
          <button className="popup-btn-primary" onClick={() => onSave(values)}>Save</button>
        </div>
      </div>
    </div>
  )
}
