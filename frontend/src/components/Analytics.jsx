import { useState, useEffect } from 'react';
import { useAnalyticsContext } from '../context/AnalyticsContext';
import ConfigSelector from './ConfigSelector';
import KPIDashboard from './KPIDashboard';
import ThrustChart from './ThrustChart';
import FlightTimeChart from './FlightTimeChart';
import TemperatureChart from './TemperatureChart';
import DroneTrendChart from './DroneTrendChart';
import ThrustToWeightChart from './ThrustToWeightChart';

export default function Analytics() {
  const { viewMode, setViewMode, selectedConfigId } = useAnalyticsContext();
  const [chartsGenerated, setChartsGenerated] = useState(false);
  const [configMeta, setConfigMeta] = useState(null);

  // Reset when config changes
  useEffect(() => {
    setChartsGenerated(false);
    setConfigMeta(null);
  }, [selectedConfigId]);

  // Load config metadata for the badge when a config is selected
  useEffect(() => {
    if (!selectedConfigId) { setConfigMeta(null); return; }
    fetch(`http://localhost:8000/api/configuration-analysis/${selectedConfigId}`)
      .then(r => r.json())
      .then(d => setConfigMeta(d?.data?.configuration || null))
      .catch(() => {});
  }, [selectedConfigId]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">Analytics</p>
          <h1 className="text-4xl font-black text-white tracking-tight">Analysis &amp; Reports</h1>
          <p className="text-slate-400 mt-1">
            {selectedConfigId && configMeta
              ? `Analiză: ${configMeta.name}`
              : 'Global Performance Dashboard'}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Config selector */}
          <div className="w-72">
            <ConfigSelector />
          </div>

          {/* View mode tabs */}
          <div className="flex bg-slate-800/80 border border-slate-700/50 rounded-xl p-1 gap-1">
            <button
              onClick={() => setViewMode('overview')}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                viewMode === 'overview'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setViewMode('detailed')}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                viewMode === 'detailed'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Detailed Analysis
            </button>
          </div>
        </div>
      </div>

      {/* Config info badge */}
      {selectedConfigId && configMeta && (
        <div className="flex items-center gap-4 p-4 bg-blue-500/8 border border-blue-500/20 rounded-2xl flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            <span className="text-blue-300 text-sm font-semibold">{configMeta.name}</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
            <span className="bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/50">
              <span className="text-slate-500">Type:</span> <span className="text-slate-300 font-semibold capitalize">{configMeta.drone_type}</span>
            </span>
            <span className="bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/50">
              <span className="text-slate-500">T/W:</span> <span className="text-slate-300 font-semibold">{configMeta.tw_ratio?.toFixed(1)}:1</span>
            </span>
            <span className="bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/50">
              <span className="text-slate-500">Flight:</span> <span className="text-cyan-400 font-semibold">{configMeta.flight_time_min?.toFixed(1)} min</span>
            </span>
            <span className="bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/50">
              <span className="text-slate-500">Price:</span> <span className="text-emerald-400 font-semibold">${configMeta.total_price?.toFixed(0)}</span>
            </span>
          </div>
        </div>
      )}

      {/* ── OVERVIEW ── */}
      {viewMode === 'overview' && (
        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full" />
              <h2 className="text-lg font-bold text-white">Key Performance Indicators</h2>
            </div>
            <KPIDashboard />
          </div>

          {/* Global chart previews in overview */}
          {!selectedConfigId && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-900/80 backdrop-blur border border-slate-700/50 rounded-2xl p-1 overflow-hidden">
                <DroneTrendChart />
              </div>
              <div className="bg-slate-900/80 backdrop-blur border border-slate-700/50 rounded-2xl p-1 overflow-hidden">
                <ThrustToWeightChart />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── DETAILED ── */}
      {viewMode === 'detailed' && (
        <div className="space-y-6">
          {!selectedConfigId ? (
            <div className="bg-slate-900/80 backdrop-blur border border-slate-700/50 rounded-2xl p-16 text-center">
              <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-slate-300 font-bold text-lg mb-2">Selectează o configurație</p>
              <p className="text-slate-500 text-sm">Alege o configurație din dropdown-ul de sus pentru a vedea analiza detaliată</p>
            </div>
          ) : !chartsGenerated ? (
            <div className="bg-slate-900/80 backdrop-blur border border-slate-700/50 rounded-2xl p-16 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Generează Analiza Detaliată</h3>
              <p className="text-slate-500 text-sm mb-8 max-w-md mx-auto">
                Analizează performanța motorului, progresia throttle-ului, distribuția temperaturii și date de zbor estimate
              </p>
              <button
                onClick={() => setChartsGenerated(true)}
                className="inline-flex items-center gap-3 px-8 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200 hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Generează Charts
              </button>
            </div>
          ) : (
            <>
              {/* Section label */}
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full" />
                <h2 className="text-lg font-bold text-white">Performance Charts</h2>
                <span className="text-xs text-slate-600 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700/50">
                  {configMeta?.name || `Config #${selectedConfigId}`}
                </span>
              </div>

              {/* Charts grid — CRITICAL: each chart already has its own h-[400px] min-w-0 wrapper */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ThrustChart configId={selectedConfigId} />
                <FlightTimeChart configId={selectedConfigId} />
                <TemperatureChart />
                <ThrustToWeightChart />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
