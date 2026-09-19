import composers from '../../data/library/music.json'

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

const tracksCache = new Map()

export function tracksFor(composerId) {
  return tracksCache.get(composerId) || []
}

export async function fetchTracksFor(composerId) {
  if (tracksCache.has(composerId)) return tracksCache.get(composerId)
  const composer = getComposer(composerId)
  if (!composer) return []
  try {
    const res = await fetch(`${composer.audioFolder}tracks.json`)
    if (!res.ok) throw new Error('tracks.json not found')
    const tracks = await res.json()
    tracksCache.set(composerId, tracks)
    return tracks
  } catch {
    tracksCache.set(composerId, [])
    return []
  }
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

export async function tapComposer(composerId) {
  if (state.composerId === composerId) {
    if (state.isPlaying) {
      audio?.pause()
      setState({ isPlaying: false })
    } else {
      const tracks = tracksFor(composerId)
      if (tracks.length > 0) {
        audio?.play().catch(() => {})
        setState({ isPlaying: true })
      }
    }
    return
  }

  audio?.pause()
  const tracks = await fetchTracksFor(composerId)
  if (tracks.length === 0) {
    setState({ composerId, isPlaying: false, queue: [], trackIndex: 0, noTracks: true })
    return
  }
  setState({ composerId, isPlaying: true, queue: shuffle(tracks), trackIndex: 0, noTracks: false })
  loadCurrentTrack()
}
