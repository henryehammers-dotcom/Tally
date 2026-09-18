export const EXPERIENCE_OPTIONS = [
  { id: 'new', label: 'New to working out' },
  { id: 'been_at_it_a_while', label: 'Been at it a while' },
  { id: 'just_getting_back_into_it', label: 'Just getting back into it' },
  { id: 'years_of_experience', label: 'Years of experience' },
]

export const GOAL_OPTIONS = ['Build Muscle', 'Lose Fat', 'Get Stronger', 'Improve Endurance', 'General Fitness']
export const FOCUS_AREA_OPTIONS = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Full Body']
export const CONCERN_OPTIONS = [
  'Knees', 'Lower Back', 'Upper Back', 'Shoulders', 'Elbows',
  'Wrists', 'Hips', 'Ankles', 'Neck', 'Hamstrings', 'Groin',
]

export function experienceLabel(id) {
  return EXPERIENCE_OPTIONS.find((o) => o.id === id)?.label || ''
}
