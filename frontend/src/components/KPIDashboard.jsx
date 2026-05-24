import { useEffect, useState } from 'react'
import { useAnalyticsContext } from '../context/AnalyticsContext'

export default function KPIDashboard() {
  const { selectedConfigId } = useAnalyticsContext()
  const [globalData, setGlobalData] = useState(null)
  const [configData, setConfigData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [selectedConfigId])

  const fetchData = async () => {
    setLoading(true)
    try {
      const globalRes = await fetch('http://localhost:8000/api/analytics')
      const globalData = await globalRes.json()
      setGlobalData(globalData)

      if (selectedConfigId) {
        const configRes = await fetch(`http://localhost:8000/api/configuration-analysis/${selectedConfigId}`)
        const configResp = await configRes.json()
        setConfigData(configResp.data)
      }
    } catch (error) {
      console.error('Error fetching KPI data:', error)
    } finally {
      setLoading(false)
    }
  }

  const data = selectedConfigId && configData ? configData : globalData

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 animate-pulse">
            <div className="h-4 bg-slate-700 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-slate-700 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    )
  }

  // Fallback: no data available
  if (!data) {
    return (
      <div className="bg-slate-800/30 rounded-xl p-8 border border-slate-700 text-center">
        <p className="text-slate-400">No data available</p>
      </div>
    )
  }

  const kpis = selectedConfigId && configData ? [
    {
      label: 'Max Thrust',
      value: (data.max_thrust || 0).toFixed(0),
      unit: 'g',
      icon: '⚡',
      color: 'from-yellow-600 to-yellow-700'
    },
    {
      label: 'T/W Ratio',
      value: (data.tw_ratio || 0).toFixed(1),
      unit: ':1',
      icon: '⚖️',
      color: 'from-purple-600 to-purple-700'
    },
    {
      label: 'Flight Time',
      value: (data.flight_time_min || 0).toFixed(1),
      unit: 'm',
      icon: '✈️',
      color: 'from-cyan-600 to-cyan-700'
    },
    {
      label: 'Max Speed',
      value: (data.max_speed_kmh || 0).toFixed(1),
      unit: 'km/h',
      icon: '🚀',
      color: 'from-red-600 to-red-700'
    },
    {
      label: 'Total Price',
      value: (data.total_price || 0).toFixed(0),
      unit: '$',
      icon: '💰',
      color: 'from-emerald-600 to-emerald-700'
    },
    {
      label: 'Total Weight',
      value: (data.total_weight_g || 0).toFixed(0),
      unit: 'g',
      icon: '⚙️',
      color: 'from-blue-600 to-blue-700'
    }
  ] : [
    {
      label: 'Total Configurations',
      value: data.total_configurations || 0,
      unit: 'builds',
      icon: '📊',
      color: 'from-blue-600 to-blue-700'
    },
    {
      label: 'Average Price',
      value: (data.average_price || 0).toFixed(0),
      unit: '$',
      icon: '💰',
      color: 'from-emerald-600 to-emerald-700'
    },
    {
      label: 'Avg T/W Ratio',
      value: (data.average_tw_ratio || 0).toFixed(1),
      unit: ':1',
      icon: '⚖️',
      color: 'from-purple-600 to-purple-700'
    },
    {
      label: 'Avg Flight Time',
      value: (data.average_flight_time || 0).toFixed(1),
      unit: 'm',
      icon: '✈️',
      color: 'from-cyan-600 to-cyan-700'
    },
    {
      label: 'Avg Max Speed',
      value: (data.average_max_speed || 0).toFixed(1),
      unit: 'km/h',
      icon: '🚀',
      color: 'from-red-600 to-red-700'
    },
    {
      label: 'Avg Motor Temp',
      value: (data.average_motor_temp || 45).toFixed(0),
      unit: '°C',
      icon: '🌡️',
      color: 'from-orange-600 to-orange-700'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {kpis.map((kpi, idx) => (
        <div
          key={idx}
          className={`bg-linear-to-br ${kpi.color} rounded-xl p-6 border border-slate-600/30 shadow-lg hover:shadow-xl transition`}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-slate-300 text-sm font-semibold uppercase tracking-widest mb-1">{kpi.label}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-white">{kpi.value}</span>
                <span className="text-sm text-slate-200">{kpi.unit}</span>
              </div>
            </div>
            <span className="text-3xl">{kpi.icon}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
