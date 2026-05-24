import { useEffect, useState } from 'react';
import { useAnalyticsContext } from '../context/AnalyticsContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function generateSyntheticTempData(config) {
  // Estimate motor temp at each throttle level from config data
  const twRatio = config?.tw_ratio || 2.0;
  const basePower = (config?.total_weight_g || 500) * twRatio * 0.3;
  const motorEfficiency = 0.85;

  return [25, 50, 75, 100].map(throttle_percent => {
    const ratio = throttle_percent / 100;
    const power = basePower * (ratio ** 2);
    const losses = power * (1 - motorEfficiency);
    const motor_temp_c = Math.round((25 + losses * 0.7) * 10) / 10;
    return { throttle_percent, 'Motor Temp': motor_temp_c };
  });
}

export default function TemperatureChart() {
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
        const res = await fetch(`http://localhost:8000/api/configuration-analysis/${selectedConfigId}`);
        const response = await res.json();
        const analysisData = response?.data;

        // Use real throttle_progression temp data if available
        const throttleData = analysisData?.motor_performance?.throttle_progression;
        if (throttleData && Array.isArray(throttleData) && throttleData.length > 0) {
          setData(throttleData.map(t => ({
            throttle_percent: t.throttle_percent,
            'Motor Temp': t.motor_temp_c
          })));
        } else {
          // Synthesize from config
          setData(generateSyntheticTempData(analysisData?.configuration));
        }
      } else {
        const res = await fetch('http://localhost:8000/api/configurations?limit=50');
        const response = await res.json();
        const configs = response.data || [];
        const chartData = configs.map((c, idx) => ({
          name: c.name?.substring(0, 10) || `Config ${idx}`,
          'Motor Temp': Math.min(85, 45 + (c.tw_ratio || 2) * 5)
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
      <div className="w-full bg-slate-800/30 rounded-xl border border-slate-700 flex items-center justify-center h-[400px]">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full bg-slate-800/30 rounded-xl border border-slate-700 flex items-center justify-center h-[400px]">
        <p className="text-slate-500">No temperature data available</p>
      </div>
    );
  }

  const xKey = selectedConfigId ? 'throttle_percent' : 'name';

  return (
    <div className="w-full bg-slate-800/30 rounded-xl border border-slate-700 p-4">
      <h3 className="text-lg font-bold text-white mb-4">Motor Temperature Distribution</h3>
      <div className="w-full h-[400px] min-w-0">
        <ResponsiveContainer width="99%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
            <XAxis dataKey={xKey} stroke="#94a3b8" style={{ fontSize: '12px' }} />
            <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} domain={[20, 100]} />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} />
            <Area type="monotone" dataKey="Motor Temp" name="Motor Temp (°C)" stroke="#f97316" fillOpacity={1} fill="url(#colorTemp)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
