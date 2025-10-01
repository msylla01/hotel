import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

export function useUser() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    try {
      const token = localStorage.getItem('hotel_token')
      const userData = localStorage.getItem('hotel_user')
      
      if (!token || !userData) {
        setUser(null)
        setLoading(false)
        return
      }

      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
    } catch (error) {
      console.error('Erreur parsing user data:', error)
      localStorage.removeItem('hotel_token')
      localStorage.removeItem('hotel_user')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const login = (token, userData) => {
    localStorage.setItem('hotel_token', token)
    localStorage.setItem('hotel_user', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('hotel_token')
    localStorage.removeItem('hotel_user')
    setUser(null)
    router.push('/')
  }

  const updateUser = (newUserData) => {
    const updatedUser = { ...user, ...newUserData }
    localStorage.setItem('hotel_user', JSON.stringify(updatedUser))
    setUser(updatedUser)
  }

  const requireAuth = () => {
    if (!user && !loading) {
      router.push('/auth/login')
      return false
    }
    return true
  }

  const requireAdmin = () => {
    if (!user || user.role !== 'ADMIN') {
      router.push('/dashboard')
      return false
    }
    return true
  }

  return {
    user,
    loading,
    login,
    logout,
    updateUser,
    requireAuth,
    requireAdmin,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN'
  }
}
