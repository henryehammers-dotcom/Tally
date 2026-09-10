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
