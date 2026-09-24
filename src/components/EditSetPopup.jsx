import { useState } from 'react'
import { editLoggedSet } from '../lib/sessions'
import './Popup.css'
import './RenameRecolorPopup.css'
import './EditSetPopup.css'

function secondsToHMS(totalSeconds) {
  const hr = Math.floor(totalSeconds / 3600)
  const min = Math.floor((totalSeconds % 3600) / 60)
  const sec = totalSeconds % 60
  return { hr, min, sec }
}

export default function EditSetPopup({ exercise, dateKey, sessionId, set, setIndex, onClose, onSaved }) {
  const isWeighted = exercise.logType === 'weighted'
  const isBodyweight = exercise.logType === 'bodyweight'
  const isTimed = exercise.logType === 'timed'
  const hasDistance = isTimed && set.distance != null
  const initialHMS = isTimed ? secondsToHMS(set.duration || 0) : { hr: 0, min: 0, sec: 0 }

  const [reps, setReps] = useState(set.reps ?? '')
  const [weight, setWeight] = useState(set.weight ?? '')
  const [hr, setHr] = useState(initialHMS.hr || '')
  const [min, setMin] = useState(initialHMS.min || '')
  const [sec, setSec] = useState(initialHMS.sec || '')
  const [miles, setMiles] = useState(set.distance ?? '')
  const [error, setError] = useState(null)

  function handleSave() {
    let newSetData = {}
    if (isWeighted) {
      if (!reps || !weight) { setError('Reps and weight are required'); return }
      newSetData = { reps: Number(reps), weight: Number(weight) }
    } else if (isBodyweight) {
      if (!reps) { setError('Reps is required'); return }
      newSetData = { reps: Number(reps) }
    } else if (isTimed) {
      const totalSeconds = (Number(hr) || 0) * 3600 + (Number(min) || 0) * 60 + (Number(sec) || 0)
      if (totalSeconds === 0) { setError('Duration is required'); return }
      newSetData = { duration: totalSeconds }
      if (hasDistance) newSetData.distance = miles ? Number(miles) : null
    }

    try {
      editLoggedSet({ dateKey, sessionId, exerciseId: exercise.id, setIndex, newSetData })
      onSaved()
    } catch (e) {
      setError(e.message)
    }
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
        <div className="popup-title">Edit Logged Set</div>

        {isWeighted && (
          <div className="edit-set-row">
            <input className="rename-input" type="text" inputMode="numeric" placeholder="Reps" value={reps} onChange={(e) => setReps(e.target.value)} />
            <input className="rename-input" type="text" inputMode="numeric" placeholder="Weight" value={weight} onChange={(e) => setWeight(e.target.value)} />
          </div>
        )}
        {isBodyweight && (
          <input className="rename-input" type="text" inputMode="numeric" placeholder="Reps" value={reps} onChange={(e) => setReps(e.target.value)} />
        )}
        {isTimed && (
          <>
            <div className="edit-set-row">
              <input className="rename-input" type="text" inputMode="numeric" placeholder="hr" value={hr} onChange={(e) => setHr(e.target.value)} />
              <input className="rename-input" type="text" inputMode="numeric" placeholder="min" value={min} onChange={(e) => setMin(e.target.value)} />
              <input className="rename-input" type="text" inputMode="numeric" placeholder="sec" value={sec} onChange={(e) => setSec(e.target.value)} />
            </div>
            {hasDistance && (
              <input className="rename-input" type="text" inputMode="decimal" placeholder="Miles" value={miles} onChange={(e) => setMiles(e.target.value)} style={{ marginTop: 10 }} />
            )}
          </>
        )}

        {error && <div className="popup-error">{error}</div>}

        <div className="popup-actions">
          <button className="popup-btn-secondary" onClick={onClose}>Cancel</button>
          <button className="popup-btn-primary" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  )
}
