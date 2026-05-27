import { useState, useEffect, useCallback } from 'react'
import { useAuthContext } from '../context/AuthContext'

const STORAGE_KEY = 'dronemetrics_settings'

const translations = {
  ro: {
    title: 'Setări',
    subtitle: 'Personalizează aplicația după preferințele tale',
    general: 'Setări Generale',
    theme: 'Temă',
    themeDesc: 'Alege temă întunecoasă sau luminoasă',
    themeDark: 'Întunecos',
    themeLight: 'Luminos',
    lang: 'Limbă',
    langDesc: 'Setează limba de interfață',
    notif: 'Notificări',
    notifDesc: 'Primește alertele importante',
    density: 'Densitate Afișaj',
    densityDesc: 'Alege modul de afișare',
    densComfort: 'Confortabil',
    densCompact: 'Compact',
    densSpacious: 'Spațios',
    account: 'Cont',
    email: 'Email',
    plan: 'Plan',
    changePwd: 'Schimbă Parola',
    info: 'Informații',
    rights: '© 2026 - Toate drepturile rezervate',
    resetTitle: 'Resetează Setări',
    resetDesc: 'Restaurează valorile implicite',
    reset: 'Resetează',
    saved: 'Setări salvate',
    notifOn: 'Notificările sunt activate',
    notifOff: 'Notificările sunt dezactivate',
    pwdTitle: 'Schimbă Parola',
    pwdCurrent: 'Parola curentă',
    pwdNew: 'Parolă nouă',
    pwdConfirm: 'Confirmă parola nouă',
    cancel: 'Anulează',
    save: 'Salvează',
    pwdMismatch: 'Parolele nu coincid',
    pwdShort: 'Parola trebuie să aibă minim 6 caractere',
    pwdChanged: 'Parola a fost schimbată cu succes',
    pwdEmpty: 'Completează toate câmpurile',
    exportTitle: 'Exportă Date',
    exportDesc: 'Descarcă setările ca JSON',
    export: 'Exportă',
    exported: 'Setări exportate',
    resetDone: 'Setări resetate la implicit',
  },
  en: {
    title: 'Settings',
    subtitle: 'Personalize the application to your preferences',
    general: 'General Settings',
    theme: 'Theme',
    themeDesc: 'Choose dark or light theme',
    themeDark: 'Dark',
    themeLight: 'Light',
    lang: 'Language',
    langDesc: 'Set interface language',
    notif: 'Notifications',
    notifDesc: 'Receive important alerts',
    density: 'Display Density',
    densityDesc: 'Choose the display mode',
    densComfort: 'Comfortable',
    densCompact: 'Compact',
    densSpacious: 'Spacious',
    account: 'Account',
    email: 'Email',
    plan: 'Plan',
    changePwd: 'Change Password',
    info: 'Information',
    rights: '© 2026 - All rights reserved',
    resetTitle: 'Reset Settings',
    resetDesc: 'Restore default values',
    reset: 'Reset',
    saved: 'Settings saved',
    notifOn: 'Notifications enabled',
    notifOff: 'Notifications disabled',
    pwdTitle: 'Change Password',
    pwdCurrent: 'Current password',
    pwdNew: 'New password',
    pwdConfirm: 'Confirm new password',
    cancel: 'Cancel',
    save: 'Save',
    pwdMismatch: 'Passwords do not match',
    pwdShort: 'Password must be at least 6 characters',
    pwdChanged: 'Password changed successfully',
    pwdEmpty: 'Fill in all fields',
    exportTitle: 'Export Data',
    exportDesc: 'Download settings as JSON',
    export: 'Export',
    exported: 'Settings exported',
    resetDone: 'Settings reset to default',
  },
  de: {
    title: 'Einstellungen',
    subtitle: 'Passen Sie die Anwendung an Ihre Vorlieben an',
    general: 'Allgemeine Einstellungen',
    theme: 'Thema',
    themeDesc: 'Dunkles oder helles Thema wählen',
    themeDark: 'Dunkel',
    themeLight: 'Hell',
    lang: 'Sprache',
    langDesc: 'Oberflächensprache einstellen',
    notif: 'Benachrichtigungen',
    notifDesc: 'Wichtige Benachrichtigungen erhalten',
    density: 'Anzeigedichte',
    densityDesc: 'Anzeigemodus wählen',
    densComfort: 'Komfortabel',
    densCompact: 'Kompakt',
    densSpacious: 'Geräumig',
    account: 'Konto',
    email: 'E-Mail',
    plan: 'Plan',
    changePwd: 'Passwort ändern',
    info: 'Information',
    rights: '© 2026 - Alle Rechte vorbehalten',
    resetTitle: 'Einstellungen zurücksetzen',
    resetDesc: 'Standardwerte wiederherstellen',
    reset: 'Zurücksetzen',
    saved: 'Einstellungen gespeichert',
    notifOn: 'Benachrichtigungen aktiviert',
    notifOff: 'Benachrichtigungen deaktiviert',
    pwdTitle: 'Passwort ändern',
    pwdCurrent: 'Aktuelles Passwort',
    pwdNew: 'Neues Passwort',
    pwdConfirm: 'Neues Passwort bestätigen',
    cancel: 'Abbrechen',
    save: 'Speichern',
    pwdMismatch: 'Passwörter stimmen nicht überein',
    pwdShort: 'Passwort muss mindestens 6 Zeichen lang sein',
    pwdChanged: 'Passwort erfolgreich geändert',
    pwdEmpty: 'Alle Felder ausfüllen',
    exportTitle: 'Daten exportieren',
    exportDesc: 'Einstellungen als JSON herunterladen',
    export: 'Exportieren',
    exported: 'Einstellungen exportiert',
    resetDone: 'Einstellungen auf Standard zurückgesetzt',
  },
}

const DEFAULTS = {
  theme: 'dark',
  notifications: true,
  language: 'ro',
  displayDensity: 'comfortable',
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULTS
    return { ...DEFAULTS, ...JSON.parse(raw) }
  } catch {
    return DEFAULTS
  }
}

function applySettings(s) {
  document.documentElement.dataset.theme = s.theme
  document.documentElement.dataset.density = s.displayDensity
  document.documentElement.lang = s.language
}

export default function Settings() {
  const { user } = useAuthContext()
  const [settings, setSettings] = useState(loadSettings)
  const [toast, setToast] = useState(null)
  const [pwdOpen, setPwdOpen] = useState(false)
  const [pwdForm, setPwdForm] = useState({ current: '', next: '', confirm: '' })
  const [pwdError, setPwdError] = useState('')

  const t = translations[settings.language] || translations.ro

  useEffect(() => {
    applySettings(settings)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  }, [settings])

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 2500)
  }, [])

  const update = (patch) => {
    setSettings((s) => {
      const next = { ...s, ...patch }
      return next
    })
  }

  const handleTheme = (e) => {
    update({ theme: e.target.value })
    showToast(t.saved)
  }

  const handleLanguage = (e) => {
    const newLang = e.target.value
    const newT = translations[newLang] || translations.ro
    update({ language: newLang })
    setToast({ message: newT.saved, type: 'success' })
    setTimeout(() => setToast(null), 2500)
  }

  const handleNotifications = () => {
    const newValue = !settings.notifications
    update({ notifications: newValue })
    showToast(newValue ? t.notifOn : t.notifOff)
  }

  const handleDensity = (e) => {
    update({ displayDensity: e.target.value })
    showToast(t.saved)
  }

  const handlePwdSave = () => {
    setPwdError('')
    if (!pwdForm.current || !pwdForm.next || !pwdForm.confirm) {
      setPwdError(t.pwdEmpty)
      return
    }
    if (pwdForm.next.length < 6) {
      setPwdError(t.pwdShort)
      return
    }
    if (pwdForm.next !== pwdForm.confirm) {
      setPwdError(t.pwdMismatch)
      return
    }
    setPwdOpen(false)
    setPwdForm({ current: '', next: '', confirm: '' })
    showToast(t.pwdChanged)
  }

  const handleReset = () => {
    setSettings(DEFAULTS)
    showToast(translations[DEFAULTS.language].resetDone)
  }

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'dronemetrics-settings.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    showToast(t.exported)
  }

  return (
    <div className="space-y-8 relative">
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl border shadow-2xl backdrop-blur ${
            toast.type === 'error'
              ? 'bg-red-500/20 border-red-500/40 text-red-200'
              : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200'
          }`}
          style={{ animation: 'toast-in 0.2s ease-out' }}
        >
          <div className="flex items-center gap-2 font-semibold">
            <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
            {toast.message}
          </div>
        </div>
      )}

      <div>
        <h1 className="text-4xl font-black text-white mb-2">{t.title}</h1>
        <p className="text-slate-400 text-lg">{t.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-linear-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-6">{t.general}</h2>

            <div className="space-y-6">
              <div className="flex justify-between items-center pb-6 border-b border-slate-700 gap-4">
                <div>
                  <p className="font-semibold text-white">{t.theme}</p>
                  <p className="text-sm text-slate-500">{t.themeDesc}</p>
                </div>
                <select
                  value={settings.theme}
                  onChange={handleTheme}
                  className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white cursor-pointer hover:border-blue-500 transition"
                >
                  <option value="dark">{t.themeDark}</option>
                  <option value="light">{t.themeLight}</option>
                </select>
              </div>

              <div className="flex justify-between items-center pb-6 border-b border-slate-700 gap-4">
                <div>
                  <p className="font-semibold text-white">{t.lang}</p>
                  <p className="text-sm text-slate-500">{t.langDesc}</p>
                </div>
                <select
                  value={settings.language}
                  onChange={handleLanguage}
                  className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white cursor-pointer hover:border-blue-500 transition"
                >
                  <option value="ro">Română</option>
                  <option value="en">English</option>
                  <option value="de">Deutsch</option>
                </select>
              </div>

              <div className="flex justify-between items-center pb-6 border-b border-slate-700 gap-4">
                <div>
                  <p className="font-semibold text-white">{t.notif}</p>
                  <p className="text-sm text-slate-500">{t.notifDesc}</p>
                </div>
                <button
                  onClick={handleNotifications}
                  className={`relative inline-flex items-center h-8 w-14 rounded-full transition-colors cursor-pointer ${settings.notifications ? 'bg-blue-600' : 'bg-slate-600'}`}
                  aria-label={t.notif}
                >
                  <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${settings.notifications ? 'translate-x-7' : 'translate-x-1'}`}></span>
                </button>
              </div>

              <div className="flex justify-between items-center gap-4">
                <div>
                  <p className="font-semibold text-white">{t.density}</p>
                  <p className="text-sm text-slate-500">{t.densityDesc}</p>
                </div>
                <select
                  value={settings.displayDensity}
                  onChange={handleDensity}
                  className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white cursor-pointer hover:border-blue-500 transition"
                >
                  <option value="comfortable">{t.densComfort}</option>
                  <option value="compact">{t.densCompact}</option>
                  <option value="spacious">{t.densSpacious}</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-linear-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">{t.exportTitle}</h2>
                <p className="text-sm text-slate-500">{t.exportDesc}</p>
              </div>
              <button
                onClick={handleExport}
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2.5 rounded-lg transition-all whitespace-nowrap cursor-pointer"
              >
                {t.export}
              </button>
            </div>
          </div>

          <div className="bg-linear-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">{t.resetTitle}</h2>
                <p className="text-sm text-slate-500">{t.resetDesc}</p>
              </div>
              <button
                onClick={handleReset}
                className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 font-semibold px-5 py-2.5 rounded-lg transition-all whitespace-nowrap cursor-pointer"
              >
                {t.reset}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-linear-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">{t.account}</h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold mb-1">{t.email}</p>
                <p className="text-white font-semibold break-all">{user?.email || 'admin@dronemetrics.com'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold mb-1">{t.plan}</p>
                <p className="text-white font-semibold">Premium</p>
              </div>
              <button
                onClick={() => setPwdOpen(true)}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 rounded-lg transition-all mt-4 cursor-pointer"
              >
                {t.changePwd}
              </button>
            </div>
          </div>

          <div className="bg-linear-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">{t.info}</h2>
            <p className="text-sm text-slate-400 mb-3">DroneMetrics v2.0</p>
            <p className="text-xs text-slate-500">{t.rights}</p>
          </div>
        </div>
      </div>

      {pwdOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur flex items-center justify-center p-4"
          onClick={() => setPwdOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl"
          >
            <h3 className="text-xl font-bold text-white mb-5">{t.pwdTitle}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-500 uppercase font-semibold mb-1.5">{t.pwdCurrent}</label>
                <input
                  type="password"
                  value={pwdForm.current}
                  onChange={(e) => setPwdForm({ ...pwdForm, current: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 uppercase font-semibold mb-1.5">{t.pwdNew}</label>
                <input
                  type="password"
                  value={pwdForm.next}
                  onChange={(e) => setPwdForm({ ...pwdForm, next: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 uppercase font-semibold mb-1.5">{t.pwdConfirm}</label>
                <input
                  type="password"
                  value={pwdForm.confirm}
                  onChange={(e) => setPwdForm({ ...pwdForm, confirm: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition"
                />
              </div>
              {pwdError && (
                <div className="text-red-300 text-sm bg-red-500/15 border border-red-500/30 px-3 py-2 rounded-lg">
                  {pwdError}
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setPwdOpen(false); setPwdForm({ current: '', next: '', confirm: '' }); setPwdError('') }}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2.5 rounded-lg transition cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handlePwdSave}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-lg transition cursor-pointer"
                >
                  {t.save}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
