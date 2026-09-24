const LAST_KEY = 'tally_splash_last_dot'

// A random white (big) dot for the splash to zoom into, never the same one
// as last launch. Returns [row, column].
export function pickZoomCell(logo) {
  const small = new Set(logo.smallCells.map(([r, c]) => `${r}-${c}`))
  const candidates = []
  for (let row = 0; row < logo.rows; row++) {
    for (let col = 0; col < logo.columns; col++) {
      if (!small.has(`${row}-${col}`)) candidates.push(`${row}-${col}`)
    }
  }

  let last = null
  try {
    last = localStorage.getItem(LAST_KEY)
  } catch {
    // storage unavailable: just pick at random
  }

  const options = candidates.filter((key) => key !== last)
  const choice = options[Math.floor(Math.random() * options.length)]
  try {
    localStorage.setItem(LAST_KEY, choice)
  } catch {
    // ignore
  }
  return choice.split('-').map(Number)
}
