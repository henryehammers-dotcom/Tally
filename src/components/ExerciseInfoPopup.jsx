import { useState } from 'react'
import './Popup.css'
import './ExerciseInfoPopup.css'

// Demo videos are optional. Drop a file named after the exercise's id into
// public/videos (e.g. public/videos/barbell-bench-press.mp4) and it shows up
// here; or set an exercise's "videoUrl" in data/library. With no file, the
// placeholder stays.
function ExerciseVideo({ exercise }) {
  const [ready, setReady] = useState(false)
  const src = exercise.videoUrl || `videos/${exercise.id}.mp4`

  return (
    <div className="info-video">
      {!ready && <div className="info-video-placeholder">video unavailable</div>}
      <video
        className="info-video-player"
        src={src}
        autoPlay
        loop
        muted
        playsInline
        onLoadedData={() => setReady(true)}
        style={ready ? undefined : { display: 'none' }}
      />
    </div>
  )
}

export default function ExerciseInfoPopup({ exercise, onClose }) {
  const instructions = exercise.instructions
  const steps = instructions?.steps || []
  const watchFor = instructions?.watchFor || []

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-card info-card" onClick={(e) => e.stopPropagation()}>
        <ExerciseVideo exercise={exercise} />

        <div className="info-heading">Instructions</div>
        {steps.length === 0 ? (
          <div className="info-empty">Instructions coming soon.</div>
        ) : (
          <ol className="info-steps">
            {steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        )}

        {watchFor.length > 0 && (
          <>
            <div className="info-heading info-heading-watch">Watch for</div>
            <ul className="info-watch">
              {watchFor.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </>
        )}

        <div className="popup-actions">
          <button className="popup-btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}
