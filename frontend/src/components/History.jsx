import { useState, useEffect } from 'react'

export default function History() {
  const [historyItems, setHistoryItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/configurations')
      const data = await response.json()
      setHistoryItems(data.data || [])
    } catch (error) {
      console.error('Error fetching history:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-black text-white mb-2">Istoric Configurări</h1>
          <p className="text-slate-400 text-lg">Se încarcă...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black text-white mb-2">Istoric Configurări</h1>
        <p className="text-slate-400 text-lg">Vizualizează toate configurațiile anterioare ({historyItems.length})</p>
      </div>

      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-900/50">
              <th className="px-6 py-4 text-left text-sm font-bold text-slate-400 uppercase">Data</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-slate-400 uppercase">Configurație</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-slate-400 uppercase">Status</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-slate-400 uppercase">Preț</th>
              <th className="px-6 py-4 text-center text-sm font-bold text-slate-400 uppercase">Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {historyItems.map((item, idx) => (
              <tr key={item.id || idx} className="border-b border-slate-700 hover:bg-slate-800/50 transition-all">
                <td className="px-6 py-4 text-sm text-slate-300">
                  {new Date(item.created_at).toLocaleDateString('ro-RO')}
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-white">
                  {item.name}
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-green-500/20 text-green-300 text-xs font-bold rounded-full border border-green-500/30">
                    Completat
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-400">
                  ${item.total_price}
                </td>
                <td className="px-6 py-4 text-center">
                  <button className="text-blue-400 hover:text-blue-300 transition-all">Verifica</button>
                </td>
              </tr>
            ))}
            {historyItems.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                  Nicio configurație salvată încă
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
