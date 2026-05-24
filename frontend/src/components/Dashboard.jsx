import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function StatCard({ label, value, unit, icon, color, subtext, trend }) {
  return (
    <div className={`relative overflow-hidden bg-slate-900/80 backdrop-blur border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600/70 transition-all duration-300 hover:shadow-xl hover:shadow-black/30 group`}>
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${color} rounded-2xl`} style={{ opacity: 0.04 }} />
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
          {icon}
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend >= 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest mb-1">{label}</p>
      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-black text-white">{value}</span>
        {unit && <span className="text-sm text-slate-400 font-medium">{unit}</span>}
      </div>
      {subtext && <p className="text-xs text-slate-600 mt-1.5">{subtext}</p>}
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:8000/api/analytics').then(r => r.json()),
      fetch('http://localhost:8000/api/configurations?limit=5').then(r => r.json()),
    ]).then(([analyticsData, configsData]) => {
      setStats(analyticsData);
      setConfigs(configsData.data || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const chartData = stats?.tw_ratio_distribution?.map(d => ({
    tw: `${d.tw_bucket}:1`,
    count: d.count,
  })) || [];

  const typeIcons = { quad: '🔷', hexa: '🔶', octa: '🔴' };

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <div className="h-10 w-72 bg-slate-800 rounded-xl animate-pulse mb-3" />
          <div className="h-5 w-56 bg-slate-800 rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-40 bg-slate-800/50 rounded-2xl border border-slate-700 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">Overview</p>
          <h1 className="text-4xl font-black text-white tracking-tight">Tablou de Bord</h1>
          <p className="text-slate-400 mt-1">Monitorizare Fleet DroneMetrics</p>
        </div>
        <Link
          to="/configurator"
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200 hover:-translate-y-0.5 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Configurație Nouă
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          label="Total Configurări"
          value={stats?.total_configurations ?? '—'}
          subtext="În baza de date"
          color="from-blue-600 to-blue-500"
          icon={<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
        />
        <StatCard
          label="Preț Mediu"
          value={`$${(stats?.average_price ?? 0).toFixed(0)}`}
          subtext="Per configurație"
          color="from-emerald-600 to-emerald-500"
          icon={<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
          label="T/W Ratio Mediu"
          value={(stats?.average_tw_ratio ?? 0).toFixed(1)}
          unit=":1"
          subtext="Thrust-to-weight"
          color="from-purple-600 to-purple-500"
          icon={<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
        />
        <StatCard
          label="Flight Time Mediu"
          value={(stats?.average_flight_time ?? 0).toFixed(1)}
          unit="min"
          subtext="Timp de zbor estimat"
          color="from-cyan-600 to-cyan-500"
          icon={<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* T/W Distribution Chart */}
        <div className="lg:col-span-2 bg-slate-900/80 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-white">T/W Ratio Distribution</h2>
              <p className="text-xs text-slate-500 mt-0.5">Distribuția thrust-to-weight în flota ta</p>
            </div>
            <span className="text-xs text-slate-600 bg-slate-800 px-3 py-1.5 rounded-full">Global</span>
          </div>
          {chartData.length > 0 ? (
            <div className="w-full h-[260px] min-w-0">
              <ResponsiveContainer width="99%" height="100%">
                <BarChart data={chartData} barSize={28}>
                  <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                  <XAxis dataKey="tw" stroke="#475569" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#475569" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '10px', fontSize: '12px' }}
                    cursor={{ fill: 'rgba(59,130,246,0.08)' }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[260px] flex items-center justify-center text-slate-600 text-sm">No data yet</div>
          )}
        </div>

        {/* Recent Configs */}
        <div className="bg-slate-900/80 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-white">Configurări Recente</h2>
            <Link to="/history" className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-semibold">
              Vezi toate →
            </Link>
          </div>
          <div className="space-y-2">
            {configs.length === 0 && (
              <p className="text-slate-600 text-sm text-center py-8">Nicio configurație</p>
            )}
            {configs.map((cfg, idx) => (
              <div
                key={cfg.id || idx}
                className="flex items-center gap-3 p-3.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/30 hover:border-slate-600/50 rounded-xl transition-all duration-200 cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-lg bg-slate-700/80 flex items-center justify-center text-lg flex-shrink-0">
                  {typeIcons[cfg.drone_type] || '🔷'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-200 text-sm truncate group-hover:text-white transition-colors">{cfg.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {cfg.drone_type?.toUpperCase()} · T/W {cfg.tw_ratio?.toFixed(1)}:1
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-emerald-400">${cfg.total_price?.toFixed(0)}</p>
                  <p className="text-xs text-slate-600">{cfg.flight_time_min?.toFixed(1)}min</p>
                </div>
              </div>
            ))}
          </div>

          <Link
            to="/configurator"
            className="mt-4 flex items-center justify-center gap-2 w-full py-3 border border-dashed border-slate-700 hover:border-blue-500/50 rounded-xl text-slate-500 hover:text-blue-400 text-sm font-semibold transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Adaugă configurație
          </Link>
        </div>
      </div>

      {/* Drone Type Breakdown */}
      <div className="bg-slate-900/80 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
        <h2 className="text-base font-bold text-white mb-5">Fleet Breakdown</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(stats?.drone_type_distribution || []).map((d, idx) => {
            const total = stats?.total_configurations || 1;
            const pct = Math.round((d.count / total) * 100);
            const colors = ['from-blue-500 to-blue-600', 'from-purple-500 to-purple-600', 'from-cyan-500 to-cyan-600'];
            const bars = ['bg-blue-500', 'bg-purple-500', 'bg-cyan-500'];
            return (
              <div key={idx} className="bg-slate-800/60 rounded-xl p-5 border border-slate-700/30">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${colors[idx % colors.length]} flex items-center justify-center`}>
                    <span className="text-white text-xs font-black">{d.drone_type[0].toUpperCase()}</span>
                  </div>
                  <span className="text-2xl font-black text-white">{d.count}</span>
                </div>
                <p className="text-sm font-semibold text-slate-300 capitalize mb-2">{d.drone_type}</p>
                <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${bars[idx % bars.length]} rounded-full transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-xs text-slate-600 mt-1.5">{pct}% din flotă</p>
              </div>
            );
          })}
          {(!stats?.drone_type_distribution || stats.drone_type_distribution.length === 0) && (
            <p className="col-span-3 text-center text-slate-600 text-sm py-6">No fleet data yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
