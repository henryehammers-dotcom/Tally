import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProfile, saveProfile, exportAllData, restoreAllData, resetAllData } from '../lib/storage'
import { GOAL_OPTIONS, FOCUS_AREA_OPTIONS, CONCERN_OPTIONS, experienceLabel } from '../lib/profileOptions'
import { generateCopyToAIText } from '../lib/copyToAI'
import { todayKey } from '../lib/dates'
import Popup from '../components/Popup'
import ProfileEditPopup from '../components/ProfileEditPopup'
import MultiSelectPopup from '../components/MultiSelectPopup'
import './Settings.css'

export default function Settings() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [profile, setProfile] = useState(() => getProfile() || {})
  const [showProfileEdit, setShowProfileEdit] = useState(false)
  const [showGoals, setShowGoals] = useState(false)
  const [showFocus, setShowFocus] = useState(false)
  const [showConcerns, setShowConcerns] = useState(false)
  const [showRestoreWarning, setShowRestoreWarning] = useState(false)
  const [showResetWarning, setShowResetWarning] = useState(false)
  const [toast, setToast] = useState(null)

  function refresh() {
    setProfile(getProfile() || {})
  }

  function flashToast(message) {
    setToast(message)
    setTimeout(() => setToast(null), 2500)
  }

  function handleSaveProfile(fields) {
    saveProfile({ ...profile, ...fields })
    setShowProfileEdit(false)
    refresh()
  }

  function handleUnitsChange(units) {
    saveProfile({ ...profile, units })
    refresh()
  }

  function handleSaveBackupFile() {
    const data = exportAllData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tally-backup-${todayKey()}.json`
    a.click()
    URL.revokeObjectURL(url)
    flashToast('Backup file saved')
  }

  function handleFileSelected(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result)
        restoreAllData(parsed)
        refresh()
        flashToast('Data restored')
      } catch (err) {
        flashToast('Could not read that backup file')
      }
    }
    reader.readAsText(file)
  }

  async function handleCopyToAI() {
    const text = generateCopyToAIText()
    try {
      await navigator.clipboard.writeText(text)
      flashToast('Copied to clipboard!')
    } catch {
      flashToast('Could not copy — check browser permissions')
    }
  }

  function handleResetConfirm() {
    resetAllData()
    setShowResetWarning(false)
    navigate('/welcome')
  }

  const initial = (profile.name || '?').charAt(0).toUpperCase()

  return (
    <div className="screen settings-screen">
      <h1>Settings</h1>

      <div className="settings-section-label">Profile</div>
      <button className="profile-card" onClick={() => setShowProfileEdit(true)}>
        <div className="profile-avatar">{initial}</div>
        <div className="profile-card-text">
          <div className="profile-name">{profile.name || 'Set your name'}</div>
          <div className="profile-experience">{experienceLabel(profile.experienceLevel) || 'Experience not set'}</div>
        </div>
      </button>

      <div className="settings-section-label">Preferences</div>

      <div className="settings-row">
        <span className="settings-row-label">Units</span>
        <div className="units-toggle">
          <button
            className={`units-option ${profile.units !== 'kgs' ? 'units-option-selected' : ''}`}
            onClick={() => handleUnitsChange('lbs')}
          >
            lbs
          </button>
          <button
            className={`units-option ${profile.units === 'kgs' ? 'units-option-selected' : ''}`}
            onClick={() => handleUnitsChange('kgs')}
          >
            kgs
          </button>
        </div>
      </div>

      <button className="settings-row settings-row-tappable" onClick={() => setShowGoals(true)}>
        <span className="settings-row-label">Goals</span>
        <span className="settings-row-value">{profile.goals?.length ? profile.goals.join(', ') : 'None set'}</span>
      </button>

      <button className="settings-row settings-row-tappable" onClick={() => setShowFocus(true)}>
        <span className="settings-row-label">Areas of Focus</span>
        <span className="settings-row-value">{profile.focusAreas?.length ? profile.focusAreas.join(', ') : 'None set'}</span>
      </button>

      <button className="settings-row settings-row-tappable" onClick={() => setShowConcerns(true)}>
        <span className="settings-row-label">Areas of Concern</span>
        <span className="settings-row-value">{profile.concerns?.length ? profile.concerns.join(', ') : 'None set'}</span>
      </button>

      <div className="settings-section-label">Data</div>
      <button className="settings-data-button" onClick={handleSaveBackupFile}>Save backup file</button>
      <button className="settings-data-button" onClick={() => setShowRestoreWarning(true)}>Restore from backup</button>
      <button className="settings-data-button" onClick={handleCopyToAI}>Copy to AI</button>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        style={{ display: 'none' }}
        onChange={handleFileSelected}
      />

      {toast && <div className="settings-toast">{toast}</div>}

      <button className="settings-reset-button" onClick={() => setShowResetWarning(true)}>Reset App</button>

      {showProfileEdit && (
        <ProfileEditPopup
          profile={profile}
          onClose={() => setShowProfileEdit(false)}
          onSave={handleSaveProfile}
        />
      )}

      {showGoals && (
        <MultiSelectPopup
          title="Goals"
          options={GOAL_OPTIONS}
          selected={profile.goals || []}
          onClose={() => setShowGoals(false)}
          onSave={(values) => { saveProfile({ ...profile, goals: values }); setShowGoals(false); refresh() }}
        />
      )}

      {showFocus && (
        <MultiSelectPopup
          title="Areas of Focus"
          options={FOCUS_AREA_OPTIONS}
          selected={profile.focusAreas || []}
          onClose={() => setShowFocus(false)}
          onSave={(values) => { saveProfile({ ...profile, focusAreas: values }); setShowFocus(false); refresh() }}
        />
      )}

      {showConcerns && (
        <MultiSelectPopup
          title="Areas of Concern"
          options={CONCERN_OPTIONS}
          selected={profile.concerns || []}
          onClose={() => setShowConcerns(false)}
          onSave={(values) => { saveProfile({ ...profile, concerns: values }); setShowConcerns(false); refresh() }}
        />
      )}

      {showRestoreWarning && (
        <Popup
          title="Restore from Backup"
          message="This will completely overwrite all current data (Routines, Sessions, Profile) with the contents of the backup file."
          actions={
            <>
              <button className="popup-btn-secondary" onClick={() => setShowRestoreWarning(false)}>Cancel</button>
              <button className="popup-btn-primary" onClick={() => { setShowRestoreWarning(false); fileInputRef.current?.click() }}>Continue</button>
            </>
          }
        />
      )}

      {showResetWarning && (
        <Popup
          title="Reset App"
          message="This will permanently wipe all data — routines, history, everything."
          actions={
            <>
              <button className="popup-btn-secondary" onClick={() => setShowResetWarning(false)}>Cancel</button>
              <button className="popup-btn-primary" style={{ background: 'var(--red)' }} onClick={handleResetConfirm}>Continue</button>
            </>
          }
        />
      )}
    </div>
  )
}
