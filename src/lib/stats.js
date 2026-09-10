import { getAllSessionDays } from './storage'
import { getExerciseById } from './library'
import { getLast7Days } from './dates'

export function estimateOneRepMax(weight, reps) {
  if (reps <= 1) return weight
  return weight * (1 + reps / 30)
}

function getAllSetsForExercise(exerciseId) {
  const all = getAllSessionDays()
  const out = []
  Object.entries(all).forEach(([dateKey, day]) => {
    day.sessions?.forEach((session) => {
      const entry = session.loggedExercises.find((e) => e.exerciseId === exerciseId)
      if (entry) {
        entry.sets.forEach((set) => out.push({ ...set, dateKey, logType: entry.logType }))
      }
    })
  })
  return out
}

export function getPRForExercise(exerciseId, metric = 'time') {
  const exercise = getExerciseById(exerciseId)
  if (!exercise) return null
  const sets = getAllSetsForExercise(exerciseId)
  if (sets.length === 0) return null

  if (exercise.logType === 'weighted') {
    let best = null
    sets.forEach((s) => {
      const e1rm = estimateOneRepMax(s.weight, s.reps)
      if (!best || e1rm > best.value) best = { value: e1rm, set: s }
    })
    return best
  }

  if (exercise.logType === 'bodyweight') {
    let best = null
    sets.forEach((s) => {
      if (!best || s.reps > best.value) best = { value: s.reps, set: s }
    })
    return best
  }

  if (exercise.logType === 'timed') {
    const key = metric === 'distance' ? 'distance' : 'duration'
    let best = null
    sets.forEach((s) => {
      const val = s[key]
      if (val == null) return
      if (!best || val > best.value) best = { value: val, set: s }
    })
    return best
  }

  return null
}

export function getRecentPRs(limit = 3) {
  const all = getAllSessionDays()
  const exerciseIds = new Set()
  Object.values(all).forEach((day) => {
    day.sessions?.forEach((s) => {
      s.loggedExercises.forEach((e) => exerciseIds.add(e.exerciseId))
    })
  })

  const prs = []
  exerciseIds.forEach((id) => {
    const exercise = getExerciseById(id)
    const pr = getPRForExercise(id)
    if (pr) {
      prs.push({
        exerciseId: id,
        exerciseName: exercise?.name || id,
        logType: exercise?.logType,
        value: pr.value,
        loggedAt: pr.set.loggedAt,
      })
    }
  })

  prs.sort((a, b) => (b.loggedAt || '').localeCompare(a.loggedAt || ''))
  return prs.slice(0, limit)
}

export function getTotalWeightLifted() {
  const all = getAllSessionDays()
  let total = 0
  Object.values(all).forEach((day) => {
    day.sessions?.forEach((session) => {
      session.loggedExercises.forEach((entry) => {
        if (entry.logType !== 'weighted') return
        entry.sets.forEach((s) => {
          if (s.weight && s.reps) total += s.weight * s.reps
        })
      })
    })
  })
  return total
}

export function getAvgSessionLengthMinutes() {
  const all = getAllSessionDays()
  const durations = []
  Object.values(all).forEach((day) => {
    day.sessions?.forEach((s) => {
      if (s.startedAt && s.endedAt) {
        const mins = (new Date(s.endedAt) - new Date(s.startedAt)) / 60000
        if (mins >= 0) durations.push(mins)
      }
    })
  })
  if (durations.length === 0) return 0
  return Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
}

export function get7DayBarData(exerciseId, metric = 'time') {
  const days = getLast7Days()
  const exercise = getExerciseById(exerciseId)
  const allTimePR = getPRForExercise(exerciseId, metric)?.value ?? null

  let prevValue = null
  return days.map((dateKey) => {
    const sets = getAllSetsForExercise(exerciseId).filter((s) => s.dateKey === dateKey)
    let dayValue = null

    if (sets.length > 0) {
      if (exercise?.logType === 'weighted') {
        dayValue = Math.max(...sets.map((s) => estimateOneRepMax(s.weight, s.reps)))
      } else if (exercise?.logType === 'bodyweight') {
        dayValue = Math.max(...sets.map((s) => s.reps))
      } else if (exercise?.logType === 'timed') {
        const key = metric === 'distance' ? 'distance' : 'duration'
        const vals = sets.map((s) => s[key]).filter((v) => v != null)
        dayValue = vals.length ? Math.max(...vals) : null
      }
    }

    let color = null
    if (dayValue != null) {
      const isPR = allTimePR != null && dayValue >= allTimePR
      if (isPR) {
        color = 'pr'
      } else if (prevValue == null) {
        color = 'equal'
      } else if (dayValue > prevValue) {
        color = 'up'
      } else if (dayValue < prevValue) {
        color = 'down'
      } else {
        color = 'equal'
      }
      prevValue = dayValue
    }

    return { dateKey, value: dayValue, color }
  })
}
