import { useState, useEffect } from 'react'
import { composers } from '../lib/library'
import { subscribe, tapComposer, fetchTracksFor } from '../lib/musicPlayer'
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
  const [trackCounts, setTrackCounts] = useState({})

  useEffect(() => {
    const unsubscribe = subscribe(setPlayer)
    return unsubscribe
  }, [])

  useEffect(() => {
    let cancelled = false
    Promise.all(composers.map((c) => fetchTracksFor(c.id).then((tracks) => [c.id, tracks.length])))
      .then((entries) => { if (!cancelled) setTrackCounts(Object.fromEntries(entries)) })
    return () => { cancelled = true }
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
                <div className="music-card-duration">{trackCounts[c.id] ?? 0} tracks</div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
