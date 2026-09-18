export function toDateKey(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function todayKey() {
  return toDateKey(new Date())
}

export function formatMonthDay(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
}

export function formatDayOfWeek(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('en-US', { weekday: 'long' })
}

export function getMondayOfWeek(date = new Date()) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export function getCurrentWeekDates() {
  const monday = getMondayOfWeek()
  const dates = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    dates.push(toDateKey(d))
  }
  return dates
}

export function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return toDateKey(d)
}

export function getLast7Days() {
  const out = []
  for (let i = 6; i >= 0; i--) {
    out.push(daysAgo(i))
  }
  return out
}

export function isSameOrBefore(dateKeyA, dateKeyB) {
  return dateKeyA <= dateKeyB
}

export function getMonthLabel(year, monthIndex) {
  return new Date(year, monthIndex, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export function addMonths(year, monthIndex, delta) {
  const total = year * 12 + monthIndex + delta
  return { year: Math.floor(total / 12), monthIndex: ((total % 12) + 12) % 12 }
}

// Monday-start week, matching the rest of the app's week convention.
export function getCalendarCells(year, monthIndex) {
  const firstOfMonth = new Date(year, monthIndex, 1)
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  const firstWeekday = firstOfMonth.getDay()
  const leadingBlanks = firstWeekday === 0 ? 6 : firstWeekday - 1

  const cells = []
  for (let i = 0; i < leadingBlanks; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ dateKey: toDateKey(new Date(year, monthIndex, d)), dayNum: d })
  }
  return cells
}

export function formatMonthDayYear(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
