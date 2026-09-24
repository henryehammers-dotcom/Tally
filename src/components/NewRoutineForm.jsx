import { useState } from 'react'
import { ROUTINE_COLOR_PALETTE } from '../lib/colors'
import './Popup.css'
import './RenameRecolorPopup.css'

export default function NewRoutineForm({ title = 'New Routine', onCreate, onClose }) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(ROUTINE_COLOR_PALETTE[0])
  const [error, setError] = useState(null)

  function handleSave() {
    if (!name.trim()) {
      setError('Give your routine a name')
      return
    }
    try {
      onCreate({ name: name.trim(), color })
    } catch (e) {
      setError(e.message)
    }
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

        <input
          className="rename-input"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value.toLowerCase())}
          autoCapitalize="none"
          placeholder="Routine name"
          autoFocus
        />

        <div className="color-swatch-row">
          {ROUTINE_COLOR_PALETTE.map((c) => (
            <button
              key={c}
              className={`color-swatch ${color === c ? 'color-swatch-selected' : ''}`}
              style={{ background: c }}
              onClick={() => setColor(c)}
            />
          ))}
        </div>

        {error && <div className="popup-error">{error}</div>}

        <div className="popup-actions">
          <button className="popup-btn-secondary" onClick={onClose}>Cancel</button>
          <button className="popup-btn-primary" onClick={handleSave}>Create</button>
        </div>
      </div>
    </div>
  )
}
