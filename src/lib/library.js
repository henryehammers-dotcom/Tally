import chest from '../../data/library/chest.json'
import back from '../../data/library/back.json'
import shoulders from '../../data/library/shoulders.json'
import arms from '../../data/library/arms.json'
import legs from '../../data/library/legs.json'
import core from '../../data/library/core.json'
import fullBody from '../../data/library/full-body.json'
import cardio from '../../data/library/cardio.json'
import presetRoutines from '../../data/library/preset-routines.json'
import musicData from '../../data/library/music.json'
import comparisonObjects from '../../data/library/comparison-objects.json'
import muscleGroupColors from '../../data/library/muscle-group-colors.json'

export const MUSCLE_GROUPS = [
  'Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Full Body', 'Cardio',
]

export const ALL_EXERCISES = [
  ...chest, ...back, ...shoulders, ...arms, ...legs, ...core, ...fullBody, ...cardio,
]

const EXERCISE_BY_ID = Object.fromEntries(ALL_EXERCISES.map((ex) => [ex.id, ex]))

export function getExerciseById(id) {
  return EXERCISE_BY_ID[id] || null
}

export function getExercisesByMuscleGroup(muscleGroup) {
  return ALL_EXERCISES.filter((ex) => ex.muscleGroup === muscleGroup)
}

const MUSCLE_GROUP_COLOR_MAP = Object.fromEntries(
  muscleGroupColors.map((m) => [m.muscleGroup, m.color])
)
export function getMuscleGroupColor(muscleGroup) {
  return MUSCLE_GROUP_COLOR_MAP[muscleGroup] || '#ecebe6'
}

export function getAvailableFilters(muscleGroup) {
  const exercises = getExercisesByMuscleGroup(muscleGroup)
  const types = [...new Set(exercises.map((ex) => ex.type))]
  const equipment = [...new Set(exercises.map((ex) => ex.equipment))]
  return { types, equipment }
}

export { presetRoutines, comparisonObjects }
export const composers = musicData
