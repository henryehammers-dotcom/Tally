import composers from '../../data/library/music.json'
import tracksManifest from '../../data/library/music-tracks.json'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function getComposer(id) {
  return composers.find((c) => c.id === id)
}

export function tracksFor(composerId) {
  return tracksManifest[composerId] || []
}

const audio = typeof Audio !== 'undefined' ? new Audio() : null

let state = {
  composerId: null,
  isPlaying: false,
  queue: [],
  trackIndex: 0,
  noTracks: false,
}

const listeners = new Set()

function notify() {
  listeners.forEach((fn) => fn(state))
}

function setState(patch) {
  state = { ...state, ...patch }
  notify()
}

function loadCurrentTrack() {
  const composer = getComposer(state.composerId)
  const filename = state.queue[state.trackIndex]
  if (!audio || !composer || !filename) return
  audio.src = `${composer.audioFolder}${filename}`
  audio.play().catch(() => {})
}

if (audio) {
  audio.addEventListener('ended', () => {
    const nextIndex = state.trackIndex + 1
    if (nextIndex < state.queue.length) {
      setState({ trackIndex: nextIndex })
    } else {
      const tracks = tracksFor(state.composerId)
      setState({ queue: shuffle(tracks), trackIndex: 0 })
    }
    loadCurrentTrack()
  })
}

export function subscribe(fn) {
  listeners.add(fn)
  fn(state)
  return () => listeners.delete(fn)
}

export function getPlayerState() {
  return state
}

export function tapComposer(composerId) {
  const tracks = tracksFor(composerId)

  if (state.composerId === composerId) {
    if (state.isPlaying) {
      audio?.pause()
      setState({ isPlaying: false })
    } else if (tracks.length > 0) {
      audio?.play().catch(() => {})
      setState({ isPlaying: true })
    }
    return
  }

  audio?.pause()
  if (tracks.length === 0) {
    setState({ composerId, isPlaying: false, queue: [], trackIndex: 0, noTracks: true })
    return
  }
  setState({ composerId, isPlaying: true, queue: shuffle(tracks), trackIndex: 0, noTracks: false })
  loadCurrentTrack()
}
