import { useState } from 'react'

export function useProfile() {
  const [loading, setLoading] = useState(false)

  const updateProfile = async (profileData) => {
    try {
      setLoading(true)
      const token = localStorage.getItem('hotel_token')
      
      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      })

      const data = await response.json()

      if (data.success) {
        // Mettre à jour le localStorage avec les nouvelles données
        localStorage.setItem('hotel_user', JSON.stringify(data.user))
        console.log('✅ Profil mis à jour [msylla01]:', data.user.email)
        return { success: true, user: data.user }
      } else {
        console.error('❌ Erreur mise à jour profil [msylla01]:', data.message)
        return { success: false, error: data.message, field: data.field }
      }
    } catch (error) {
      console.error('❌ Erreur réseau profil [msylla01]:', error)
      return { success: false, error: 'Erreur de connexion' }
    } finally {
      setLoading(false)
    }
  }

  const changePassword = async (passwordData) => {
    try {
      setLoading(true)
      const token = localStorage.getItem('hotel_token')
      
      const response = await fetch('http://localhost:5000/api/users/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(passwordData)
      })

      const data = await response.json()

      if (data.success) {
        console.log('✅ Mot de passe changé [msylla01]')
        return { success: true }
      } else {
        console.error('❌ Erreur changement mot de passe [msylla01]:', data.message)
        return { success: false, error: data.message, field: data.field }
      }
    } catch (error) {
      console.error('❌ Erreur réseau mot de passe [msylla01]:', error)
      return { success: false, error: 'Erreur de connexion' }
    } finally {
      setLoading(false)
    }
  }

  const fetchUserStats = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('hotel_token')
      
      const response = await fetch('http://localhost:5000/api/users/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (data.success) {
        console.log('✅ Stats utilisateur récupérées [msylla01]')
        return { success: true, stats: data.stats }
      } else {
        return { success: false, error: data.message }
      }
    } catch (error) {
      console.error('❌ Erreur récupération stats [msylla01]:', error)
      return { success: false, error: 'Erreur de connexion' }
    } finally {
      setLoading(false)
    }
  }

  return {
    updateProfile,
    changePassword,
    fetchUserStats,
    loading
  }
}
