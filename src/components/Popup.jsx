import './Popup.css'

export default function Popup({ title, message, onClose, actions }) {
  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-card" onClick={(e) => e.stopPropagation()}>
        {onClose && (
          <button className="popup-close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 16 16">
              <line x1="2" y1="2" x2="14" y2="14" stroke="var(--black)" strokeWidth="2" strokeLinecap="round" />
              <line x1="14" y1="2" x2="2" y2="14" stroke="var(--black)" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        )}
        {title && <div className="popup-title">{title}</div>}
        {message && <div className="popup-message">{message}</div>}
        {actions && <div className="popup-actions">{actions}</div>}
      </div>
    </div>
  )
}
