import { useState, useEffect } from 'react'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalConfigs: 0,
    avgPrice: 0,
    avgTwRatio: 0,
    performanceScore: 0
  })

  // Load analytics data on component mount
  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/analytics')
      const data = await response.json()
      setStats({
        totalConfigs: data.total_configurations || 0,
        avgPrice: data.average_price || 0,
        avgTwRatio: data.average_tw_ratio || 0,
        performanceScore: data.performance_score || 0
      })
    } catch (error) {
      console.error('Error fetching analytics:', error)
    }
  }

  const handleNewConfiguration = () => {
    window.location.href = '/configurator'
  }

  const handlePerformanceAnalysis = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/analytics')
      const data = await response.json()
      alert(`Analiză Performanță:\nTotal Configurări: ${data.total_configurations}\nPreț Mediu: $${data.average_price}\nT/W Ratio Mediu: ${data.average_tw_ratio}:1\nScore Performanță: ${data.performance_score}%`)
    } catch (error) {
      alert('Eroare la încărcarea analizei')
    }
  }

  const handleImportData = () => {
    alert('Funcționalitate import în dezvoltare')
  }

  const handleExportReport = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/export')
      const data = await response.json()
      
      // Create and download CSV file
      const blob = new Blob([data.csv], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'dronemetrics_export.csv'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      alert('Raport exportat cu succes!')
    } catch (error) {
      alert('Eroare la exportarea raportului')
    }
  }

  const statsData = [
    {
      title: 'Total Configurări',
      value: stats.totalConfigs.toString(),
      icon: '⚙️',
      color: 'from-blue-600 to-blue-400',
      subtext: 'În baza de date'
    },
    {
      title: 'Preț Mediu',
      value: `$${stats.avgPrice.toFixed(2)}`,
      icon: '💰',
      color: 'from-green-600 to-green-400',
      subtext: 'Per configurație'
    },
    {
      title: 'T/W Ratio Mediu',
      value: `${stats.avgTwRatio.toFixed(1)}:1`,
      icon: '📊',
      color: 'from-purple-600 to-purple-400',
      subtext: 'Raport thrust/weight'
    },
    {
      title: 'Performanță',
      value: `${stats.performanceScore.toFixed(1)}%`,
      icon: '🚀',
      color: 'from-orange-600 to-orange-400',
      subtext: 'Score general'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black text-white mb-2">Tablou de Bord</h1>
        <p className="text-slate-400 text-lg">Bienvenit la DroneMetrics - gestionează-ți flota de drone</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, idx) => (
          <div
            key={idx}
            className="group bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700 hover:border-slate-600 transition-all hover:shadow-2xl hover:shadow-slate-800/50 cursor-pointer"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`text-4xl bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`}>
                {stat.icon}
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-slate-700/50 transition-all">
                <span className="text-xl">→</span>
              </div>
            </div>
            <p className="text-slate-400 text-sm font-semibold uppercase tracking-wide mb-2">
              {stat.title}
            </p>
            <p className="text-3xl font-black text-white mb-2">
              {stat.value}
            </p>
            <p className="text-xs text-slate-500">
              {stat.subtext}
            </p>
          </div>
        ))}
      </div>

      {/* Main Content Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Configurations */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700">
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

        {/* Quick Actions */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>⚡</span>
            Acțiuni Rapide
          </h2>
          <div className="space-y-3">
            <button onClick={handleNewConfiguration} className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-3 rounded-xl transition-all hover:shadow-lg hover:shadow-blue-500/30 active:scale-95">
              + Nouă Configurație
            </button>
            <button onClick={handlePerformanceAnalysis} className="w-full bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-bold py-3 rounded-xl transition-all hover:shadow-lg hover:shadow-cyan-500/30 active:scale-95">
              📊 Analiza Performanță
            </button>
            <button onClick={handleImportData} className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold py-3 rounded-xl transition-all hover:shadow-lg hover:shadow-emerald-500/30 active:scale-95">
              📥 Importă Date
            </button>
            <button onClick={handleExportReport} className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold py-3 rounded-xl transition-all hover:shadow-lg hover:shadow-amber-500/30 active:scale-95">
              💾 Exportă Raport
            </button>
          </div>
        </div>
      </div>

      {/* Activity Chart Placeholder */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>📈</span>
          Activitate
        </h2>
        <div className="h-64 flex items-center justify-center bg-slate-900/50 rounded-lg border border-slate-700/50">
          <div className="text-center">
            <p className="text-slate-500 text-lg">Graficul de activitate va apărea aici</p>
            <p className="text-slate-600 text-sm mt-2">Conectare la API pentru date în timp real</p>
          </div>
        </div>
      </div>
    </div>
  )
}
