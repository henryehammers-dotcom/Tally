import { getSessionDay, saveSessionDay, getAllSessionDays } from './storage'
import { todayKey, daysAgo } from './dates'

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

export function getDaysLoggedCount() {
  const all = getAllSessionDays()
  return Object.values(all).filter((day) => day.sessions.length > 0).length
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
