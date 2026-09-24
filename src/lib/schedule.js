import { getRoutines, getSchedule, saveSchedule } from './storage'

export const MAX_ROUTINES_PER_DAY = 3

// "Rest" is scheduled like a routine, but it has to be a day's only entry:
// it can't be added to a day that has a routine, and nothing can be added to
// a day that's marked rest.
export const REST_ID = 'rest'
export const REST_ENTRY = { id: REST_ID, name: 'rest', color: '#231f20', isRest: true }

export const DAYS = [
  { short: 'M', name: 'Monday' },
  { short: 'T', name: 'Tuesday' },
  { short: 'W', name: 'Wednesday' },
  { short: 'Th', name: 'Thursday' },
  { short: 'F', name: 'Friday' },
  { short: 'Sa', name: 'Saturday' },
  { short: 'Su', name: 'Sunday' },
]

// 0 = Monday ... 6 = Sunday
export function todayDayIndex(date = new Date()) {
  return (date.getDay() + 6) % 7
}

// The routines scheduled for each day, in order. Routines that no longer
// exist are dropped.
export function getScheduledRoutines() {
  const schedule = getSchedule()
  const routines = getRoutines()
  return DAYS.map((_, i) =>
    (schedule[i] || [])
      .map((id) => (id === REST_ID ? REST_ENTRY : routines.find((r) => r.id === id)))
      .filter(Boolean)
  )
}

export function addRoutineToDay(dayIndex, routineId) {
  const scheduled = getScheduledRoutines()[dayIndex]
  if (scheduled.length >= MAX_ROUTINES_PER_DAY || scheduled.some((r) => r.id === routineId)) return false
  if (scheduled.some((r) => r.isRest)) return false
  if (routineId === REST_ID && scheduled.length > 0) return false
  const schedule = getSchedule()
  schedule[dayIndex] = [...scheduled.map((r) => r.id), routineId]
  saveSchedule(schedule)
  return true
}

export function removeRoutineFromDay(dayIndex, routineId) {
  const schedule = getSchedule()
  schedule[dayIndex] = (schedule[dayIndex] || []).filter((id) => id !== routineId)
  saveSchedule(schedule)
}

export function removeRoutineFromSchedule(routineId) {
  const schedule = getSchedule()
  Object.keys(schedule).forEach((day) => {
    schedule[day] = schedule[day].filter((id) => id !== routineId)
  })
  saveSchedule(schedule)
}
