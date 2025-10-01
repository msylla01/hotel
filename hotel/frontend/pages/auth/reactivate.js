import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  ArrowPathIcon,
  EnvelopeIcon,
  LockClosedIcon,
  ExclamationCircleIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline'

export default function ReactivateAccount() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Effacer l'erreur pour ce champ
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const newErrors = {}
    if (!formData.email) newErrors.email = 'Email requis'
    if (!formData.password) newErrors.password = 'Mot de passe requis'
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    try {
      setLoading(true)
      setErrors({})
      
      console.log('▶️ Tentative réactivation [msylla01] - 2025-10-01 17:47:22:', formData.email)
      
      const response = await fetch('http://localhost:5000/api/users/reactivate', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        console.log('✅ Compte réactivé [msylla01]:', data.user.email)
        
        // Sauvegarder le token et les données utilisateur
        localStorage.setItem('hotel_token', data.token)
        localStorage.setItem('hotel_user', JSON.stringify(data.user))
        
        // Redirection vers le dashboard
        router.push('/dashboard?reactivated=true')
      } else {
        if (data.field) {
          setErrors({ [data.field]: data.message })
        } else {
          setErrors({ general: data.message })
        }
      }
    } catch (error) {
      console.error('❌ Erreur réactivation [msylla01]:', error)
      setErrors({ general: 'Erreur de connexion. Veuillez réessayer.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Réactiver mon compte - Hotel Luxe</title>
        <meta name="description" content="Réactivez votre compte Hotel Luxe" />
      </Head>

      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ArrowPathIcon className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Réactiver mon compte
            </h1>
            <p className="text-gray-600">
              Reconnectez-vous pour réactiver votre compte Hotel Luxe
            </p>
          </div>

          {/* Erreur générale */}
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <ExclamationCircleIcon className="w-5 h-5 text-red-600" />
              <span className="text-red-700 text-sm">{errors.general}</span>
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse email
              </label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`pl-10 w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="votre@email.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`pl-10 pr-10 w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Votre mot de passe"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-700 text-sm">
                <strong>Rappel :</strong> Utilisez les mêmes identifiants que ceux utilisés 
                avant la désactivation de votre compte.
              </p>
            </div>

            {/* Bouton de soumission */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Réactivation...</span>
                </>
              ) : (
                <>
                  <ArrowPathIcon className="w-5 h-5" />
                  <span>Réactiver mon compte</span>
                </>
              )}
            </button>
          </form>

          {/* Liens supplémentaires */}
          <div className="mt-6 text-center space-y-2">
            <Link
              href="/auth/login"
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              Retour à la connexion normale
            </Link>
            <div>
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-700 text-sm"
              >
                Retour à l'accueil
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-xs text-gray-500">
            <p>Réactivation de compte • Développé par msylla01</p>
            <p>2025-10-01 17:47:22 UTC</p>
          </div>
        </motion.div>
      </div>
    </>
  )
}
