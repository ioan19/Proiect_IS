import { useEffect, useState } from 'react';
import { useAnalyticsContext } from '../context/AnalyticsContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function FlightTimeChart() {
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
        const config = response?.data?.configuration;
        setData([{
          name: config?.name?.substring(0, 12) || 'Config',
          'Flight Time': config?.flight_time_min || 0
        }]);
      } else {
        const res = await fetch('http://localhost:8000/api/configurations?limit=50');
        const response = await res.json();
        const configs = response.data || [];
        const chartData = configs.map((c, idx) => ({
          name: c.name?.substring(0, 10) || `Config ${idx}`,
          'Flight Time': c.flight_time_min || 0
        }));
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
      <div className="w-full bg-slate-800/30 rounded-xl border border-slate-700 flex items-center justify-center h-[400px]">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full bg-slate-800/30 rounded-xl border border-slate-700 flex items-center justify-center h-[400px]">
        <p className="text-slate-500">No flight time data available</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-800/30 rounded-xl border border-slate-700 p-4">
      <h3 className="text-lg font-bold text-white mb-4">Estimated Flight Time</h3>
      <div className="w-full h-[400px] min-w-0">
        <ResponsiveContainer width="99%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
            <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: '12px' }} />
            <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} />
            <Line type="monotone" dataKey="Flight Time" name="Flight Time (min)" stroke="#06b6d4" dot={{ fill: '#06b6d4', r: 4 }} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
