import { useState } from 'react'

export default function Configurator() {
  const [req, setReq] = useState({
    frame_size_inches: '5.0',
    payload_weight_g: 150,
    battery_cells: '6',
    video_protocol: 'DJI',
    radio_protocol: 'ELRS'
  })
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedConfig, setSelectedConfig] = useState(null)
  const [saving, setSaving] = useState(false)

  const handleOptimize = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...req,
          frame_size_inches: parseFloat(req.frame_size_inches),
          payload_weight_g: parseInt(req.payload_weight_g),
          battery_cells: parseInt(req.battery_cells)
        })
      });
      const data = await res.json();
      setResults(data.data || []);
      setSelectedConfig(null);
    } catch (err) {
      alert('❌ Eroare: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleSaveConfig = async (config) => {
    setSaving(true);
    try {
      const res = await fetch('http://localhost:8000/api/save-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: config.name,
          config_data: config,
          notes: `Frame: ${req.frame_size_inches}", Battery: ${req.battery_cells}S`
        })
      });
      const data = await res.json();
      alert(`✅ Salvat! ID: ${data.id}`);
    } catch (err) {
      alert('❌ Eroare salvare');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-black text-white">Configurator Drone</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-linear-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700 sticky top-24">
            <form onSubmit={handleOptimize} className="space-y-5">
              {/* Form inputs go here (unchanged logic) */}
              <div>
                <label className="text-xs font-bold text-slate-400 mb-2 block uppercase">Platformă</label>
                <select className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-3 text-white" value={req.frame_size_inches} onChange={e => setReq({...req, frame_size_inches: e.target.value})}>
                  <option value="3.5">3.5"</option>
                  <option value="5.0">5.0"</option>
                  <option value="7.0">7.0"</option>
                </select>
              </div>
              {/* ... Other inputs ... */}
              <button type="submit" disabled={loading} className="w-full bg-linear-to-r from-blue-600 to-blue-500 text-white font-bold py-3 rounded-xl transition-all active:scale-95">
                {loading ? '⏳ Calculând...' : '🚀 Generează Build'}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          {!results ? (
            <div className="bg-linear-to-br from-slate-800 to-slate-900 rounded-2xl p-12 border border-slate-700 flex flex-col items-center justify-center min-h-96">
              <span className="text-8xl mb-4">🛸</span>
              <p className="text-slate-300 text-center">Configurează parametrii pentru a vedea cele mai bune piese.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {results.map((config, idx) => (
                <div key={idx} className="bg-linear-to-br from-slate-800 to-slate-900 rounded-2xl overflow-hidden border border-slate-700 hover:border-slate-600 transition-all p-6">
                  <h3 className="text-xl font-black text-white mb-4">{config.name}</h3>
                  <div className="flex justify-between items-center pt-4 border-t border-slate-700">
                    <p className="text-2xl font-black text-emerald-400">${config.total_price}</p>
                    <button onClick={() => handleSaveConfig(config)} disabled={saving} className="bg-green-600 px-4 py-2 rounded-lg text-white font-bold">
                      {saving ? '...' : '💾 Salvează'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}