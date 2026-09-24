import { useState } from 'react'
import './Popup.css'
import './FiltersPopup.css'

function toggleValue(list, value) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}

export default function FiltersPopup({ available, selected, onApply, onClose }) {
  const [types, setTypes] = useState(selected.types)
  const [equipment, setEquipment] = useState(selected.equipment)

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-card" onClick={(e) => e.stopPropagation()}>
        <button className="popup-close" onClick={onClose}>
          <svg width="16" height="16" viewBox="0 0 16 16">
            <line x1="2" y1="2" x2="14" y2="14" stroke="var(--black)" strokeWidth="2" strokeLinecap="round" />
            <line x1="14" y1="2" x2="2" y2="14" stroke="var(--black)" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <div className="popup-title">Filters</div>

        {available.types.length > 0 && (
          <div className="filter-group">
            <div className="filter-group-label">Type</div>
            <div className="filter-chip-row">
              {available.types.map((t) => (
                <button
                  key={t}
                  className={`filter-chip ${types.includes(t) ? 'filter-chip-active' : ''}`}
                  onClick={() => setTypes((prev) => toggleValue(prev, t))}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {available.equipment.length > 0 && (
          <div className="filter-group">
            <div className="filter-group-label">Equipment</div>
            <div className="filter-chip-row">
              {available.equipment.map((e) => (
                <button
                  key={e}
                  className={`filter-chip ${equipment.includes(e) ? 'filter-chip-active' : ''}`}
                  onClick={() => setEquipment((prev) => toggleValue(prev, e))}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="popup-actions">
          <button
            className="popup-btn-secondary"
            onClick={() => { setTypes([]); setEquipment([]); onApply({ types: [], equipment: [] }) }}
          >
            Clear
          </button>
          <button className="popup-btn-primary" onClick={() => onApply({ types, equipment })}>
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}
