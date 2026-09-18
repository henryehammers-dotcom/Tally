const LBS_PER_KG = 2.20462

export function lbsToKgs(lbs) {
  return lbs / LBS_PER_KG
}

export function kgsToLbs(kgs) {
  return kgs * LBS_PER_KG
}

export function formatWeight(weightLbs, units) {
  if (weightLbs == null) return ''
  if (units === 'kgs') return `${Math.round(lbsToKgs(weightLbs))} kg`
  return `${Math.round(weightLbs)} lbs`
}
