import { useState } from 'react'

export default function Configurator() {
  const [req, setReq] = useState({
    drone_type: 'quad',
    frame_size_inches: 5.0,
    payload_weight_g: 150,
    battery_capacity_mah: 1300,
    battery_cells: 4,
    video_protocol: 'DJI',
    radio_protocol: 'ELRS',
    desired_speed_kmh: null,
    desired_flight_time_min: null
  })
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)

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
    } catch (err) {
      console.error(err);
      alert('Error during optimization: ' + err.message);
    }
    finally {
      setLoading(false);
    }
  }

  const handleSaveConfiguration = async (config) => {
    setSaveLoading(true)
    try {
      const saveData = {
        name: `${config.motor_name} + ${config.prop_name} (${req.drone_type})`,
        drone_type: req.drone_type,
        frame_size_inches: parseFloat(req.frame_size_inches),
        payload_weight_g: req.payload_weight_g,
        battery_capacity_mah: req.battery_capacity_mah,
        battery_cells: parseInt(req.battery_cells),
        video_protocol: req.video_protocol,
        radio_protocol: req.radio_protocol,
        motor_name: config.motor_name,
        motor_kv: config.motor_kv,
        prop_name: config.prop_name,
        prop_diameter: config.prop_diameter,
        esc_name: config.esc_name,
        frame_name: config.frame_name,
        total_price: config.total_price,
        total_weight_g: config.total_weight_g,
        tw_ratio: config.tw_ratio,
        flight_time_min: config.flight_time_min
      }

      const response = await fetch('http://localhost:8000/api/configurations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saveData)
      })

      if (response.ok) {
        alert('Configuration saved successfully!')
      } else {
        const errorText = await response.text()
        console.error('Save failed:', errorText)
        alert('Error saving configuration: ' + errorText)
      }
    } catch (error) {
      console.error('Error saving configuration:', error)
      alert('Error saving configuration')
    } finally {
      setSaveLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black text-white mb-2">Configurator Drone</h1>
        <p className="text-slate-400 text-lg">Optimizează configurația ta perfect</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Configuration Panel */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700 sticky top-24">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span>⚙️</span>
              Setări
            </h2>

            <form onSubmit={handleOptimize} className="space-y-5 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Drone Type */}
              <div>
                <label className="text-xs font-bold text-slate-400 mb-2 block uppercase tracking-wider">
                  Drone Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['quad', 'hexa', 'octa'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setReq({...req, drone_type: type})}
                      className={`py-2 px-3 rounded-lg font-bold uppercase text-xs transition-all ${
                        req.drone_type === type
                          ? 'bg-blue-600 text-white border border-blue-500'
                          : 'bg-slate-700/50 text-slate-300 border border-slate-600 hover:border-slate-500'
                      }`}
                    >
                      {type === 'quad' ? '4x' : type === 'hexa' ? '6x' : '8x'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Frame Size - Text Input */}
              <div>
                <label className="text-xs font-bold text-slate-400 mb-2 block uppercase tracking-wider">
                  Frame Size (inches)
                </label>
                <input
                  type="number"
                  step="0.1"
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-white"
                  value={req.frame_size_inches}
                  onChange={e => setReq({...req, frame_size_inches: parseFloat(e.target.value) || 0})}
                  placeholder="e.g., 5.0"
                />
                <p className="text-xs text-slate-500 mt-1">Common: 3.5, 5.0, 7.0</p>
              </div>

              {/* Payload Weight */}
              <div>
                <label className="text-xs font-bold text-slate-400 mb-2 block uppercase tracking-wider">
                  Payload Weight (g)
                </label>
                <input
                  type="number"
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-white"
                  value={req.payload_weight_g}
                  onChange={e => setReq({...req, payload_weight_g: parseInt(e.target.value) || 0})}
                  placeholder="e.g., 150"
                />
              </div>

              {/* Battery Capacity */}
              <div>
                <label className="text-xs font-bold text-slate-400 mb-2 block uppercase tracking-wider">
                  Battery Capacity (mAh)
                </label>
                <input
                  type="number"
                  step="50"
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-white"
                  value={req.battery_capacity_mah}
                  onChange={e => setReq({...req, battery_capacity_mah: parseInt(e.target.value) || 0})}
                  placeholder="e.g., 1300"
                />
              </div>

              {/* Battery Cells */}
              <div>
                <label className="text-xs font-bold text-slate-400 mb-2 block uppercase tracking-wider">
                  Battery Cells
                </label>
                <select
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-white"
                  value={req.battery_cells}
                  onChange={e => setReq({...req, battery_cells: parseInt(e.target.value)})}
                >
                  <option value={3}>3S LiPo (11.1V)</option>
                  <option value={4}>4S LiPo (14.8V)</option>
                  <option value={5}>5S LiPo (18.5V)</option>
                  <option value={6}>6S LiPo (22.2V)</option>
                </select>
              </div>

              {/* Video Protocol */}
              <div>
                <label className="text-xs font-bold text-slate-400 mb-2 block uppercase tracking-wider">
                  Video System
                </label>
                <select
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-white"
                  value={req.video_protocol}
                  onChange={e => setReq({...req, video_protocol: e.target.value})}
                >
                  <option value="DJI">DJI (Digital HD)</option>
                  <option value="Analog">Analog (Low Latency)</option>
                  <option value="Walksnail">Walksnail (HD)</option>
                </select>
              </div>

              {/* Radio Link */}
              <div>
                <label className="text-xs font-bold text-slate-400 mb-2 block uppercase tracking-wider">
                  Radio Link
                </label>
                <select
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-white"
                  value={req.radio_protocol}
                  onChange={e => setReq({...req, radio_protocol: e.target.value})}
                >
                  <option value="ELRS">ExpressLRS 2.4G</option>
                  <option value="Crossfire">TBS Crossfire</option>
                </select>
              </div>

              {/* Desired Speed */}
              <div>
                <label className="text-xs font-bold text-slate-400 mb-2 block uppercase tracking-wider">
                  Target Speed (km/h) - Optional
                </label>
                <input
                  type="number"
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-white"
                  value={req.desired_speed_kmh || ''}
                  onChange={e => setReq({...req, desired_speed_kmh: e.target.value ? parseFloat(e.target.value) : null})}
                  placeholder="Leave empty for any speed"
                />
              </div>

              {/* Desired Flight Time */}
              <div>
                <label className="text-xs font-bold text-slate-400 mb-2 block uppercase tracking-wider">
                  Target Flight Time (min) - Optional
                </label>
                <input
                  type="number"
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-white"
                  value={req.desired_flight_time_min || ''}
                  onChange={e => setReq({...req, desired_flight_time_min: e.target.value ? parseFloat(e.target.value) : null})}
                  placeholder="Leave empty for any duration"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:from-slate-600 disabled:to-slate-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-900/40 hover:shadow-xl hover:shadow-blue-600/40 transition-all active:scale-95 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                {loading ? '⏳ Optimizing...' : '🚀 Generate Build'}
              </button>
            </form>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2">
          {!results ? (
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-12 border border-slate-700 flex flex-col items-center justify-center min-h-96">
              <span className="text-8xl mb-4">🛸</span>
              <p className="text-xl font-semibold text-slate-300 text-center">
                Configure parameters on the left
                <br />
                to see optimized drone configurations.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {results.map((config, idx) => (
                <div
                  key={idx}
                  className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl overflow-hidden border border-slate-700 hover:border-slate-600 hover:shadow-2xl hover:shadow-blue-500/10 transition-all"
                >
                  <div className="p-6">
                    {/* Header with Tags */}
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex flex-wrap gap-2">
                        {config.tags?.map(tag => (
                          <span
                            key={tag}
                            className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-black rounded-full border border-blue-500/30 uppercase tracking-wider"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Score</p>
                        <p className="text-3xl font-black text-blue-400">{config.optimization_score}%</p>
                      </div>
                    </div>

                    {/* Main Info */}
                    <h3 className="text-xl font-black text-white mb-4">{config.name}</h3>

                    {/* Industrial Metrics Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
                      <div className="text-center">
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">T/W Ratio</p>
                        <p className="text-lg font-black text-emerald-400">{config.tw_ratio}:1</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Flight Time</p>
                        <p className="text-lg font-black text-yellow-400">{config.flight_time_min}m</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Max Speed</p>
                        <p className="text-lg font-black text-purple-400">{config.max_speed_kmh}km/h</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Altitude</p>
                        <p className="text-lg font-black text-cyan-400">{config.max_altitude_m}m</p>
                      </div>
                    </div>

                    {/* Advanced Metrics */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6 text-xs">
                      <div className="bg-slate-700/20 p-3 rounded-lg border border-slate-600/50">
                        <p className="text-slate-500 uppercase mb-1 font-bold">Total Weight</p>
                        <p className="text-white font-bold">{config.total_weight_g}g</p>
                      </div>
                      <div className="bg-slate-700/20 p-3 rounded-lg border border-slate-600/50">
                        <p className="text-slate-500 uppercase mb-1 font-bold">Total Thrust</p>
                        <p className="text-white font-bold">{config.total_thrust_g}g</p>
                      </div>
                      <div className="bg-slate-700/20 p-3 rounded-lg border border-slate-600/50">
                        <p className="text-slate-500 uppercase mb-1 font-bold">Disk Loading</p>
                        <p className="text-white font-bold">{config.disk_loading}g/cm²</p>
                      </div>
                      <div className="bg-slate-700/20 p-3 rounded-lg border border-slate-600/50">
                        <p className="text-slate-500 uppercase mb-1 font-bold">Power Draw</p>
                        <p className="text-white font-bold">{config.power_consumption_w}W</p>
                      </div>
                      <div className="bg-slate-700/20 p-3 rounded-lg border border-slate-600/50">
                        <p className="text-slate-500 uppercase mb-1 font-bold">Efficiency</p>
                        <p className="text-white font-bold">{config.efficiency_score}pts</p>
                      </div>
                      <div className="bg-slate-700/20 p-3 rounded-lg border border-slate-600/50">
                        <p className="text-slate-500 uppercase mb-1 font-bold">Motor KV</p>
                        <p className="text-white font-bold">{config.motor_kv}</p>
                      </div>
                    </div>

                    {/* Components Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                      {config.components?.map((comp, compIdx) => (
                        <div key={compIdx} className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/50">
                          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1 font-semibold">
                            {comp.type}
                          </p>
                          <p className="text-sm font-bold text-slate-100">{comp.name}</p>
                          {comp.price && (
                            <p className="text-xs text-slate-400 mt-1">💰 {comp.price}</p>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Price and Save */}
                    <div className="flex justify-between items-center pt-4 border-t border-slate-700">
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                          Total Price
                        </p>
                        <p className="text-2xl font-black text-emerald-400">
                          ${config.total_price}
                        </p>
                      </div>
                      <button
                        onClick={() => handleSaveConfiguration(config)}
                        disabled={saveLoading}
                        className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:from-slate-600 disabled:to-slate-500 text-white font-bold rounded-lg transition-all disabled:cursor-not-allowed"
                      >
                        {saveLoading ? '💾 Saving...' : '💾 Save Config'}
                      </button>
                    </div>
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
