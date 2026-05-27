import { useEffect, useState } from 'react';
import { useAnalyticsContext } from '../context/AnalyticsContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, Cell,
} from 'recharts';
import { useContainerSize } from '../hooks/useContainerSize';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-slate-900/95 border border-slate-700 rounded-lg p-3 shadow-2xl backdrop-blur">
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">{label}</p>
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

const colorFor = (tw) => {
  if (tw >= 4) return '#a855f7';
  if (tw >= 2.5) return '#22c55e';
  if (tw >= 1.5) return '#eab308';
  if (tw >= 1) return '#f97316';
  return '#ef4444';
};

export default function ThrustToWeightChart() {
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
        const config = response?.data?.configuration;
        if (config) {
          const twRatio = config.tw_ratio || 0;
          const points = Array.from({ length: 19 }, (_, i) => {
            const pct = 10 + i * 5;
            const ratio = pct / 100;
            const tw = Math.round(twRatio * Math.pow(ratio, 0.95) * 100) / 100;
            return {
              label: `${pct}%`,
              tw_ratio: tw,
            };
          });
          setData(points);
        } else setData([]);
      } else {
        const res = await fetch('http://localhost:8000/api/analytics');
        const analytics = await res.json();
        const chartData = (analytics.tw_ratio_distribution || []).map(item => ({
          label: `${item.tw_bucket}:1`,
          tw_ratio: parseFloat(item.tw_bucket),
          count: item.count,
        }));
        setData(chartData);
      }
    } catch (error) {
      console.error('Error fetching T/W data:', error);
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
        <p className="text-slate-500">No T/W data available</p>
      </div>
    );
  }

  const isDetailed = !!selectedConfigId;
  const barKey = isDetailed ? 'tw_ratio' : 'count';
  const barName = isDetailed ? 'T/W Ratio' : 'Configurations';
  const peak = isDetailed ? Math.max(...data.map(d => d.tw_ratio)) : 0;

  return (
    <div className="w-full bg-slate-900/60 backdrop-blur rounded-xl border border-slate-700/60 p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-bold text-white">
            {isDetailed ? 'Thrust-to-Weight by Throttle' : 'T/W Ratio Distribution'}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {isDetailed
              ? `Peak ${peak.toFixed(2)}:1 · classification per throttle setting`
              : 'Population breakdown across the fleet'}
          </p>
        </div>
        {isDetailed && (
          <div className="flex gap-1 text-[10px] font-bold uppercase tracking-wider">
            <span className="bg-red-500/15 text-red-300 px-2 py-1 rounded border border-red-500/30">&lt;1</span>
            <span className="bg-orange-500/15 text-orange-300 px-2 py-1 rounded border border-orange-500/30">1-1.5</span>
            <span className="bg-yellow-500/15 text-yellow-300 px-2 py-1 rounded border border-yellow-500/30">1.5-2.5</span>
            <span className="bg-green-500/15 text-green-300 px-2 py-1 rounded border border-green-500/30">2.5-4</span>
            <span className="bg-purple-500/15 text-purple-300 px-2 py-1 rounded border border-purple-500/30">&gt;4</span>
          </div>
        )}
      </div>
      <div ref={wrapRef} className="w-full min-w-0" style={{ height: 380 }}>
        <BarChart width={width} height={380} data={data} margin={{ top: 10, right: 30, left: 20, bottom: 30 }}>
            <defs>
              <linearGradient id="twBarGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1} />
                <stop offset="100%" stopColor="#6d28d9" stopOpacity={0.5} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              label={{ value: isDetailed ? 'Throttle' : 'T/W Bucket', position: 'insideBottom', offset: -15, fill: '#64748b', fontSize: 11 }}
            />
            <YAxis
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              label={{ value: barName, angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#33415540' }} />
            <Legend wrapperStyle={{ paddingTop: 15 }} iconType="circle" />
            {isDetailed && (
              <>
                <ReferenceLine y={1} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Hover 1:1', fill: '#ef4444', fontSize: 10, position: 'insideTopRight' }} />
                <ReferenceLine y={2} stroke="#eab308" strokeDasharray="4 4" label={{ value: 'Sport 2:1', fill: '#eab308', fontSize: 10, position: 'insideTopRight' }} />
                <ReferenceLine y={4} stroke="#a855f7" strokeDasharray="4 4" label={{ value: 'Aero 4:1', fill: '#a855f7', fontSize: 10, position: 'insideTopRight' }} />
              </>
            )}
            <Bar dataKey={barKey} name={barName} radius={[6, 6, 0, 0]} isAnimationActive={false}>
              {data.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={isDetailed ? colorFor(entry.tw_ratio) : 'url(#twBarGrad)'} />
              ))}
            </Bar>
        </BarChart>
      </div>
    </div>
  );
}
