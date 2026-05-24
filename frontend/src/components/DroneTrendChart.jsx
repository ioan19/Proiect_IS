import { useEffect, useState } from 'react';
import { useAnalyticsContext } from '../context/AnalyticsContext';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

export default function DroneTrendChart() {
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
        setData([]);
      } else {
        const res = await fetch('http://localhost:8000/api/analytics');
        const analytics = await res.json();
        const chartData = (analytics.drone_type_distribution || []).map(item => ({
          name: item.drone_type.toUpperCase(),
          value: item.count
        }));
        setData(chartData);
      }
    } catch (error) {
      console.error('Error fetching drone trend data:', error);
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

  if (selectedConfigId) {
    return (
      <div className="w-full bg-slate-800/30 rounded-xl border border-slate-700 p-4 flex items-center justify-center h-[400px]">
        <p className="text-slate-400">Distribution charts are global only</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full bg-slate-800/30 rounded-xl border border-slate-700 flex items-center justify-center h-[400px]">
        <p className="text-slate-500">No data available</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-800/30 rounded-xl border border-slate-700 p-4">
      <h3 className="text-lg font-bold text-white mb-4">Drone Type Distribution</h3>
      <div className="w-full h-[400px] min-w-0">
        <ResponsiveContainer width="99%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}`}
              outerRadius={110}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
