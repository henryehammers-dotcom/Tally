import { useState } from 'react'
import { ROUTINE_COLOR_PALETTE as PALETTE } from '../lib/colors'
import './RenameRecolorPopup.css'

export default function RenameRecolorPopup({ routine, onSave, onDelete, onClose }) {
  const [name, setName] = useState(routine.name)
  const [color, setColor] = useState(routine.color)
  const [error, setError] = useState(null)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

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

  if (confirmingDelete) {
    return (
      <div className="popup-overlay" onClick={onClose}>
        <div className="popup-card" onClick={(e) => e.stopPropagation()}>
          <div className="popup-title">Delete "{routine.name.toLowerCase()}"?</div>
          <div className="popup-message">
            This removes the routine and its exercise list. Anything you've already logged stays in your history.
          </div>
          <div className="popup-actions">
            <button className="popup-btn-secondary" onClick={() => setConfirmingDelete(false)}>Cancel</button>
            <button className="popup-btn-danger" onClick={onDelete}>Delete</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-card" onClick={(e) => e.stopPropagation()}>
        <button className="popup-close" onClick={onClose}>
          <svg width="16" height="16" viewBox="0 0 16 16">
            <line x1="2" y1="2" x2="14" y2="14" stroke="var(--black)" strokeWidth="2" strokeLinecap="round" />
            <line x1="14" y1="2" x2="2" y2="14" stroke="var(--black)" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <div className="popup-title">Edit Routine</div>

        <input
          className="rename-input"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value.toLowerCase())}
          autoCapitalize="none"
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

        {onDelete && (
          <button className="popup-delete-link" onClick={() => setConfirmingDelete(true)}>
            Delete routine
          </button>
        )}
      </div>
    </div>
  )
}
