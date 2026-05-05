import { useState, useEffect } from 'react'

export default function History() {
  const [historyItems, setHistoryItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSavedConfigs()
  }, [])

  const fetchSavedConfigs = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/saved-configs')
      const data = await res.json()
      setHistoryItems(data.data || [])
    } catch (err) {
      console.error('Error fetching configs:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('ro-RO')
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black text-white mb-2">Istoric Configurări</h1>
        <p className="text-slate-400 text-lg">Vizualizează toate configurațiile anterioare</p>
      </div>

      <div className="bg-linear-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-900/50">
              <th className="px-6 py-4 text-left text-sm font-bold text-slate-400 uppercase">ID</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-slate-400 uppercase">Configurație</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-slate-400 uppercase">Data</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-slate-400 uppercase">Note</th>
              <th className="px-6 py-4 text-center text-sm font-bold text-slate-400 uppercase">Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-slate-400">Se încarcă... ⏳</td>
              </tr>
            ) : historyItems.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-slate-400">
                  Nu sunt configurații salvate. <br/>Salvează prima configurație din Configurator! 🚀
                </td>
              </tr>
            ) : (
              historyItems.map((item) => (
                <tr key={item.id} className="border-b border-slate-700 hover:bg-slate-800/50 transition-all">
                  <td className="px-6 py-4 text-sm text-slate-300">#{item.id}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-white">{item.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-400">{formatDate(item.created_at)}</td>
                  <td className="px-6 py-4 text-sm text-slate-500 truncate">{item.notes || '-'}</td>
                  <td className="px-6 py-4 text-center">
                    <button className="text-blue-400 hover:text-blue-300 transition-all font-medium">Detalii</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {historyItems.length > 0 && (
        <div className="bg-linear-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700">
          <h2 className="text-lg font-bold text-white mb-4">Statistici</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-700/30 rounded-lg p-4">
              <p className="text-slate-400 text-sm mb-2">Total Configurații</p>
              <p className="text-2xl font-black text-blue-400">{historyItems.length}</p>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-4">
              <p className="text-slate-400 text-sm mb-2">Ultimă Actualizare</p>
              <p className="text-lg font-bold text-white">{formatDate(historyItems[0].created_at)}</p>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-4">
              <p className="text-slate-400 text-sm mb-2">Status</p>
              <p className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                <span className="text-green-400 font-bold">Activ</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}