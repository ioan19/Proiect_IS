import { useEffect, useState } from 'react'
import { useAnalyticsContext } from '../context/AnalyticsContext'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function ThrustToWeightChart() {
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
        // Show placeholder for per-config view
        setData([])
      } else {
        // Fetch global distribution
        const res = await fetch('http://localhost:8000/api/analytics')
        const analytics = await res.json()
        const chartData = (analytics.tw_ratio_distribution || []).map(item => ({
          range: `${item.tw_bucket}:1`,
          count: item.count
        }))
        setData(chartData)
      }
    } catch (error) {
      console.error('Error fetching T/W data:', error)
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

  // Show placeholder for per-config view (this chart shows global data only)
  if (selectedConfigId) {
    return (
      <div className="w-full h-80 bg-slate-800/30 rounded-xl border border-slate-700 p-4 flex items-center justify-center">
        <p className="text-slate-400">Distribution charts are global only</p>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-80 bg-slate-800/30 rounded-xl border border-slate-700 flex items-center justify-center">
        <p className="text-slate-500">No data available</p>
      </div>
    )
  }

  return (
    <div className="w-full h-80 bg-slate-800/30 rounded-xl border border-slate-700 p-4">
      <h3 className="text-lg font-bold text-white mb-4">T/W Ratio Distribution</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="range" stroke="#94a3b8" style={{ fontSize: '12px' }} />
          <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
            labelStyle={{ color: '#e2e8f0' }}
          />
          <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
