import { getProfile, getRoutines, getAllSessionDays } from './storage'
import { getExerciseById } from './library'
import {
  getCurrentStreak, getBestStreak, getDaysLoggedCount, getTrackingSinceDate,
} from './sessions'
import { getAvgSessionLengthMinutes, getRecentPRs, formatSessionLength } from './stats'
import { daysAgo } from './dates'
import { experienceLabel } from './profileOptions'

function formatLongDate(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function formatShortDate(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatSetForExport(logType, set) {
  if (logType === 'weighted') return `${set.weight}x${set.reps}`
  if (logType === 'bodyweight') return `BW x${set.reps}`
  if (logType === 'timed') {
    const m = Math.floor(set.duration / 60)
    const s = set.duration % 60
    const dur = `${m}:${String(s).padStart(2, '0')}`
    return set.distance != null ? `${dur}, ${set.distance}mi` : dur
  }
  return ''
}

export function generateCopyToAIText() {
  const profile = getProfile() || {}
  const routines = getRoutines()
  const allDays = getAllSessionDays()
  const trackingSince = getTrackingSinceDate()
  const recentPRs = getRecentPRs(10)

  const lines = []
  lines.push('# Tally Fitness Data Export')
  lines.push('')
  lines.push(
    'This is a data export from Tally, a personal workout tracking app. It contains this person\'s profile, ' +
    'current routines, and training history. If you are an AI assistant reading this, use it to understand ' +
    'their training background, current program, and progress so you can give informed, personalized fitness ' +
    'advice. Everything below is raw, unmodified data — no trends, patterns, or interpretations have been ' +
    'pre-calculated. Reading the day-by-day log will show actual consistency, progress, and gaps; drawing ' +
    'conclusions from that is intentionally left to you.'
  )
  lines.push('')
  const today = new Date()
  lines.push(`**Export generated on:** ${today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} (treat this as "today" for any date math — e.g. calculating how long ago a session happened, or how many days since the last workout)`)
  lines.push('')
  lines.push('---')
  lines.push('')
  lines.push('## Profile')
  lines.push('')
  lines.push(`- **Name:** ${profile.name || 'Unknown'}`)
  if (profile.height) lines.push(`- **Height:** ${profile.height.ft}'${profile.height.in}"`)
  if (profile.weight) lines.push(`- **Weight:** ${profile.weight} ${profile.units === 'kgs' ? 'kg' : 'lbs'}`)
  if (profile.experienceLevel) {
    lines.push(`- **Experience level:** ${experienceLabel(profile.experienceLevel) || profile.experienceLevel}`)
  }
  if (profile.goals?.length) lines.push(`- **Goals:** ${profile.goals.join(', ')}`)
  if (profile.focusAreas?.length) lines.push(`- **Focus areas:** ${profile.focusAreas.join(', ')}`)
  if (profile.concerns?.length) lines.push(`- **Areas of concern:** ${profile.concerns.join(', ')}`)
  lines.push('')
  lines.push('---')
  lines.push('')
  lines.push('## Current Routines')
  lines.push('')
  if (routines.length === 0) {
    lines.push('*No routines created yet.*')
  }
  routines.forEach((r) => {
    lines.push(`### ${r.name}`)
    lines.push('*Exercises, in order, with current targets:*')
    r.exercises.forEach((entry, i) => {
      const ex = getExerciseById(entry.exerciseId)
      const name = ex?.name || entry.exerciseId
      if (ex?.logType === 'timed') {
        lines.push(`${i + 1}. ${name} — ${entry.duration || ex.defaultDuration}${entry.rest ? `, ${entry.rest} rest` : ''}`)
      } else {
        lines.push(`${i + 1}. ${name} — ${entry.sets} sets x ${entry.reps} reps, ${entry.rest} rest`)
      }
    })
    lines.push('')
  })
  lines.push('---')
  lines.push('')
  lines.push('## Training History Summary')
  lines.push('')
  lines.push(`- **Tracking since:** ${trackingSince ? formatLongDate(trackingSince) : 'No history yet'}`)
  lines.push(`- **Total days logged:** ${getDaysLoggedCount()}`)
  lines.push(`- **Current streak:** ${getCurrentStreak()} days`)
  lines.push(`- **Best streak:** ${getBestStreak()} days`)
  lines.push(`- **Average session length:** ${formatSessionLength(getAvgSessionLengthMinutes())}`)
  lines.push('')
  if (recentPRs.length > 0) {
    lines.push('### Recent Personal Records')
    recentPRs.forEach((pr) => {
      if (pr.logType === 'weighted') {
        lines.push(`- ${pr.exerciseName} — best e1RM ~${Math.round(pr.value)} lbs`)
      } else if (pr.logType === 'bodyweight') {
        lines.push(`- ${pr.exerciseName} — ${pr.value} reps`)
      } else {
        lines.push(`- ${pr.exerciseName} — ${pr.value}`)
      }
    })
    lines.push('')
  }

  lines.push('### Last 3 Weeks, Day by Day')
  lines.push('*Every day is listed, including rest days and days with no activity at all, so the full pattern of consistency is visible — not just the days something was logged.*')
  lines.push('')
  for (let i = 0; i < 21; i++) {
    const dateKey = daysAgo(i)
    const day = allDays[dateKey]
    const label = formatShortDate(dateKey)
    if (!day || (!day.isRestDay && day.sessions.length === 0)) {
      lines.push(`**${label} — No activity logged**`)
    } else if (day.isRestDay) {
      lines.push(`**${label} — Rest day**`)
    } else {
      day.sessions.forEach((session) => {
        const exerciseSummaries = session.loggedExercises.map((entry) => {
          const setsStr = entry.sets.map((s) => formatSetForExport(entry.logType, s)).join(', ')
          return `${entry.exerciseName} (${setsStr})`
        })
        lines.push(`**${label} — ${session.routineName}:** ${exerciseSummaries.join(', ')}`)
      })
    }
  }
  lines.push('')
  lines.push('---')
  lines.push('')
  lines.push('*End of export. This document reflects data as of the export date and does not update automatically.*')

  return lines.join('\n')
}
