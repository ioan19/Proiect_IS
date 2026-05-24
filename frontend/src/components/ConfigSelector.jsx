// frontend/src/components/ConfigSelector.jsx
import { useState, useEffect } from 'react'
import { useAnalyticsContext } from '../context/AnalyticsContext'

export default function ConfigSelector() {
  const [configs, setConfigs] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { selectedConfigId, setSelectedConfigId } = useAnalyticsContext()
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchConfigs()
  }, [])

  const fetchConfigs = async () => {
    setLoading(true)
    try {
      const res = await fetch('http://localhost:8000/api/configurations?limit=100')
      const data = await res.json()
      setConfigs(data.data || [])
    } catch (error) {
      console.error('Error fetching configs:', error)
    } finally {
      setLoading(false)
    }
  }

  // FIX 1 & 2: Safely convert both sides to strings to prevent type mismatch bugs (e.g., number vs string ID)
  const selectedConfig = configs.find(c => String(c.id) === String(selectedConfigId))
  const filteredConfigs = configs.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="relative w-full max-w-md">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-left text-slate-200 hover:bg-slate-700 transition flex items-center justify-between"
      >
        <span className="truncate">
          {selectedConfig ? selectedConfig.name : 'Select Configuration'}
        </span>
        <span className={`transition ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-50">
          <div className="p-3 border-b border-slate-700">
            <input
              type="text"
              placeholder="Search configs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="max-h-60 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-slate-400 text-sm">Loading...</div>
            ) : filteredConfigs.length === 0 ? (
              <div className="p-4 text-center text-slate-400 text-sm">No configurations found</div>
            ) : (
              filteredConfigs.map(config => (
                <button
                  key={config.id}
                  onClick={() => {
                    // Properly updates the state holding the selectedConfig via Context
                    setSelectedConfigId(config.id)
                    setIsOpen(false)
                    setSearchTerm('')
                  }}
                  className={`w-full text-left px-4 py-3 border-b border-slate-700 last:border-b-0 hover:bg-slate-700/50 transition ${
                    selectedConfigId === config.id ? 'bg-blue-900/30 text-blue-300' : 'text-slate-300'
                  }`}
                >
                  <div className="font-semibold">{config.name}</div>
                  <div className="text-xs text-slate-500 mt-1">
                    T/W: {config.tw_ratio}:1 | Flight: {config.flight_time_min}m | ${config.total_price}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}