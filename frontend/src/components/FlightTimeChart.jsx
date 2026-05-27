import { useEffect, useState } from 'react';
import { useAnalyticsContext } from '../context/AnalyticsContext';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine,
} from 'recharts';
import { useContainerSize } from '../hooks/useContainerSize';

const CustomTooltip = ({ active, payload, label, unit }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-slate-900/95 border border-slate-700 rounded-lg p-3 shadow-2xl backdrop-blur">
      <p className="text-slate-300 text-xs font-bold mb-2 max-w-[260px] truncate">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-slate-300">{p.name}:</span>
          <span className="text-white font-bold">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

function buildDecayData(config) {
  const baseFlight = config?.flight_time_min || 0;
  return Array.from({ length: 19 }, (_, i) => {
    const throttle = 10 + i * 5;
    const ratio = throttle / 100;
    const decay = Math.pow(ratio, 1.6);
    const flight_time = Math.round((baseFlight / Math.max(decay * 4, 0.4)) * 10) / 10;
    return { label: `${throttle}%`, throttle, flight_time };
  });
}

export default function FlightTimeChart() {
  const { selectedConfigId } = useAnalyticsContext();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ mode: 'compare', avg: 0, max: 0, hover: 0 });
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
        const config = response?.data?.configuration;
        if (config) {
          const points = buildDecayData(config);
          const hover = points.find(p => p.throttle === 50)?.flight_time || 0;
          setMeta({ mode: 'decay', avg: 0, max: points[0]?.flight_time || 0, hover });
          setData(points);
        }
      } else {
        const res = await fetch('http://localhost:8000/api/configurations?limit=50');
        const response = await res.json();
        const configs = response.data || [];
        const sorted = [...configs]
          .filter(c => c.flight_time_min > 0)
          .sort((a, b) => b.flight_time_min - a.flight_time_min)
          .slice(0, 12);
        const chartData = sorted.map((c) => ({
          label: c.name?.substring(0, 18) || `Config ${c.id}`,
          flight_time: Math.round((c.flight_time_min || 0) * 10) / 10,
        }));
        const times = chartData.map(d => d.flight_time);
        const avg = times.length ? Math.round((times.reduce((a, b) => a + b, 0) / times.length) * 10) / 10 : 0;
        const max = times.length ? Math.max(...times) : 0;
        setMeta({ mode: 'compare', avg, max, hover: 0 });
        setData(chartData);
      }
    } catch (error) {
      console.error('Error fetching flight time data:', error);
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
        <p className="text-slate-500">No flight time data available</p>
      </div>
    );
  }

  const isDecay = meta.mode === 'decay';

  return (
    <div className="w-full bg-slate-900/60 backdrop-blur rounded-xl border border-slate-700/60 p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-bold text-white">
            {isDecay ? 'Endurance Curve' : 'Estimated Flight Time'}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {isDecay
              ? 'Flight time degradation as throttle demand increases'
              : `Top ${data.length} configurations ranked by endurance`}
          </p>
        </div>
        <div className="flex gap-2 text-xs">
          {isDecay ? (
            <>
              <div className="bg-emerald-500/15 px-3 py-1.5 rounded-lg border border-emerald-500/30">
                <span className="text-emerald-300/70">Min throttle:</span> <span className="text-emerald-300 font-bold">{meta.max}<span className="text-emerald-300/50 ml-0.5">min</span></span>
              </div>
              <div className="bg-cyan-500/15 px-3 py-1.5 rounded-lg border border-cyan-500/30">
                <span className="text-cyan-300/70">Hover (50%):</span> <span className="text-cyan-300 font-bold">{meta.hover}<span className="text-cyan-300/50 ml-0.5">min</span></span>
              </div>
            </>
          ) : (
            <>
              <div className="bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/60">
                <span className="text-slate-500">Avg:</span> <span className="text-cyan-300 font-bold">{meta.avg}<span className="text-slate-500 ml-0.5">min</span></span>
              </div>
              <div className="bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/60">
                <span className="text-slate-500">Max:</span> <span className="text-emerald-300 font-bold">{meta.max}<span className="text-slate-500 ml-0.5">min</span></span>
              </div>
            </>
          )}
        </div>
      </div>
      <div ref={wrapRef} className="w-full min-w-0" style={{ height: 380 }}>
        {isDecay ? (
          <AreaChart width={width} height={380} data={data} margin={{ top: 10, right: 30, left: 20, bottom: 30 }}>
              <defs>
                <linearGradient id="flightArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                label={{ value: 'Throttle', position: 'insideBottom', offset: -15, fill: '#64748b', fontSize: 11 }}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                label={{ value: 'Flight Time (min)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#475569', strokeDasharray: '3 3' }} />
              <Legend wrapperStyle={{ paddingTop: 15 }} iconType="circle" />
              <ReferenceLine x="50%" stroke="#a78bfa" strokeDasharray="4 4" label={{ value: 'Hover', fill: '#a78bfa', fontSize: 10, position: 'top' }} />
              <Area
                type="monotone"
                dataKey="flight_time"
                name="Flight Time (min)"
                stroke="#06b6d4"
                strokeWidth={3}
                fill="url(#flightArea)"
                isAnimationActive={false}
                dot={{ r: 3, fill: '#06b6d4' }}
                activeDot={{ r: 6, fill: '#06b6d4', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
        ) : (
          <BarChart width={width} height={380} data={data} margin={{ top: 10, right: 30, left: 20, bottom: 70 }}>
              <defs>
                <linearGradient id="cyanBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity={1} />
                  <stop offset="100%" stopColor="#0e7490" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                angle={-30}
                textAnchor="end"
                interval={0}
                height={70}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                label={{ value: 'Flight Time (min)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#33415540' }} />
              <Legend wrapperStyle={{ paddingTop: 5 }} iconType="circle" />
              <ReferenceLine y={meta.avg} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: `Avg ${meta.avg}min`, fill: '#94a3b8', fontSize: 10, position: 'insideTopRight' }} />
              <Bar dataKey="flight_time" name="Flight Time (min)" fill="url(#cyanBar)" radius={[6, 6, 0, 0]} isAnimationActive={false} />
          </BarChart>
        )}
      </div>
    </div>
  );
}
