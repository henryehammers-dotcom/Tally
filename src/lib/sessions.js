import { getSessionDay, saveSessionDay, getAllSessionDays } from './storage'
import { todayKey, daysAgo } from './dates'
import { getRoutineById } from './routines'

const ONE_HOUR_MS = 60 * 60 * 1000

export function canMarkRestDay(dateKey = todayKey()) {
  const day = getSessionDay(dateKey)
  if (!day) return true
  return day.sessions.length === 0 && !day.isRestDay
}

export function isRestDay(dateKey = todayKey()) {
  const day = getSessionDay(dateKey)
  return !!day?.isRestDay
}

export function toggleRestDay(dateKey = todayKey()) {
  const day = getSessionDay(dateKey)
  if (day?.isRestDay) {
    saveSessionDay(dateKey, { date: dateKey, isRestDay: false, sessions: [] })
    return false
  }
  if (!canMarkRestDay(dateKey)) {
    throw new Error('Cannot mark rest day — activity already logged today')
  }
  saveSessionDay(dateKey, { date: dateKey, isRestDay: true, sessions: [] })
  return true
}

export function hasLoggedToday(dateKey = todayKey()) {
  const day = getSessionDay(dateKey)
  return !!day && day.sessions.length > 0
}

function findOrCreateOpenSession(dateKey, routineId, routineName) {
  const day = getSessionDay(dateKey) || { date: dateKey, isRestDay: false, sessions: [] }
  if (day.isRestDay) {
    throw new Error('Cannot log exercises — today is marked as a rest day')
  }

  const now = Date.now()
  let session = [...day.sessions].reverse().find((s) => {
    if (s.routineId !== routineId) return false
    const lastSet = getLastSetTimestamp(s)
    if (!lastSet) return true
    return now - new Date(lastSet).getTime() < ONE_HOUR_MS
  })

  if (!session) {
    session = {
      id: `session-${now}-${Math.random().toString(36).slice(2, 8)}`,
      routineId,
      routineName,
      startedAt: new Date(now).toISOString(),
      loggedExercises: [],
    }
    day.sessions.push(session)
  }

  return { day, session }
}

function getLastSetTimestamp(session) {
  let latest = null
  for (const ex of session.loggedExercises) {
    for (const set of ex.sets) {
      if (set.loggedAt && (!latest || set.loggedAt > latest)) {
        latest = set.loggedAt
      }
    }
  }
  return latest
}

export function logSet({ routineId, routineName, exerciseId, exerciseName, logType, setData, dateKey = todayKey() }) {
  const { day, session } = findOrCreateOpenSession(dateKey, routineId, routineName)

  let exerciseEntry = session.loggedExercises.find((e) => e.exerciseId === exerciseId)
  if (!exerciseEntry) {
    exerciseEntry = { exerciseId, exerciseName, logType, sets: [] }
    session.loggedExercises.push(exerciseEntry)
  }

  const loggedAt = new Date().toISOString()
  exerciseEntry.sets.push({ ...setData, loggedAt })

  session.endedAt = loggedAt

  saveSessionDay(dateKey, day)
  return { day, session }
}

// Sets already logged for this exercise in the workout that's currently open
// (same one-hour window logSet uses to decide whether to start a new session).
export function getCurrentSetCount(routineId, exerciseId, dateKey = todayKey()) {
  const day = getSessionDay(dateKey)
  if (!day || day.isRestDay) return 0
  const now = Date.now()
  const session = [...day.sessions].reverse().find((s) => {
    if (s.routineId !== routineId) return false
    const lastSet = getLastSetTimestamp(s)
    return !lastSet || now - new Date(lastSet).getTime() < ONE_HOUR_MS
  })
  const entry = session?.loggedExercises.find((e) => e.exerciseId === exerciseId)
  return entry ? entry.sets.length : 0
}

export function editLoggedSet({ dateKey, sessionId, exerciseId, setIndex, newSetData }) {
  const day = getSessionDay(dateKey)
  if (!day) throw new Error('No data for that date')
  const session = day.sessions.find((s) => s.id === sessionId)
  if (!session) throw new Error('Session not found')
  const exerciseEntry = session.loggedExercises.find((e) => e.exerciseId === exerciseId)
  if (!exerciseEntry) throw new Error('Exercise not found in session')
  const existing = exerciseEntry.sets[setIndex]
  if (!existing) throw new Error('Set not found')
  exerciseEntry.sets[setIndex] = { ...existing, ...newSetData }
  saveSessionDay(dateKey, day)
  return day
}

export function getCurrentStreak() {
  let streak = 0
  const todayHasActivity = hasLoggedToday()
  let cursor = todayHasActivity ? 0 : 1

  while (true) {
    const key = daysAgo(cursor)
    const day = getSessionDay(key)
    if (day && day.sessions.length > 0) {
      streak++
      cursor++
    } else {
      break
    }
  }
  return streak
}

export function getBestStreak() {
  const all = getAllSessionDays()
  const loggedDates = Object.keys(all).filter((k) => all[k].sessions?.length > 0).sort()

  let best = 0
  let current = 0
  let prevDate = null
  loggedDates.forEach((dateKey) => {
    if (prevDate) {
      const diffDays = Math.round((new Date(dateKey) - new Date(prevDate)) / 86400000)
      current = diffDays === 1 ? current + 1 : 1
    } else {
      current = 1
    }
    best = Math.max(best, current)
    prevDate = dateKey
  })
  return best
}

export function getTrackingSinceDate() {
  const all = getAllSessionDays()
  const dates = Object.keys(all).sort()
  return dates[0] || null
}

export function getDaysLoggedCount() {
  const all = getAllSessionDays()
  return Object.values(all).filter((day) => day.sessions.length > 0).length
}

export function getDayActivitySummary(dateKey) {
  const day = getSessionDay(dateKey)
  if (!day) return { isRestDay: false, routines: [] }
  if (day.isRestDay) return { isRestDay: true, routines: [] }

  const seen = new Map()
  day.sessions.forEach((s) => {
    if (!seen.has(s.routineId)) {
      const routine = getRoutineById(s.routineId)
      seen.set(s.routineId, {
        routineId: s.routineId,
        routineName: s.routineName,
        color: routine?.color || '#ecebe6',
      })
    }
  })
  return { isRestDay: false, routines: Array.from(seen.values()) }
}

export function getSessionsForDate(dateKey) {
  return getSessionDay(dateKey)?.sessions || []
}

export function getLoggedEntriesForExercise(exerciseId) {
  const all = getAllSessionDays()
  const out = []
  Object.entries(all).forEach(([dateKey, day]) => {
    day.sessions?.forEach((session) => {
      const entry = session.loggedExercises.find((e) => e.exerciseId === exerciseId)
      if (entry) {
        entry.sets.forEach((set, setIndex) => {
          out.push({ dateKey, sessionId: session.id, setIndex, set, logType: entry.logType })
        })
      }
    })
  })
  out.sort((a, b) => (b.set.loggedAt || '').localeCompare(a.set.loggedAt || ''))
  return out
}

export function getRoutineUsageCounts() {
  const all = getAllSessionDays()
  const counts = {}
  Object.values(all).forEach((day) => {
    day.sessions.forEach((s) => {
      counts[s.routineId] = (counts[s.routineId] || 0) + 1
    })
  })
  return counts
}
