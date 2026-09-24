import { useNavigate, useSearchParams } from 'react-router-dom'

function withPatch(params, patch) {
  const next = new URLSearchParams(params)
  Object.entries(patch).forEach(([key, value]) => {
    if (value == null) next.delete(key)
    else next.set(key, value)
  })
  return next
}

// Inner views of a screen (a muscle group's exercises, the History tab, a
// session's details...) live in the URL's query string so each one is a real
// history entry: the phone's swipe-back (and the back links) step back one
// view at a time instead of skipping straight past the screen.
export function useInnerNav() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  return {
    get: (key) => searchParams.get(key),
    // Open an inner view: adds a history entry.
    push: (patch) => setSearchParams(withPatch(searchParams, patch)),
    // Change the current view without adding a history entry.
    replace: (patch) => setSearchParams(withPatch(searchParams, patch), { replace: true }),
    // Leave an inner view: go back one entry, or, if this view was the first
    // thing loaded (no entry to go back to), clear it in place.
    back: (clearPatch) => {
      if (window.history.state?.idx > 0) navigate(-1)
      else setSearchParams(withPatch(searchParams, clearPatch), { replace: true })
    },
  }
}
