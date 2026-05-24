import { useEffect, useState } from 'react'
import { useAnalyticsContext } from '../context/AnalyticsContext'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function FlightTimeChart() {
  const { selectedConfigId } = useAnalyticsContext()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  // Re-fetch when selectedConfigId changes
  useEffect(() => {
    fetchData()
  }, [selectedConfigId])

  const fetchData = async () => {
    setLoading(true)
    try {
      if (selectedConfigId) {
        // Fetch per-config data
        const res = await fetch(`http://localhost:8000/api/configuration-analysis/${selectedConfigId}`)
        const response = await res.json()
        const configData = response.data
        setData([{
          name: configData.name?.substring(0, 10) || 'Config',
          'Flight Time': configData.flight_time_min || 0
        }])
      } else {
        // Fetch all configs for global view
        const res = await fetch('http://localhost:8000/api/configurations?limit=50')
        const response = await res.json()
        const configs = response.data || []
        const chartData = configs.map((c, idx) => ({
          name: c.name?.substring(0, 10) || `Config ${idx}`,
          'Flight Time': c.flight_time_min || 0
        }))
        setData(chartData)
      }
    } catch (error) {
      console.error('Error fetching flight time data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="w-full h-80 bg-slate-800/30 rounded-xl border border-slate-700 flex items-center justify-center">
        <p className="text-slate-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="w-full h-80 bg-slate-800/30 rounded-xl border border-slate-700 p-4">
      <h3 className="text-lg font-bold text-white mb-4">Estimated Flight Time</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: '12px' }} />
          <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
            labelStyle={{ color: '#e2e8f0' }}
          />
          <Line type="monotone" dataKey="Flight Time" stroke="#06b6d4" dot={false} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
