import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

export function useUser() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    verifyToken()
  }, [])

  const verifyToken = async () => {
    try {
      const token = localStorage.getItem('hotel_token')
      
      if (!token) {
        setUser(null)
        setLoading(false)
        return
      }

      console.log('🔐 Vérification token [msylla01] - 2025-10-01 17:27:03');

      // Vérifier le token avec le backend
      const response = await fetch('http://localhost:5000/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (data.success) {
        console.log('✅ Token valide [msylla01]:', data.user.email)
        setUser(data.user)
        // Mettre à jour le localStorage avec les dernières données
        localStorage.setItem('hotel_user', JSON.stringify(data.user))
      } else {
        console.log('❌ Token invalide [msylla01]:', data.message)
        // Token invalide, nettoyer le localStorage
        localStorage.removeItem('hotel_token')
        localStorage.removeItem('hotel_user')
        setUser(null)
      }
    } catch (error) {
      console.error('❌ Erreur vérification token [msylla01]:', error)
      // En cas d'erreur, nettoyer le localStorage
      localStorage.removeItem('hotel_token')
      localStorage.removeItem('hotel_user')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      setLoading(true)
      
      console.log('🔐 Tentative connexion [msylla01]:', email)
      
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (data.success) {
        console.log('✅ Connexion réussie [msylla01]:', data.user.email)
        localStorage.setItem('hotel_token', data.token)
        localStorage.setItem('hotel_user', JSON.stringify(data.user))
        setUser(data.user)
        return { success: true, user: data.user }
      } else {
        console.log('❌ Connexion échouée [msylla01]:', data.message)
        return { success: false, error: data.message, field: data.field }
      }
    } catch (error) {
      console.error('❌ Erreur connexion [msylla01]:', error)
      return { success: false, error: 'Erreur de connexion' }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    console.log('🚪 Déconnexion [msylla01]')
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
    verifyToken,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN'
  }
}
