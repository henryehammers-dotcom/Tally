const KEYS = {
  PROFILE: 'tally_profile',
  ROUTINES: 'tally_routines',
  SESSIONS: 'tally_sessions',
  ONBOARDING_COMPLETE: 'tally_onboarding_complete',
  PLUS_TOOLTIP_SHOWN: 'tally_plus_tooltip_shown',
  COMPARISON_OBJECT: 'tally_comparison_object',
}

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw)
  } catch (e) {
    console.error(`Failed to read ${key} from storage`, e)
    return fallback
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (e) {
    console.error(`Failed to write ${key} to storage`, e)
    return false
  }
}

export function getProfile() {
  return read(KEYS.PROFILE, null)
}
export function saveProfile(profile) {
  return write(KEYS.PROFILE, profile)
}

export function getRoutines() {
  return read(KEYS.ROUTINES, [])
}
export function saveRoutines(routines) {
  return write(KEYS.ROUTINES, routines)
}

export function getAllSessionDays() {
  return read(KEYS.SESSIONS, {})
}
export function saveAllSessionDays(sessionDays) {
  return write(KEYS.SESSIONS, sessionDays)
}
export function getSessionDay(dateStr) {
  const all = getAllSessionDays()
  return all[dateStr] || null
}
export function saveSessionDay(dateStr, dayData) {
  const all = getAllSessionDays()
  all[dateStr] = dayData
  return saveAllSessionDays(all)
}

export function isOnboardingComplete() {
  return read(KEYS.ONBOARDING_COMPLETE, false)
}
export function setOnboardingComplete() {
  return write(KEYS.ONBOARDING_COMPLETE, true)
}

export function hasPlusTooltipBeenShown() {
  return read(KEYS.PLUS_TOOLTIP_SHOWN, false)
}
export function markPlusTooltipShown() {
  return write(KEYS.PLUS_TOOLTIP_SHOWN, true)
}

export function getComparisonObjectId() {
  return read(KEYS.COMPARISON_OBJECT, null)
}
export function saveComparisonObjectId(id) {
  return write(KEYS.COMPARISON_OBJECT, id)
}

export function exportAllData() {
  return {
    tallyup_backup: true,
    version: 'v2.0',
    savedAt: new Date().toISOString(),
    data: {
      profile: getProfile(),
      routines: getRoutines(),
      sessions: getAllSessionDays(),
      onboardingComplete: isOnboardingComplete(),
    },
  }
}

export function restoreAllData(backupObject) {
  if (!backupObject || !backupObject.data) {
    throw new Error('Invalid backup file')
  }
  const { profile, routines, sessions, onboardingComplete } = backupObject.data
  if (profile) saveProfile(profile)
  if (routines) saveRoutines(routines)
  if (sessions) saveAllSessionDays(sessions)
  write(KEYS.ONBOARDING_COMPLETE, !!onboardingComplete)
  return true
}

export function resetAllData() {
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key))
}
