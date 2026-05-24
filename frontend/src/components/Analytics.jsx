import { useState, useEffect } from 'react'
import { useAnalyticsContext } from '../context/AnalyticsContext'
import ConfigSelector from './ConfigSelector'
import KPIDashboard from './KPIDashboard'
import ThrustChart from './ThrustChart'
import FlightTimeChart from './FlightTimeChart'
import TemperatureChart from './TemperatureChart'
import DroneTrendChart from './DroneTrendChart'
import ThrustToWeightChart from './ThrustToWeightChart'

export default function Analytics() {
  const { viewMode, setViewMode, selectedConfigId } = useAnalyticsContext()
  const [analyticsData, setAnalyticsData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/analytics')
      const data = await res.json()
      setAnalyticsData(data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-black text-white mb-2">Analysis & Reports</h1>
          <p className="text-slate-400 text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-4xl font-black text-white mb-2">Analysis & Reports</h1>
          <p className="text-slate-400 text-lg">
            {selectedConfigId ? 'Per-Configuration Performance Metrics' : 'Global Analytics Dashboard'}
          </p>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <ConfigSelector />
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('overview')}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                viewMode === 'overview'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setViewMode('detailed')}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                viewMode === 'detailed'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Detailed Analysis
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'overview' && (
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Key Performance Indicators</h2>
            <KPIDashboard />
          </div>
        </div>
      )}

      {viewMode === 'detailed' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ThrustChart />
            <FlightTimeChart />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TemperatureChart />
            <DroneTrendChart />
          </div>

          <div className="w-full">
            <ThrustToWeightChart />
          </div>
        </div>
      )}
    </div>
  )
}
