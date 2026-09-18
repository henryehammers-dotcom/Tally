import { useState, useEffect } from 'react'
import { composers } from '../lib/library'
import { subscribe, tapComposer, tracksFor } from '../lib/musicPlayer'
import './Music.css'

function EqBar() {
  return (
    <div className="eq-bar">
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
      <h1>Music</h1>
      <div className="music-subtitle">Because your session needs a score</div>

      {player?.isPlaying && <EqBar />}

      <div className="music-card-list">
        {composers.map((c) => {
          const isCurrent = player?.composerId === c.id
          const isActivePlaying = isCurrent && player.isPlaying
          const hasNoTracks = isCurrent && player.noTracks
          return (
            <button
              key={c.id}
              className={`music-card ${isActivePlaying ? 'music-card-active' : ''}`}
              onClick={() => tapComposer(c.id)}
            >
              <div className="music-composer-name" style={{ color: c.color }}>{c.composer}</div>
              {hasNoTracks ? (
                <div className="music-card-hint">No tracks added yet — drop mp3s in {c.audioFolder}</div>
              ) : c.duration ? (
                <div className="music-card-duration">{c.duration}</div>
              ) : (
                <div className="music-card-duration">{tracksFor(c.id).length} tracks</div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
