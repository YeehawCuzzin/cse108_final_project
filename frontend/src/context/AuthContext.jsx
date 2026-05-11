import { createContext, useContext, useEffect, useState } from 'react'
import { apiFetch } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function bootstrap() {
      const token = localStorage.getItem('token')

      if (!token) {
        if (active) {
          setLoading(false)
        }
        return
      }

      try {
        const data = await apiFetch('/api/auth/me')
        if (active) {
          setUser(data.user)
        }
      } catch {
        localStorage.removeItem('token')
        if (active) {
          setUser(null)
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    bootstrap()

    return () => {
      active = false
    }
  }, [])

  const login = async (username, password) => {
    const data = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    })
    localStorage.setItem('token', data.token)
    setUser(data.user)
  }

  const register = async (username, password) => {
    const data = await apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    })
    localStorage.setItem('token', data.token)
    setUser(data.user)
  }

  const refreshUser = async () => {
    const data = await apiFetch('/api/auth/me')
    setUser(data.user)
    return data.user
  }

  const updateProfileImage = async (profileSvg) => {
    const data = await apiFetch('/api/auth/profile-image', {
      method: 'PUT',
      body: JSON.stringify({ profile_svg: profileSvg })
    })
    setUser(data.user)
    return data.user
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, refreshUser, updateProfileImage }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
