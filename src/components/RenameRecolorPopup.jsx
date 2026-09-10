import { useState } from 'react'
import './RenameRecolorPopup.css'

const PALETTE = [
  '#ff1fa9', '#bc3fde', '#ff3a3a', '#ff751f',
  '#ffa51f', '#1fff93', '#0cc0df', '#1f48ff',
]

export default function RenameRecolorPopup({ routine, onSave, onClose }) {
  const [name, setName] = useState(routine.name)
  const [color, setColor] = useState(routine.color)
  const [error, setError] = useState(null)

  function handleSave() {
    if (!name.trim()) {
      setError('Name cannot be empty')
      return
    }
    try {
      onSave({ name: name.trim(), color })
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
        <div className="popup-title">Edit Routine</div>

        <input
          className="rename-input"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Routine name"
        />

        <div className="color-swatch-row">
          {PALETTE.map((c) => (
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
          <button className="popup-btn-primary" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  )
}
