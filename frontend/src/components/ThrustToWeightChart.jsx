import { useEffect, useState } from 'react';
import { useAnalyticsContext } from '../context/AnalyticsContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ThrustToWeightChart() {
  const { selectedConfigId } = useAnalyticsContext();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [selectedConfigId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (selectedConfigId) {
        // Show per-config T/W breakdown by throttle level
        const res = await fetch(`http://localhost:8000/api/configuration-analysis/${selectedConfigId}`);
        const response = await res.json();
        const analysisData = response?.data;
        const config = analysisData?.configuration;

        if (config) {
          const twRatio = config.tw_ratio || 0;
          const totalWeight = config.total_weight_g || 0;
          const motorCount = config.drone_type === 'hexa' ? 6 : config.drone_type === 'octa' ? 8 : 4;
          const thrustAt100 = totalWeight * twRatio;

          setData([25, 50, 75, 100].map(pct => ({
            range: `${pct}%`,
            'T/W Ratio': Math.round((thrustAt100 * (pct / 100) / totalWeight) * 100) / 100
          })));
        } else {
          setData([]);
        }
      } else {
        const res = await fetch('http://localhost:8000/api/analytics');
        const analytics = await res.json();
        const chartData = (analytics.tw_ratio_distribution || []).map(item => ({
          range: `${item.tw_bucket}:1`,
          count: item.count
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
      <div className="w-full bg-slate-800/30 rounded-xl border border-slate-700 flex items-center justify-center h-[400px]">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full bg-slate-800/30 rounded-xl border border-slate-700 flex items-center justify-center h-[400px]">
        <p className="text-slate-500">No T/W data available</p>
      </div>
    );
  }

  const barKey = selectedConfigId ? 'T/W Ratio' : 'count';
  const barColor = selectedConfigId ? '#10b981' : '#8b5cf6';

  return (
    <div className="w-full bg-slate-800/30 rounded-xl border border-slate-700 p-4">
      <h3 className="text-lg font-bold text-white mb-4">
        {selectedConfigId ? 'Thrust-to-Weight by Throttle' : 'T/W Ratio Distribution'}
      </h3>
      <div className="w-full h-[400px] min-w-0">
        <ResponsiveContainer width="99%" height="100%">
          <BarChart data={data}>
            <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
            <XAxis dataKey="range" stroke="#94a3b8" style={{ fontSize: '12px' }} />
            <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} />
            <Bar dataKey={barKey} fill={barColor} radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
