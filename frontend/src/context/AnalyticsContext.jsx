import { createContext, useContext, useState } from 'react'

export const AnalyticsContext = createContext(null)

export function AnalyticsProvider({ children }) {
  const [selectedConfigId, setSelectedConfigId] = useState(null)
  const [viewMode, setViewMode] = useState('overview')

  return (
    <AnalyticsContext.Provider value={{
      selectedConfigId,
      setSelectedConfigId,
      viewMode,
      setViewMode
    }}>
      {children}
    </AnalyticsContext.Provider>
  )
}

export function useAnalyticsContext() {
  const context = useContext(AnalyticsContext)
  if (!context) {
    throw new Error('useAnalyticsContext must be used within AnalyticsProvider')
  }
  return context
}
