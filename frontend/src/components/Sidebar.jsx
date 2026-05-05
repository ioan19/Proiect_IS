import { useLocation, Link } from 'react-router-dom'

export default function Sidebar() {
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/configurator', label: 'Configurator', icon: '⚙️' },
    { path: '/history', label: 'Istoric', icon: '📜' },
    { path: '/analytics', label: 'Analize', icon: '📈' },
    { path: '/settings', label: 'Setări', icon: '⚙️' },
  ]

  return (
    <aside className="w-80 bg-linear-to-b from-[#1e293b] to-[#0f172a] border-r border-slate-700 p-6 flex flex-col gap-8 sticky top-0 h-screen shadow-2xl">
      {/* Logo Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-black bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          DroneMetrics
        </h1>
        <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">
          🚁 Dashboard V2.0
        </p>
      </div>

      <nav className="flex-1">
        <ul className="space-y-3">
          {navItems.map(item => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                  location.pathname === item.path
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-slate-100'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-slate-700 pt-4 space-y-3">
        <div className="bg-slate-800/50 rounded-lg p-3">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Status</p>
          <p className="flex items-center gap-2 text-sm font-medium">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-slate-300">Online</span>
          </p>
        </div>
        <p className="text-xs text-slate-600 text-center">© 2026 DroneMetrics</p>
      </div>
    </aside>
  )
}