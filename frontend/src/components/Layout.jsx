import Sidebar from './Sidebar';

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200 font-sans">
      <Sidebar />
      <main className="flex-1 overflow-y-auto min-w-0">
        {/* Subtle grid texture overlay */}
        <div className="fixed inset-0 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle at 25% 10%, rgba(59,130,246,0.05) 0%, transparent 50%), radial-gradient(circle at 75% 80%, rgba(6,182,212,0.04) 0%, transparent 50%)',
          zIndex: 0
        }} />
        <div className="relative z-10 p-8 max-w-screen-2xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
