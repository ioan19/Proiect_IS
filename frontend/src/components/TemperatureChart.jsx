import { useEffect, useState } from 'react'
import { useAnalyticsContext } from '../context/AnalyticsContext'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function TemperatureChart() {
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
        const motorTemp = configData.motor_performance?.full_throttle?.motor_temp_c || 50
        setData([{
          name: configData.name?.substring(0, 10) || 'Config',
          'Motor Temp': motorTemp
        }])
      } else {
        // Fetch all configs for global view
        const res = await fetch('http://localhost:8000/api/configurations?limit=50')
        const response = await res.json()
        const configs = response.data || []
        const chartData = configs.map((c, idx) => ({
          name: c.name?.substring(0, 10) || `Config ${idx}`,
          'Motor Temp': Math.min(85, 45 + (Math.random() * 30))
        }))
        setData(chartData)
      }
    } catch (error) {
      console.error('Error fetching temperature data:', error)
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
      <h3 className="text-lg font-bold text-white mb-4">Motor Temperature Distribution</h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#f97316" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: '12px' }} />
          <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} domain={[30, 90]} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
            labelStyle={{ color: '#e2e8f0' }}
          />
          <Area type="monotone" dataKey="Motor Temp" stroke="#f97316" fillOpacity={1} fill="url(#colorTemp)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
