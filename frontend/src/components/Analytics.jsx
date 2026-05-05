import { useState, useEffect } from 'react'

export default function Analytics() {
  const [data, setData] = useState({
    success_rate: 95,
    avg_response_time: 2.3,
    errors: 2,
    active_users: 12,
    total_configs: 0,
    avg_price: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/analytics')
      const analytics = await res.json()
      setData(prev => ({
        ...prev,
        ...analytics
      }))
    } catch (err) {
      console.error('Analytics error:', err)
    } finally {
      setLoading(false)
    }
  }

  const performanceData = [
    { metric: 'Rata Succes', value: data.success_rate + '%', trend: '↑ +5%', color: 'text-green-400' },
    { metric: 'Timp Răspuns', value: data.avg_response_time + 's', trend: '↓ -0.2s', color: 'text-blue-400' },
    { metric: 'Erori', value: data.errors, trend: '↓ -1', color: 'text-red-400' },
    { metric: 'Utilizatori', value: data.active_users, trend: '↑ +3', color: 'text-purple-400' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black text-white mb-2">Analize și Rapoarte</h1>
        <p className="text-slate-400 text-lg">Performanța și statistici detaliate</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {performanceData.map((item, idx) => (
          <div key={idx} className="bg-linear-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700 hover:border-slate-600 transition-all">
            <p className="text-slate-400 text-sm font-semibold uppercase mb-2">{item.metric}</p>
            <div className="flex justify-between items-start">
              <p className={`text-3xl font-black ${item.color}`}>{loading ? '...' : item.value}</p>
              <span className="text-emerald-400 text-sm font-bold">{item.trend}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-linear-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700">
          <h2 className="text-2xl font-bold text-white mb-6">Configurații</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-slate-700/30 rounded-lg">
              <p className="text-slate-300">Total Generate</p>
              <p className="text-2xl font-black text-blue-400">{loading ? '...' : data.total_configs}</p>
            </div>
            <div className="flex justify-between items-center p-4 bg-slate-700/30 rounded-lg">
              <p className="text-slate-300">Preț Mediu</p>
              <p className="text-2xl font-black text-emerald-400">${loading ? '...' : data.avg_price.toFixed(0)}</p>
            </div>
            <div className="flex justify-between items-center p-4 bg-slate-700/30 rounded-lg">
              <p className="text-slate-300">Stare Sistem</p>
              <p className="flex items-center gap-2">
                <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
                <span className="font-bold text-green-400">Online</span>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-linear-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700">
          <h2 className="text-2xl font-bold text-white mb-6">Tipuri Performanță</h2>
          <div className="space-y-3">
            <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
              <div className="flex justify-between items-center">
                <p className="text-orange-300 font-bold">Racing/Freestyle ⚡</p>
                <p className="text-2xl font-black text-orange-400">5.2:1</p>
              </div>
              <p className="text-xs text-orange-200 mt-2">T/W Ratio optim pentru acrobații</p>
            </div>
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex justify-between items-center">
                <p className="text-blue-300 font-bold">Cinematic/LongRange 📹</p>
                <p className="text-2xl font-black text-blue-400">3.8:1</p>
              </div>
              <p className="text-xs text-blue-200 mt-2">Echilibru între stabilitate și viteză</p>
            </div>
            <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <div className="flex justify-between items-center">
                <p className="text-purple-300 font-bold">Heavy Lifter 🏗️</p>
                <p className="text-2xl font-black text-purple-400">2.1:1</p>
              </div>
              <p className="text-xs text-purple-200 mt-2">Maxim de ridicare și stabilitate</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-linear-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700">
        <h2 className="text-2xl font-bold text-white mb-6">Grafic Activitate</h2>
        <div className="h-80 flex items-end justify-around gap-2 bg-slate-900/50 rounded-lg border border-slate-700/50 p-8">
          {[...Array(12)].map((_, i) => {
            const height = Math.floor(Math.random() * 80) + 20;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className="w-full bg-linear-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all hover:from-blue-500 hover:to-blue-300 cursor-pointer"
                  style={{ height: height + '%' }}
                ></div>
                <p className="text-xs text-slate-500">M{i + 1}</p>
              </div>
            );
          })}
        </div>
        <p className="text-slate-400 text-sm mt-4 text-center">Utilizări de configurator în ultimele 12 luni</p>
      </div>
    </div>
  )
}