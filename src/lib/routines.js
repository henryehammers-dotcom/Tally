import { getRoutines, saveRoutines } from './storage'
import { presetRoutines } from './library'

function generateId() {
  return `routine-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function isNameTaken(name, excludeId = null) {
  const routines = getRoutines()
  return routines.some(
    (r) => r.name.trim().toLowerCase() === name.trim().toLowerCase() && r.id !== excludeId
  )
}

export function createRoutineFromScratch(name, color) {
  if (isNameTaken(name)) {
    throw new Error(`A routine named "${name}" already exists`)
  }
  const routines = getRoutines()
  const newRoutine = {
    id: generateId(),
    name: name.trim().toLowerCase(),
    color,
    createdAt: new Date().toISOString(),
    exercises: [],
  }
  routines.push(newRoutine)
  saveRoutines(routines)
  return newRoutine
}

export function createRoutineFromPreset(presetId, overrideName = null) {
  const preset = presetRoutines.find((p) => p.id === presetId)
  if (!preset) throw new Error('Preset not found')

  const name = (overrideName || preset.name).trim().toLowerCase()
  if (isNameTaken(name)) {
    throw new Error(`A routine named "${name}" already exists`)
  }

  const routines = getRoutines()
  const newRoutine = {
    id: generateId(),
    name,
    color: preset.color,
    createdAt: new Date().toISOString(),
    exercises: preset.exercises.map((e) => ({ ...e })),
  }
  routines.push(newRoutine)
  saveRoutines(routines)
  return newRoutine
}

export function renameRoutine(routineId, newName) {
  if (isNameTaken(newName, routineId)) {
    throw new Error(`A routine named "${newName}" already exists`)
  }
  const routines = getRoutines()
  const routine = routines.find((r) => r.id === routineId)
  if (!routine) throw new Error('Routine not found')
  routine.name = newName.trim().toLowerCase()
  saveRoutines(routines)
  return routine
}

export function recolorRoutine(routineId, newColor) {
  const routines = getRoutines()
  const routine = routines.find((r) => r.id === routineId)
  if (!routine) throw new Error('Routine not found')
  routine.color = newColor
  saveRoutines(routines)
  return routine
}

export function deleteRoutine(routineId) {
  const routines = getRoutines().filter((r) => r.id !== routineId)
  saveRoutines(routines)
}

export function addExerciseToRoutine(routineId, exerciseId, targets) {
  const routines = getRoutines()
  const routine = routines.find((r) => r.id === routineId)
  if (!routine) throw new Error('Routine not found')
  if (routine.exercises.some((e) => e.exerciseId === exerciseId)) {
    throw new Error('This exercise is already in this routine')
  }
  routine.exercises.push({ exerciseId, ...targets })
  saveRoutines(routines)
  return routine
}

export function removeExerciseFromRoutine(routineId, exerciseId) {
  const routines = getRoutines()
  const routine = routines.find((r) => r.id === routineId)
  if (!routine) throw new Error('Routine not found')
  routine.exercises = routine.exercises.filter((e) => e.exerciseId !== exerciseId)
  saveRoutines(routines)
  return routine
}

export function reorderRoutineExercises(routineId, newOrderExerciseIds) {
  const routines = getRoutines()
  const routine = routines.find((r) => r.id === routineId)
  if (!routine) throw new Error('Routine not found')
  const byId = Object.fromEntries(routine.exercises.map((e) => [e.exerciseId, e]))
  routine.exercises = newOrderExerciseIds.map((id) => byId[id]).filter(Boolean)
  saveRoutines(routines)
  return routine
}

export function updateExerciseTargets(routineId, exerciseId, newTargets) {
  const routines = getRoutines()
  const routine = routines.find((r) => r.id === routineId)
  if (!routine) throw new Error('Routine not found')
  const entry = routine.exercises.find((e) => e.exerciseId === exerciseId)
  if (!entry) throw new Error('Exercise not found in routine')
  Object.assign(entry, newTargets)
  saveRoutines(routines)
  return routine
}

export function getRoutineById(routineId) {
  return getRoutines().find((r) => r.id === routineId) || null
}
