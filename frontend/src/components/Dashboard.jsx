import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    total_configs: 0,
    avg_price: 0,
    success_rate: 95,
    active_users: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/analytics')
      const data = await res.json()
      setStats(data)
    } catch (err) {
      console.error('Analytics error:', err)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Configurări',
      value: stats.total_configs,
      icon: '⚙️',
      color: 'from-blue-600 to-blue-400',
      subtext: '+5 luna aceasta'
    },
    {
      title: 'Drone Active',
      value: stats.active_users || '8',
      icon: '🚁',
      color: 'from-cyan-600 to-cyan-400',
      subtext: 'Conectate in timp real'
    },
    {
      title: 'Performanță Medie',
      value: stats.success_rate + '%',
      icon: '📊',
      color: 'from-emerald-600 to-emerald-400',
      subtext: 'Optim'
    },
    {
      title: 'Preț Mediu',
      value: '$' + stats.avg_price.toFixed(0),
      icon: '💰',
      color: 'from-orange-600 to-orange-400',
      subtext: 'Total configurații'
    }
  ]

  const handleNewConfig = () => navigate('/configurator')
  
  const handleExport = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Raport_Drone' })
      })
      const data = await res.json()
      alert(`✅ ${data.message}`)
    } catch (err) {
      alert('❌ Export eșuat: ' + err.message)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black text-white mb-2">Tablou de Bord</h1>
        <p className="text-slate-400 text-lg">Bienvenit la DroneMetrics - gestionează-ți flota de drone</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <div
            key={idx}
            className="group bg-linear-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700 hover:border-slate-600 transition-all hover:shadow-2xl hover:shadow-slate-800/50 cursor-pointer"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`text-4xl bg-linear-to-br ${stat.color} bg-clip-text text-transparent`}>
                {stat.icon}
              </div>
              <div className="w-12 h-12 rounded-lg bg-linear-to-br from-slate-700 to-slate-800 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-slate-700/50 transition-all">
                <span className="text-xl">→</span>
              </div>
            </div>
            <p className="text-slate-400 text-sm font-semibold uppercase tracking-wide mb-2">
              {stat.title}
            </p>
            <p className="text-3xl font-black text-white mb-2">
              {loading ? '...' : stat.value}
            </p>
            <p className="text-xs text-slate-500">
              {stat.subtext}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-linear-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>📋</span>
            Configurări Recente
          </h2>
          <div className="space-y-3">
            {[
              { name: 'FPV Racing 5"', date: 'Azi', status: 'Optimizat', color: 'green' },
              { name: 'Freestyle 7"', date: 'Ieri', status: 'Analizat', color: 'blue' },
              { name: 'Long Range 9"', date: 'Acum 2 zile', status: 'Completa', color: 'amber' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-all cursor-pointer">
                <div>
                  <p className="font-semibold text-white">{item.name}</p>
                  <p className="text-xs text-slate-500">{item.date}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold text-white bg-${item.color}-600/30 border border-${item.color}-500`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-linear-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>⚡</span>
            Acțiuni Rapide
          </h2>
          <div className="space-y-3">
            <button 
              onClick={handleNewConfig}
              className="w-full bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-3 rounded-xl transition-all hover:shadow-lg hover:shadow-blue-500/30 active:scale-95"
            >
              + Nouă Configurație
            </button>
            <button 
              onClick={() => navigate('/analytics')}
              className="w-full bg-linear-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-bold py-3 rounded-xl transition-all hover:shadow-lg hover:shadow-cyan-500/30 active:scale-95"
            >
              📊 Analiza Performanță
            </button>
            <button 
              onClick={() => alert('📥 Feature viitor')}
              className="w-full bg-linear-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold py-3 rounded-xl transition-all hover:shadow-lg hover:shadow-emerald-500/30 active:scale-95"
            >
              📥 Importă Date
            </button>
            <button 
              onClick={handleExport}
              className="w-full bg-linear-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold py-3 rounded-xl transition-all hover:shadow-lg hover:shadow-amber-500/30 active:scale-95"
            >
              💾 Exportă Raport
            </button>
          </div>
        </div>
      </div>

      <div className="bg-linear-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>📈</span>
          Activitate
        </h2>
        <div className="h-64 flex items-center justify-center bg-slate-900/50 rounded-lg border border-slate-700/50">
          <div className="text-center">
            <p className="text-slate-500 text-lg">Graficul de activitate</p>
            <p className="text-slate-600 text-sm mt-2">Conectare la API pentru date în timp real ✓</p>
          </div>
        </div>
      </div>
    </div>
  )
}