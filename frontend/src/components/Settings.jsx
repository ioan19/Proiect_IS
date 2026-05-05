import { useState } from 'react'

export default function Settings() {
  const [settings, setSettings] = useState({
    theme: 'dark',
    notifications: true,
    autoSave: true,
    language: 'ro',
    displayDensity: 'comfortable'
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black text-white mb-2">Setări</h1>
        <p className="text-slate-400 text-lg">Personalizează aplicația după preferințele tale</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-linear-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-6">Setări Generale</h2>
            
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-6 border-b border-slate-700">
                <div>
                  <p className="font-semibold text-white">Temă</p>
                  <p className="text-sm text-slate-500">Alege temă întunecoasă sau luminoasă</p>
                </div>
                <select className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white">
                  <option>Întunecos</option>
                  <option>Luminos</option>
                </select>
              </div>

              <div className="flex justify-between items-center pb-6 border-b border-slate-700">
                <div>
                  <p className="font-semibold text-white">Limbă</p>
                  <p className="text-sm text-slate-500">Setează limba de interfață</p>
                </div>
                <select className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white">
                  <option>Română</option>
                  <option>English</option>
                  <option>Deutsch</option>
                </select>
              </div>

              <div className="flex justify-between items-center pb-6 border-b border-slate-700">
                <div>
                  <p className="font-semibold text-white">Notificări</p>
                  <p className="text-sm text-slate-500">Primește alertele importante</p>
                </div>
                <button className={`relative inline-flex items-center h-8 w-14 rounded-full transition-colors ${settings.notifications ? 'bg-blue-600' : 'bg-slate-600'}`}>
                  <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${settings.notifications ? 'translate-x-7' : 'translate-x-1'}`}></span>
                </button>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-white">Densitate Afișaj</p>
                  <p className="text-sm text-slate-500">Alege modul de afișare</p>
                </div>
                <select className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white">
                  <option>Confortabil</option>
                  <option>Compact</option>
                  <option>Spațios</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-linear-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">Cont</h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Email</p>
                <p className="text-white font-semibold">user@example.com</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Plan</p>
                <p className="text-white font-semibold">Premium</p>
              </div>
              <button className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 rounded-lg transition-all mt-4">
                Schimbă Parola
              </button>
            </div>
          </div>

          <div className="bg-linear-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">Informații</h2>
            <p className="text-sm text-slate-400 mb-3">DroneMetrics v2.0</p>
            <p className="text-xs text-slate-500">© 2026 - Toate drepturile rezervate</p>
          </div>
        </div>
      </div>
    </div>
  )
}