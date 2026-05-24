import { useState, useEffect, useCallback } from 'react'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('auth_user')
    if (token && storedUser) {
      setUser(JSON.parse(storedUser))
      setIsAuthenticated(true)
    }
    setLoading(false)
  }, [])

  const login = useCallback((email, password) => {
    const userData = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name: email.split('@')[0]
    }
    const token = btoa(`${email}:${password}:${Date.now()}`)
    
    localStorage.setItem('auth_token', token)
    localStorage.setItem('auth_user', JSON.stringify(userData))
    setUser(userData)
    setIsAuthenticated(true)
    return true
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    setUser(null)
    setIsAuthenticated(false)
  }, [])

  return {
    user,
    isAuthenticated,
    loading,
    login,
    logout
  }
}
