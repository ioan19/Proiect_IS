import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function generateSyntheticThrottleData(config) {
  // Generate synthetic throttle progression from config fields when no thrust_test exists
  const twRatio = config?.tw_ratio || 2.0;
  const totalWeight = config?.total_weight_g || 500;
  const motorCount = config?.drone_type === 'hexa' ? 6 : config?.drone_type === 'octa' ? 8 : 4;
  const thrustPerMotorAt100 = (totalWeight * twRatio) / motorCount;

  return [25, 50, 75, 100].map(throttle_percent => {
    const ratio = throttle_percent / 100;
    const thrust_g = Math.round(thrustPerMotorAt100 * ratio * 10) / 10;
    const power_w = Math.round(thrustPerMotorAt100 * 0.3 * (ratio ** 2) * 10) / 10;
    return { throttle_percent, thrust_g, power_w };
  });
}

export default function ThrustChart({ configId }) {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

        // Use real throttle_progression if available, otherwise synthesize from config
        const realData = analysisData?.motor_performance?.throttle_progression;
        if (realData && Array.isArray(realData) && realData.length > 0) {
          setChartData(realData);
        } else {
          const synthetic = generateSyntheticThrottleData(analysisData?.configuration);
          setChartData(synthetic);
        }
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
      <div className="w-full bg-slate-800/30 rounded-xl border border-slate-700 p-6 flex items-center justify-center h-[400px]">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mb-3"></div>
          <p className="text-slate-400">Loading thrust data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-slate-800/30 rounded-xl border border-slate-700 p-6 flex flex-col items-center justify-center h-[400px]">
        <p className="text-red-400 text-center">{error}</p>
      </div>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center border border-slate-700 rounded-lg text-slate-500">
        No chart data available for this config
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-800/30 rounded-xl border border-slate-700 p-6">
      <h3 className="text-lg font-bold text-white mb-4">Throttle &amp; Thrust Progression</h3>
      <div className="w-full h-[400px] min-w-0">
        <ResponsiveContainer width="99%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
            <XAxis dataKey="throttle_percent" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} />
            <Line type="monotone" dataKey="thrust_g" name="Thrust (g)" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} />
            <Line type="monotone" dataKey="power_w" name="Power (W)" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
