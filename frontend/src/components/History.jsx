import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const DRONE_COLORS = {
  quad: { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30', bar: 'bg-blue-500' },
  hexa: { bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/30', bar: 'bg-purple-500' },
  octa: { bg: 'bg-cyan-500/15', text: 'text-cyan-400', border: 'border-cyan-500/30', bar: 'bg-cyan-500' },
};

function MetricBar({ label, value, max, unit, color = 'bg-blue-500' }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500 font-medium">{label}</span>
        <span className="text-slate-300 font-bold">{value}{unit}</span>
      </div>
      <div className="w-full h-1 bg-slate-700/60 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function ConfigCard({ item }) {
  const colors = DRONE_COLORS[item.drone_type] || DRONE_COLORS.quad;
  const date = new Date(item.created_at).toLocaleDateString('ro-RO', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="group relative bg-slate-900/80 backdrop-blur border border-slate-700/50 hover:border-slate-600/70 rounded-2xl p-5 transition-all duration-300 hover:shadow-xl hover:shadow-black/30 hover:-translate-y-0.5">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0 mr-3">
          <h3 className="font-bold text-white text-sm leading-tight truncate group-hover:text-blue-300 transition-colors">{item.name}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{date}</p>
        </div>
        <span className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider ${colors.bg} ${colors.text} border ${colors.border}`}>
          {item.drone_type}
        </span>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center bg-slate-800/60 rounded-lg p-2.5">
          <p className="text-lg font-black text-white">{item.tw_ratio?.toFixed(1)}</p>
          <p className="text-[10px] text-slate-500 font-semibold uppercase">T/W</p>
        </div>
        <div className="text-center bg-slate-800/60 rounded-lg p-2.5">
          <p className="text-lg font-black text-cyan-400">{item.flight_time_min?.toFixed(1)}</p>
          <p className="text-[10px] text-slate-500 font-semibold uppercase">Min</p>
        </div>
        <div className="text-center bg-slate-800/60 rounded-lg p-2.5">
          <p className="text-lg font-black text-emerald-400">${item.total_price?.toFixed(0)}</p>
          <p className="text-[10px] text-slate-500 font-semibold uppercase">Price</p>
        </div>
      </div>

      {/* Progress bars */}
      <div className="space-y-2.5">
        <MetricBar
          label="Thrust-to-Weight"
          value={item.tw_ratio?.toFixed(1)}
          max={8}
          unit=":1"
          color={colors.bar}
        />
        <MetricBar
          label="Flight Time"
          value={item.flight_time_min?.toFixed(1)}
          max={40}
          unit="min"
          color="bg-cyan-500"
        />
        <MetricBar
          label="Weight"
          value={item.total_weight_g?.toFixed(0)}
          max={2000}
          unit="g"
          color="bg-slate-500"
        />
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
        <div className="text-xs text-slate-600 truncate">
          <span className="text-slate-500">{item.motor_name}</span>
          {item.prop_name && <span className="text-slate-600"> · {item.prop_name}</span>}
        </div>
        <span className="flex-shrink-0 flex items-center gap-1.5 text-xs text-emerald-400 font-semibold ml-2">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          Activ
        </span>
      </div>
    </div>
  );
}

export default function History() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('date');

  useEffect(() => {
    fetch('http://localhost:8000/api/configurations?limit=100')
      .then(r => r.json())
      .then(d => setItems(d.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = items
    .filter(i => {
      const matchSearch = i.name?.toLowerCase().includes(search.toLowerCase());
      const matchFilter = filter === 'all' || i.drone_type === filter;
      return matchSearch && matchFilter;
    })
    .sort((a, b) => {
      if (sort === 'date') return new Date(b.created_at) - new Date(a.created_at);
      if (sort === 'price') return a.total_price - b.total_price;
      if (sort === 'tw') return b.tw_ratio - a.tw_ratio;
      if (sort === 'flight') return b.flight_time_min - a.flight_time_min;
      return 0;
    });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">Library</p>
          <h1 className="text-4xl font-black text-white tracking-tight">Configurații Salvate</h1>
          <p className="text-slate-400 mt-1">
            {loading ? 'Se încarcă...' : `${filtered.length} din ${items.length} configurații`}
          </p>
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

      {/* Filters */}
      <div className="bg-slate-900/80 backdrop-blur border border-slate-700/50 rounded-2xl p-4 flex items-center gap-4 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Caută configurații..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-800/80 border border-slate-700/50 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
          />
        </div>

        {/* Type filter */}
        <div className="flex gap-2">
          {['all', 'quad', 'hexa', 'octa'].map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                filter === type
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700/60 hover:text-slate-200 border border-slate-700/50'
              }`}
            >
              {type === 'all' ? 'Toate' : type}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="px-4 py-2.5 bg-slate-800/80 border border-slate-700/50 rounded-xl text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
        >
          <option value="date">Sortare: Dată</option>
          <option value="price">Sortare: Preț</option>
          <option value="tw">Sortare: T/W Ratio</option>
          <option value="flight">Sortare: Flight Time</option>
        </select>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-slate-900/50 border border-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-slate-900/80 backdrop-blur border border-slate-700/50 rounded-2xl p-16 text-center">
          <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-slate-400 font-semibold">Nicio configurație găsită</p>
          <p className="text-slate-600 text-sm mt-1">Ajustează filtrele sau creează una nouă</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((item, idx) => (
            <ConfigCard key={item.id || idx} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
