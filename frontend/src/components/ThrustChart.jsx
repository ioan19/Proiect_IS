import { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine,
} from 'recharts';
import { useContainerSize } from '../hooks/useContainerSize';

function buildThrustData(realData, config) {
  const twRatio = config?.tw_ratio || 2.0;
  const totalWeight = config?.total_weight_g || 500;
  const motorCount = config?.drone_type === 'hexa' ? 6 : config?.drone_type === 'octa' ? 8 : 4;
  const thrustPerMotorAt100 = (totalWeight * twRatio) / motorCount;

  const realByPct = {};
  if (realData && Array.isArray(realData)) {
    realData.forEach(r => { realByPct[r.throttle_percent] = r; });
  }

  return Array.from({ length: 19 }, (_, i) => {
    const throttle_percent = 10 + i * 5;
    const real = realByPct[throttle_percent];
    if (real) {
      return {
        throttle_percent,
        thrust_g: Number(real.thrust_g) || 0,
        power_w: Number(real.power_w) || 0,
        power_x20: (Number(real.power_w) || 0) * 20,
      };
    }
    const ratio = throttle_percent / 100;
    const power_w = Math.round(thrustPerMotorAt100 * 0.32 * Math.pow(ratio, 2.1) * 10) / 10;
    return {
      throttle_percent,
      thrust_g: Math.round(thrustPerMotorAt100 * Math.pow(ratio, 0.95) * 10) / 10,
      power_w,
      power_x20: Math.round(power_w * 20 * 10) / 10,
    };
  });
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  const thrust = payload.find(p => p.dataKey === 'thrust_g');
  const power = payload.find(p => p.dataKey === 'power_x20');
  return (
    <div className="bg-slate-900/95 border border-slate-700 rounded-lg p-3 shadow-2xl backdrop-blur">
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Throttle: {label}%</p>
      {thrust && (
        <div className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-slate-300">Thrust:</span>
          <span className="text-white font-bold">{thrust.value}</span>
          <span className="text-slate-500 text-xs">g</span>
        </div>
      )}
      {power && (
        <div className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="text-slate-300">Power:</span>
          <span className="text-white font-bold">{(power.value / 20).toFixed(1)}</span>
          <span className="text-slate-500 text-xs">W</span>
        </div>
      )}
    </div>
  );
};

export default function ThrustChart({ configId }) {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wrapRef, width] = useContainerSize();

  useEffect(() => {
    if (!configId) return;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`http://localhost:8000/api/configuration-analysis/${configId}`);
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const response = await res.json();
        const analysisData = response?.data;
        const realData = analysisData?.motor_performance?.throttle_progression;
        setChartData(buildThrustData(realData, analysisData?.configuration));
      } catch (err) {
        console.error('Error fetching thrust data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [configId]);

  if (loading) {
    return (
      <div className="w-full bg-slate-800/30 rounded-xl border border-slate-700 p-6 flex items-center justify-center" style={{ height: 480 }}>
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mb-3"></div>
          <p className="text-slate-400">Loading thrust data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-slate-800/30 rounded-xl border border-slate-700 p-6 flex items-center justify-center" style={{ height: 480 }}>
        <p className="text-red-400 text-center">{error}</p>
      </div>
    );
  }

  const peakThrust = Math.max(...chartData.map(d => d.thrust_g));
  const peakPower = Math.max(...chartData.map(d => d.power_w));

  return (
    <div className="w-full bg-slate-900/60 backdrop-blur rounded-xl border border-slate-700/60 p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-bold text-white">Throttle &amp; Thrust Progression</h3>
          <p className="text-xs text-slate-500 mt-0.5">Per-motor thrust output and power draw across throttle range</p>
        </div>
        <div className="flex gap-2 text-xs">
          <div className="bg-blue-500/15 px-3 py-1.5 rounded-lg border border-blue-500/30">
            <span className="text-blue-300/70">Peak Thrust:</span> <span className="text-blue-300 font-bold">{peakThrust.toFixed(0)}<span className="text-blue-300/50 ml-0.5">g</span></span>
          </div>
          <div className="bg-amber-500/15 px-3 py-1.5 rounded-lg border border-amber-500/30">
            <span className="text-amber-300/70">Peak Power:</span> <span className="text-amber-300 font-bold">{peakPower.toFixed(1)}<span className="text-amber-300/50 ml-0.5">W</span></span>
          </div>
        </div>
      </div>
      <div ref={wrapRef} className="w-full min-w-0" style={{ height: 380 }}>
        <LineChart width={width} height={380} data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
            <defs>
              <linearGradient id="thrustLineGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
            <XAxis
              dataKey="throttle_percent"
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickFormatter={(v) => `${v}%`}
              label={{ value: 'Throttle (%)', position: 'insideBottom', offset: -15, fill: '#64748b', fontSize: 11 }}
            />
            <YAxis
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              label={{ value: 'Thrust (g) / Power×20 (W)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#475569', strokeDasharray: '3 3' }} />
            <Legend wrapperStyle={{ paddingTop: 15 }} iconType="circle" />
            <ReferenceLine x={50} stroke="#a78bfa" strokeDasharray="3 3" label={{ value: 'Hover', fill: '#a78bfa', fontSize: 10, position: 'top' }} />
            <Line
              type="monotone"
              dataKey="thrust_g"
              name="Thrust (g)"
              stroke="#3b82f6"
              strokeWidth={3}
              isAnimationActive={false}
              dot={{ r: 3, fill: '#3b82f6' }}
              activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="power_x20"
              name="Power × 20 (W)"
              stroke="#f59e0b"
              strokeWidth={2.5}
              isAnimationActive={false}
              dot={{ r: 3, fill: '#f59e0b' }}
              activeDot={{ r: 6, fill: '#f59e0b', stroke: '#fff', strokeWidth: 2 }}
              strokeDasharray="5 3"
            />
        </LineChart>
      </div>
    </div>
  );
}
