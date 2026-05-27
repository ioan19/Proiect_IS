import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthContext } from './context/AuthContext'
import { AnalyticsProvider } from './context/AnalyticsContext'
import { useAuth } from './hooks/useAuth'

function AppWithProviders() {
  const auth = useAuth()
  return (
    <AuthContext.Provider value={auth}>
      <AnalyticsProvider>
        <App />
      </AnalyticsProvider>
    </AuthContext.Provider>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <AppWithProviders />,
)