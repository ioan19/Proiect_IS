import { useState } from 'react'

export default function App() {
  const [req, setReq] = useState({
    frame_size_inches: 5.0,
    payload_weight_g: 150,
    battery_cells: 6,
    video_protocol: 'DJI',
    radio_protocol: 'ELRS'
  })
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleOptimize = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req)
      });
      const data = await res.json();
      setResults(data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  return (
    <div className="flex min-h-screen bg-[#0f172a] text-slate-200 font-sans">
      {/* SIDEBAR DE CONTROL */}
      <aside className="w-80 bg-[#1e293b] border-r border-slate-700 p-6 flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-black text-blue-500 mb-1">DroneMetrics</h1>
          <p className="text-xs text-slate-500 uppercase tracking-widest">Configurator V1.0</p>
        </div>

        <form onSubmit={handleOptimize} className="flex flex-col gap-5">
          <section className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-400 mb-2 block uppercase">Platformă</label>
              <select className="w-full bg-[#0f172a] border border-slate-600 rounded-lg p-2.5 outline-none focus:border-blue-500 transition-all"
                value={req.frame_size_inches} onChange={e => setReq({...req, frame_size_inches: e.target.value})}>
                <option value="3.5">3.5" (Cinewhoop)</option>
                <option value="5.0">5.0" (Freestyle)</option>
                <option value="7.0">7.0" (Long Range)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 mb-2 block uppercase">Sursă Energie</label>
              <select className="w-full bg-[#0f172a] border border-slate-600 rounded-lg p-2.5 outline-none focus:border-blue-500"
                value={req.battery_cells} onChange={e => setReq({...req, battery_cells: e.target.value})}>
                <option value="4">4S Lipo</option>
                <option value="6">6S Lipo</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 mb-2 block uppercase">Video System</label>
              <select className="w-full bg-[#0f172a] border border-slate-600 rounded-lg p-2.5 outline-none focus:border-blue-500"
                value={req.video_protocol} onChange={e => setReq({...req, video_protocol: e.target.value})}>
                <option value="DJI">DJI (Digital HD)</option>
                <option value="Analog">Analog (Low Latency)</option>
                <option value="Walksnail">Walksnail (HD)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 mb-2 block uppercase">Radio Link</label>
              <select className="w-full bg-[#0f172a] border border-slate-600 rounded-lg p-2.5 outline-none focus:border-blue-500"
                value={req.radio_protocol} onChange={e => setReq({...req, radio_protocol: e.target.value})}>
                <option value="ELRS">ExpressLRS 2.4G</option>
                <option value="Crossfire">TBS Crossfire</option>
              </select>
            </div>
          </section>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl font-bold shadow-lg shadow-blue-900/40 transition-all active:scale-95">
            {loading ? "Calculând..." : "Generează Build"}
          </button>
        </form>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-8 overflow-y-auto">
        {!results ? (
          <div className="h-full flex flex-col items-center justify-center opacity-30 text-center">
            <span className="text-8xl mb-4">🛸</span>
            <p className="text-xl font-medium">Configurează parametrii în stânga<br/>pentru a vedea cele mai bune piese.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {results.map((c, i) => (
              <div key={i} className="bg-[#1e293b] rounded-2xl overflow-hidden border border-slate-700 hover:shadow-2xl hover:shadow-blue-500/5 transition-all">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex flex-wrap gap-2">
                      {c.tags.map(t => (
                        <span key={t} className="px-2 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-black rounded border border-blue-500/20 uppercase tracking-tighter">{t}</span>
                      ))}
                    </div>
                    <span className="text-2xl font-black text-white">${c.total_price}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                    <div className="bg-[#0f172a] p-3 rounded-lg border border-slate-700/50">
                      <p className="text-slate-500 text-[10px] uppercase mb-1">Propulsie</p>
                      <p className="font-bold truncate">{c.motor_name}</p>
                      <p className="text-xs text-slate-400">{c.prop_name}</p>
                    </div>
                    <div className="bg-[#0f172a] p-3 rounded-lg border border-slate-700/50">
                      <p className="text-slate-500 text-[10px] uppercase mb-1">Electronics</p>
                      <p className="font-bold truncate">{c.esc_name}</p>
                      <p className="text-xs text-blue-400">{c.video_name}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-4 border-y border-slate-700/50">
                    <div className="text-center">
                      <p className="text-[10px] text-slate-500 uppercase">Greutate AUW</p>
                      <p className="text-lg font-bold">{c.total_weight_auw}g</p>
                    </div>
                    <div className="text-center border-x border-slate-700/50">
                      <p className="text-[10px] text-slate-500 uppercase">T/W Ratio</p>
                      <p className={`text-lg font-bold ${c.tw_ratio > 5 ? 'text-orange-400' : 'text-emerald-400'}`}>{c.tw_ratio}:1</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-slate-500 uppercase">Eficiență</p>
                      <p className="text-lg font-bold text-blue-400">{c.efficiency_50_gw}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}