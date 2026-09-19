import { useState } from 'react'
import { EXPERIENCE_OPTIONS } from '../lib/profileOptions'
import './Popup.css'
import './RenameRecolorPopup.css'
import './ProfileEditPopup.css'

export default function ProfileEditPopup({ profile, onClose, onSave }) {
  const [name, setName] = useState(profile.name || '')
  const [ft, setFt] = useState(profile.height?.ft ?? '')
  const [inch, setInch] = useState(profile.height?.in ?? '')
  const [weight, setWeight] = useState(profile.weight ?? '')
  const [experienceLevel, setExperienceLevel] = useState(profile.experienceLevel || null)
  const [error, setError] = useState(null)

  function handleSave() {
    if (!name.trim()) { setError('Name cannot be empty'); return }
    onSave({
      name: name.trim(),
      height: { ft: Number(ft) || 0, in: Number(inch) || 0 },
      weight: Number(weight) || 0,
      experienceLevel,
    })
  }

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-card profile-edit-card" onClick={(e) => e.stopPropagation()}>
        <button className="popup-close" onClick={onClose}>
          <svg width="16" height="16" viewBox="0 0 16 16">
            <line x1="2" y1="2" x2="14" y2="14" stroke="black" strokeWidth="2" strokeLinecap="round" />
            <line x1="14" y1="2" x2="2" y2="14" stroke="black" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <div className="popup-title">Edit Profile</div>

        <div className="pe-label">Name</div>
        <input className="rename-input" type="text" value={name} onChange={(e) => setName(e.target.value)} />

        <div className="pe-label">Height</div>
        <div className="pe-row">
          <div className="pe-input-wrap">
            <input className="rename-input" type="text" inputMode="numeric" value={ft} onChange={(e) => setFt(e.target.value)} />
            <span className="pe-input-unit">ft</span>
          </div>
          <div className="pe-input-wrap">
            <input className="rename-input" type="text" inputMode="numeric" value={inch} onChange={(e) => setInch(e.target.value)} />
            <span className="pe-input-unit">in</span>
          </div>
        </div>

        <div className="pe-label">Weight</div>
        <div className="pe-input-wrap">
          <input className="rename-input" type="text" inputMode="numeric" value={weight} onChange={(e) => setWeight(e.target.value)} />
          <span className="pe-input-unit">lbs</span>
        </div>

        <div className="pe-label">Experience Level</div>
        <div className="pe-option-list">
          {EXPERIENCE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              className={`pe-option ${experienceLevel === opt.id ? 'pe-option-selected' : ''}`}
              onClick={() => setExperienceLevel(opt.id)}
            >
              {opt.label}
            </button>
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
