import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProfile, saveProfile, setOnboardingComplete } from '../lib/storage'
import { EXPERIENCE_OPTIONS, GOAL_OPTIONS, FOCUS_AREA_OPTIONS, CONCERN_OPTIONS } from '../lib/profileOptions'
import './Questionnaire.css'

function toggleValue(list, value) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}

const STEP_IDS = ['name', 'height', 'weight', 'experience', 'goals', 'focus', 'concerns']

export default function Questionnaire() {
  const navigate = useNavigate()
  const existing = getProfile() || {}

  const [stepIndex, setStepIndex] = useState(0)
  const [profile, setProfile] = useState({
    name: existing.name || '',
    height: existing.height || { ft: '', in: '' },
    weight: existing.weight || '',
    experienceLevel: existing.experienceLevel || null,
    goals: existing.goals || [],
    focusAreas: existing.focusAreas || [],
    concerns: existing.concerns || [],
  })

  const stepId = STEP_IDS[stepIndex]
  const isLastStep = stepIndex === STEP_IDS.length - 1

  function persist(next) {
    setProfile(next)
    saveProfile({ ...next, units: 'lbs' })
  }

  function goNext() {
    if (isLastStep) {
      saveProfile({
        ...profile,
        height: { ft: Number(profile.height.ft) || 0, in: Number(profile.height.in) || 0 },
        weight: Number(profile.weight) || 0,
        units: 'lbs',
      })
      setOnboardingComplete()
      navigate('/library')
      return
    }
    setStepIndex((i) => i + 1)
  }

  function goBack() {
    setStepIndex((i) => Math.max(0, i - 1))
  }

  function isRequiredValid() {
    if (stepId === 'name') return profile.name.trim().length > 0
    if (stepId === 'height') return String(profile.height.ft).trim().length > 0
    if (stepId === 'weight') return String(profile.weight).trim().length > 0
    if (stepId === 'experience') return !!profile.experienceLevel
    return true
  }

  const isSkippable = ['goals', 'focus', 'concerns'].includes(stepId)

  function renderStep() {
    if (stepId === 'name') {
      return (
        <>
          <div className="q-question">What's your name?</div>
          <input
            className="q-input"
            type="text"
            value={profile.name}
            onChange={(e) => persist({ ...profile, name: e.target.value })}
            placeholder="Your name"
            autoFocus
          />
        </>
      )
    }
    if (stepId === 'height') {
      return (
        <>
          <div className="q-question">How tall are you?</div>
          <div className="q-row">
            <input
              className="q-input q-input-small"
              type="text"
              inputMode="numeric"
              value={profile.height.ft}
              onChange={(e) => persist({ ...profile, height: { ...profile.height, ft: e.target.value } })}
              placeholder="ft"
            />
            <input
              className="q-input q-input-small"
              type="text"
              inputMode="numeric"
              value={profile.height.in}
              onChange={(e) => persist({ ...profile, height: { ...profile.height, in: e.target.value } })}
              placeholder="in"
            />
          </div>
        </>
      )
    }
    if (stepId === 'weight') {
      return (
        <>
          <div className="q-question">What's your weight?</div>
          <input
            className="q-input"
            type="text"
            inputMode="numeric"
            value={profile.weight}
            onChange={(e) => persist({ ...profile, weight: e.target.value })}
            placeholder="lbs"
            autoFocus
          />
        </>
      )
    }
    if (stepId === 'experience') {
      return (
        <>
          <div className="q-question">What's your experience level?</div>
          <div className="q-option-list">
            {EXPERIENCE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                className={`q-option ${profile.experienceLevel === opt.id ? 'q-option-selected' : ''}`}
                onClick={() => persist({ ...profile, experienceLevel: opt.id })}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )
    }
    if (stepId === 'goals') {
      return (
        <>
          <div className="q-question">What are your goals?</div>
          <div className="q-chip-grid">
            {GOAL_OPTIONS.map((g) => (
              <button
                key={g}
                className={`q-chip ${profile.goals.includes(g) ? 'q-chip-selected' : ''}`}
                onClick={() => persist({ ...profile, goals: toggleValue(profile.goals, g) })}
              >
                {g}
              </button>
            ))}
          </div>
        </>
      )
    }
    if (stepId === 'focus') {
      return (
        <>
          <div className="q-question">Any focus areas?</div>
          <div className="q-chip-grid">
            {FOCUS_AREA_OPTIONS.map((f) => (
              <button
                key={f}
                className={`q-chip ${profile.focusAreas.includes(f) ? 'q-chip-selected' : ''}`}
                onClick={() => persist({ ...profile, focusAreas: toggleValue(profile.focusAreas, f) })}
              >
                {f}
              </button>
            ))}
          </div>
        </>
      )
    }
    if (stepId === 'concerns') {
      return (
        <>
          <div className="q-question">Any concerns we should know about?</div>
          <div className="q-chip-grid">
            {CONCERN_OPTIONS.map((c) => (
              <button
                key={c}
                className={`q-chip ${profile.concerns.includes(c) ? 'q-chip-selected' : ''}`}
                onClick={() => persist({ ...profile, concerns: toggleValue(profile.concerns, c) })}
              >
                {c}
              </button>
            ))}
          </div>
        </>
      )
    }
    return null
  }

  return (
    <div className="screen q-screen">
      <div className="q-content">{renderStep()}</div>

      <div className="q-nav">
        {stepIndex > 0 && (
          <button className="q-btn q-btn-secondary" onClick={goBack}>Back</button>
        )}
        {isSkippable && (
          <button className="q-btn q-btn-secondary" onClick={goNext}>Skip</button>
        )}
        <button
          className="q-btn q-btn-primary"
          disabled={!isSkippable && !isRequiredValid()}
          onClick={goNext}
        >
          {isLastStep ? 'Finish' : 'Next'}
        </button>
      </div>
    </div>
  )
}
