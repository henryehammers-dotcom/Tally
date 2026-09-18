import { useState } from 'react'
import { getProfile } from '../lib/storage'
import { getCurrentStreak, getDaysLoggedCount, isRestDay, hasLoggedToday } from '../lib/sessions'
import { getCurrentWeekDates } from '../lib/dates'
import { getRecentPRs, getAvgSessionLengthMinutes, getTotalWeightLifted, formatSessionLength } from '../lib/stats'
import { comparisonObjects } from '../lib/library'
import ZzzIcon from '../components/ZzzIcon'
import FilterIconSvg from '../components/FilterIconSvg'
import AllPRsPopup from '../components/AllPRsPopup'
import WeekSessionLengthsPopup from '../components/WeekSessionLengthsPopup'
import ComparisonPickerPopup from '../components/ComparisonPickerPopup'
import './Tally.css'

const WEEKDAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

function WeekRow() {
  const dates = getCurrentWeekDates()
  return (
    <div className="tally-week-row">
      {dates.map((dateKey, i) => {
        const rest = isRestDay(dateKey)
        const logged = !rest && hasLoggedToday(dateKey)
        return (
          <div key={dateKey} className="tally-week-cell">
            <div className={`tally-week-circle ${logged ? 'tally-week-circle-logged' : ''}`}>
              {logged && (
                <svg width="16" height="16" viewBox="0 0 16 16">
                  <path d="M3 8.5L6.5 12L13 4.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              )}
              {rest && <ZzzIcon size={14} />}
            </div>
            <div className="tally-week-label">{WEEKDAY_LABELS[i]}</div>
          </div>
        )
      })}
    </div>
  )
}

function FilterIcon({ onClick }) {
  return (
    <button className="tally-filter-icon" onClick={onClick}>
      <FilterIconSvg />
    </button>
  )
}

export default function Tally() {
  const profile = getProfile() || {}
  const [showAllPRs, setShowAllPRs] = useState(false)
  const [showWeekLengths, setShowWeekLengths] = useState(false)
  const [showComparisonPicker, setShowComparisonPicker] = useState(false)
  const [comparisonId, setComparisonId] = useState(comparisonObjects[0].id)

  const recentPRs = getRecentPRs(3)
  const avgMinutes = getAvgSessionLengthMinutes()
  const totalWeight = getTotalWeightLifted()
  const streak = getCurrentStreak()
  const daysLogged = getDaysLoggedCount()

  const comparisonObject = comparisonObjects.find((o) => o.id === comparisonId) || comparisonObjects[0]
  const gaugePercent = Math.min(1, totalWeight / comparisonObject.weightLbs)

  const cx = 100
  const cy = 95
  const r = 78
  const circumference = Math.PI * r
  const markerAngle = Math.PI - gaugePercent * Math.PI
  const markerX = cx + r * Math.cos(markerAngle)
  const markerY = cy - r * Math.sin(markerAngle)

  return (
    <div className="screen tally-screen">
      <h1 className="tally-header">{profile.name ? `${profile.name}'s Tally` : 'Your Tally'}</h1>

      <WeekRow />

      <div className="tally-card">
        <div className="tally-card-header">
          <div className="tally-card-title" style={{ color: 'var(--color-pr-card)' }}>Recent PRs</div>
          <button className="tally-see-all" onClick={() => setShowAllPRs(true)}>See all</button>
        </div>
        {recentPRs.length === 0 ? (
          <div className="tally-empty">No PRs yet</div>
        ) : (
          <div className="tally-pr-list">
            {recentPRs.map((pr) => (
              <div key={pr.exerciseId} className="tally-pr-row">
                <span>{pr.exerciseName}</span>
                <span>
                  {pr.logType === 'weighted' ? `${Math.round(pr.value)} lbs e1RM` : pr.logType === 'bodyweight' ? `${pr.value} reps` : pr.value}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="tally-card">
        <div className="tally-card-header">
          <div className="tally-card-title" style={{ color: 'var(--color-avg-session-card)' }}>Avg Session Length</div>
          <button className="tally-see-all" onClick={() => setShowWeekLengths(true)}>See full week</button>
        </div>
        <div className="tally-big-stat">
          {avgMinutes > 0 ? formatSessionLength(avgMinutes) : 'No sessions logged yet'}
        </div>
      </div>

      <div className="tally-card tally-gauge-card">
        <div className="tally-card-header">
          <div className="tally-card-title">Total Weight Lifted</div>
          <FilterIcon onClick={() => setShowComparisonPicker(true)} />
        </div>

        <svg className="tally-gauge" viewBox="0 0 200 110">
          <path
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            fill="none"
            stroke="var(--off-white)"
            strokeWidth="14"
            strokeLinecap="round"
          />
          <path
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            fill="none"
            stroke="var(--color-gauge-marker)"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - gaugePercent)}
          />
          <circle cx={markerX} cy={markerY} r="9" fill="var(--color-gauge-marker)" stroke="white" strokeWidth="3" />
        </svg>

        <div className="tally-gauge-number" style={{ color: 'var(--color-total-weight-number)' }}>
          {Math.round(totalWeight).toLocaleString()}
        </div>
        <div className="tally-gauge-caption">
          Total Weight Lifted (Compared to a {comparisonObject.name})
        </div>
      </div>

      <div className="tally-bottom-pair">
        <div className="tally-card tally-half-card">
          <div className="tally-card-title" style={{ color: 'var(--color-streak-card)' }}>Current Streak</div>
          <div className="tally-big-stat">{streak} days</div>
        </div>
        <div className="tally-card tally-half-card">
          <div className="tally-card-title" style={{ color: 'var(--color-days-logged-card)' }}>Days Logged</div>
          <div className="tally-big-stat">{daysLogged} days</div>
        </div>
      </div>

      {showAllPRs && <AllPRsPopup onClose={() => setShowAllPRs(false)} />}
      {showWeekLengths && <WeekSessionLengthsPopup onClose={() => setShowWeekLengths(false)} />}
      {showComparisonPicker && (
        <ComparisonPickerPopup
          selectedId={comparisonId}
          onSelect={(id) => { setComparisonId(id); setShowComparisonPicker(false) }}
          onClose={() => setShowComparisonPicker(false)}
        />
      )}
    </div>
  )
}
