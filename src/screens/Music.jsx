import { useState, useEffect } from 'react'
import { composers } from '../lib/library'
import { subscribe, tapComposer } from '../lib/musicPlayer'
import durations from '../../data/library/music-durations.json'
import './Music.css'

// Regenerate music-durations.json with `python3 scripts/measure-music.py`
// after adding or changing tracks.
function formatTotalLength(seconds) {
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest ? `${hours}hr ${rest}m` : `${hours}hr`
}

function EqBar({ playing }) {
  return (
    <div className={`eq-bar ${playing ? 'eq-bar-playing' : ''}`}>
      <span /><span /><span /><span />
    </div>
  )
}

export default function Music() {
  const [player, setPlayer] = useState(null)

  useEffect(() => {
    const unsubscribe = subscribe(setPlayer)
    return unsubscribe
  }, [])

  return (
    <div className="screen music-screen">
      <div className="music-header">
        <h1>Music</h1>
        <div className="music-subtitle">Because your session needs a score</div>
      </div>

      <div className="page-divider music-divider" />

      <EqBar playing={!!player?.isPlaying} />

      <div className="music-card-list">
        {composers.map((c) => {
          const isCurrent = player?.composerId === c.id
          const isActivePlaying = isCurrent && player.isPlaying
          const hasNoTracks = isCurrent && player.noTracks
          const totalSeconds = durations[c.id]
          return (
            <button
              key={c.id}
              className={`music-card ${isActivePlaying ? 'music-card-active' : ''}`}
              onClick={() => tapComposer(c.id)}
            >
              <div className="music-composer-name" style={{ color: c.color }}>{c.composer}</div>
              {hasNoTracks ? (
                <div className="music-card-hint">No tracks added yet — drop mp3s in {c.audioFolder}</div>
              ) : totalSeconds ? (
                <div className="music-card-duration">{formatTotalLength(totalSeconds)}</div>
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}
