import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  ArrowPathIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

export default function QuickReactivateButton({ user, onSuccess }) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleQuickReactivate = async (e) => {
    e.preventDefault()
    
    if (!password) {
      setError('Mot de passe requis')
      return
    }

    try {
      setLoading(true)
      setError('')
      
      console.log('▶️ Réactivation rapide [msylla01] - 2025-10-01 18:15:36:', user.email)
      
      const response = await fetch('http://localhost:5000/api/auth/reactivate', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: user.email,
          password: password
        })
      })

      const data = await response.json()

      if (data.success) {
        console.log('✅ Réactivation réussie [msylla01]:', data.user.email)
        
        setSuccess(true)
        
        // Mettre à jour immédiatement le localStorage
        localStorage.setItem('hotel_token', data.token)
        localStorage.setItem('hotel_user', JSON.stringify(data.user))
        
        // Callback de succès pour mettre à jour l'état parent
        if (onSuccess) {
          onSuccess(data.user)
        }
        
        // Attendre 2 secondes pour montrer le message de succès
        setTimeout(() => {
          // Forcer la redirection vers le dashboard avec rechargement
          window.location.href = '/dashboard?reactivated=true'
        }, 2000)
        
      } else {
        setError(data.message || 'Erreur lors de la réactivation')
      }
    } catch (error) {
      console.error('❌ Erreur réactivation rapide [msylla01]:', error)
      setError('Erreur de connexion. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  if (!user || user.isActive) return null

  // Affichage du succès
  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-green-50 border border-green-200 rounded-lg p-4 text-center"
      >
        <CheckCircleIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
        <h4 className="font-semibold text-green-900 mb-1">Compte réactivé avec succès ! 🎉</h4>
        <p className="text-green-700 text-sm mb-2">
          Redirection vers votre dashboard en cours...
        </p>
        <div className="flex items-center justify-center space-x-2 text-green-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
          <span className="text-sm">Chargement...</span>
        </div>
      </motion.div>
    )
  }

  if (!showForm) {
    return (
      <motion.button
        onClick={() => setShowForm(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-sm"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <ArrowPathIcon className="w-4 h-4" />
        <span>Réactiver maintenant</span>
      </motion.button>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-white border border-blue-200 rounded-lg p-4 mt-4"
    >
      <h4 className="font-semibold text-gray-900 mb-3">Réactivation rapide</h4>
      
      <form onSubmit={handleQuickReactivate} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirmez votre mot de passe pour réactiver
          </label>
          <div className="relative">
            <LockClosedIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (error) setError('')
              }}
              className="pl-9 pr-9 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="Votre mot de passe"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <EyeSlashIcon className="h-4 w-4" />
              ) : (
                <EyeIcon className="h-4 w-4" />
              )}
            </button>
          </div>
          {error && (
            <p className="mt-1 text-sm text-red-600">{error}</p>
          )}
        </div>

        <div className="flex space-x-2">
          <button
            type="submit"
            disabled={loading || !password}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 text-sm"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Réactivation en cours...</span>
              </>
            ) : (
              <>
                <ArrowPathIcon className="w-4 h-4" />
                <span>Réactiver mon compte</span>
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={() => {
              setShowForm(false)
              setPassword('')
              setError('')
            }}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm disabled:opacity-50"
          >
            Annuler
          </button>
        </div>
      </form>

      <p className="text-xs text-gray-500 mt-2">
        Vous pouvez aussi utiliser la{' '}
        <Link href="/auth/reactivate" className="text-blue-600 hover:text-blue-700 underline">
          page de réactivation complète
        </Link>
      </p>
    </motion.div>
  )
}
