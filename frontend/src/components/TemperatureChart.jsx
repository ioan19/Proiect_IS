import { useEffect, useState } from 'react';
import { useAnalyticsContext } from '../context/AnalyticsContext';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ReferenceArea,
} from 'recharts';
import { useContainerSize } from '../hooks/useContainerSize';

function buildTempData(realData, config) {
  const sorted = (realData && realData.length > 0)
    ? [...realData].sort((a, b) => a.throttle_percent - b.throttle_percent)
    : null;

  return Array.from({ length: 19 }, (_, i) => {
    const throttle = 10 + i * 5;
    let motor_temp;
    if (sorted) {
      let lo = sorted[0];
      let hi = sorted[sorted.length - 1];
      for (let j = 0; j < sorted.length; j++) {
        if (sorted[j].throttle_percent <= throttle) lo = sorted[j];
      }
      for (let j = sorted.length - 1; j >= 0; j--) {
        if (sorted[j].throttle_percent >= throttle) hi = sorted[j];
      }
      if (lo === hi || lo.throttle_percent === hi.throttle_percent) {
        motor_temp = lo.motor_temp_c;
      } else {
        const t = (throttle - lo.throttle_percent) / (hi.throttle_percent - lo.throttle_percent);
        motor_temp = lo.motor_temp_c + (hi.motor_temp_c - lo.motor_temp_c) * t;
      }
    } else {
      const ratio = throttle / 100;
      const tw = config?.tw_ratio || 2.0;
      motor_temp = 25 + (tw * 4 + 5) * Math.pow(ratio, 1.4);
    }
    const ratio = throttle / 100;
    const esc_temp = 25 + (motor_temp - 25) * 0.7 + ratio * 3;
    const battery_temp = 25 + (motor_temp - 25) * 0.45 + ratio * 6;
    return {
      label: `${throttle}%`,
      motor_temp: Math.round(motor_temp * 10) / 10,
      esc_temp: Math.round(esc_temp * 10) / 10,
      battery_temp: Math.round(battery_temp * 10) / 10,
    };
  });
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-slate-900/95 border border-slate-700 rounded-lg p-3 shadow-2xl backdrop-blur">
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Throttle: {label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-slate-300">{p.name}:</span>
          <span className="text-white font-bold">{p.value}</span>
          <span className="text-slate-500 text-xs">°C</span>
        </div>
      ))}
    </div>
  );
};

export default function TemperatureChart() {
  const { selectedConfigId } = useAnalyticsContext();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wrapRef, width] = useContainerSize();

  useEffect(() => {
    fetchData();
  }, [selectedConfigId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (selectedConfigId) {
        const res = await fetch(`http://localhost:8000/api/configuration-analysis/${selectedConfigId}`);
        const response = await res.json();
        const analysisData = response?.data;
        const throttleData = analysisData?.motor_performance?.throttle_progression;
        setData(buildTempData(throttleData, analysisData?.configuration));
      } else {
        const res = await fetch('http://localhost:8000/api/configurations?limit=12');
        const response = await res.json();
        const configs = response.data || [];
        const chartData = configs.map((c) => ({
          label: c.name?.substring(0, 10) || `Cfg`,
          motor_temp: Math.min(85, 45 + (c.tw_ratio || 2) * 5),
          esc_temp: Math.min(75, 40 + (c.tw_ratio || 2) * 4),
          battery_temp: Math.min(60, 35 + (c.tw_ratio || 2) * 3),
        }));
        setData(chartData);
      }
    } catch (error) {
      console.error('Error fetching temperature data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full bg-slate-800/30 rounded-xl border border-slate-700 flex items-center justify-center" style={{ height: 480 }}>
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full bg-slate-800/30 rounded-xl border border-slate-700 flex items-center justify-center" style={{ height: 480 }}>
        <p className="text-slate-500">No temperature data available</p>
      </div>
    );
  }

  const peak = Math.max(...data.map(d => Math.max(d.motor_temp, d.esc_temp || 0, d.battery_temp || 0)));
  const status = peak > 80 ? { label: 'Critical', color: 'text-red-400 bg-red-500/15 border-red-500/30' }
    : peak > 60 ? { label: 'Warning', color: 'text-amber-400 bg-amber-500/15 border-amber-500/30' }
    : { label: 'Safe', color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30' };

  return (
    <div className="w-full bg-slate-900/60 backdrop-blur rounded-xl border border-slate-700/60 p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-bold text-white">Thermal Profile</h3>
          <p className="text-xs text-slate-500 mt-0.5">Motor, ESC and battery temperatures across throttle range</p>
        </div>
        <div className={`px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wider ${status.color}`}>
          {status.label} · {peak.toFixed(0)}°C peak
        </div>
      </div>
      <div ref={wrapRef} className="w-full min-w-0" style={{ height: 380 }}>
        <AreaChart width={width} height={380} data={data} margin={{ top: 10, right: 30, left: 20, bottom: 30 }}>
            <defs>
              <linearGradient id="motorTempGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" stopOpacity={0.65} />
                <stop offset="100%" stopColor="#f97316" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="escTempGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#eab308" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#eab308" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="batTempGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              label={{ value: selectedConfigId ? 'Throttle' : 'Configuration', position: 'insideBottom', offset: -15, fill: '#64748b', fontSize: 11 }}
            />
            <YAxis
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              domain={[20, 100]}
              label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#475569', strokeDasharray: '3 3' }} />
            <Legend wrapperStyle={{ paddingTop: 15 }} iconType="circle" />
            <ReferenceArea y1={80} y2={100} fill="#ef4444" fillOpacity={0.07} />
            <ReferenceArea y1={60} y2={80} fill="#f59e0b" fillOpacity={0.05} />
            <ReferenceLine y={80} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Critical 80°C', fill: '#ef4444', fontSize: 10, position: 'insideTopRight' }} />
            <ReferenceLine y={60} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Warning 60°C', fill: '#f59e0b', fontSize: 10, position: 'insideTopRight' }} />
            <Area type="monotone" dataKey="battery_temp" name="Battery" stroke="#22d3ee" strokeWidth={2} fill="url(#batTempGrad)" isAnimationActive={false} />
            <Area type="monotone" dataKey="esc_temp" name="ESC" stroke="#eab308" strokeWidth={2} fill="url(#escTempGrad)" isAnimationActive={false} />
            <Area type="monotone" dataKey="motor_temp" name="Motor" stroke="#f97316" strokeWidth={2.5} fill="url(#motorTempGrad)" isAnimationActive={false} />
        </AreaChart>
      </div>
    </div>
  );
}
