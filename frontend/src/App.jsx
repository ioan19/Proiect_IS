import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthContext } from './context/AuthContext'
import Layout from './components/Layout'
import Dashboard from './components/Dashboard'
import Configurator from './components/Configurator'
import History from './components/History'
import Analytics from './components/Analytics'
import Settings from './components/Settings'
import Login from './components/Login'

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuthContext()
  
  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#0f172a] to-[#1a1f2e] flex items-center justify-center">
        <p className="text-slate-400">Loading...</p>
      </div>
    )
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />
}

export default function App() {
  const { isAuthenticated, loading } = useAuthContext()

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#0f172a] to-[#1a1f2e] flex items-center justify-center">
        <p className="text-slate-400">Loading...</p>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} path="/" />
        <Route element={<ProtectedRoute><Layout><Configurator /></Layout></ProtectedRoute>} path="/configurator" />
        <Route element={<ProtectedRoute><Layout><History /></Layout></ProtectedRoute>} path="/history" />
        <Route element={<ProtectedRoute><Layout><Analytics /></Layout></ProtectedRoute>} path="/analytics" />
        <Route element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} path="/settings" />
      </Routes>
    </Router>
  )
}