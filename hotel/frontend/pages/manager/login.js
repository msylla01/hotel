import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  UserIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'

export default function ManagerLogin() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: 'geranto@hotelluxe.com', // Pré-rempli
    password: 'manager123'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      setError('')

      console.log('🔐 Connexion gérant [msylla01] - 2025-10-04 02:02:12')
      console.log('📧 Email:', formData.email)

      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      console.log('📡 Réponse connexion:', {
        status: response.status,
        success: data.success,
        userRole: data.user?.role
      })

      if (response.ok && data.success) {
        // Vérifier le rôle AVANT de sauvegarder
        if (!['MANAGER', 'ADMIN'].includes(data.user.role)) {
          throw new Error(`Accès refusé. Votre rôle "${data.user.role}" n'est pas autorisé pour l'espace gérant.\n\nRôles autorisés: MANAGER, ADMIN`)
        }

        // Sauvegarder les données de connexion
        localStorage.setItem('hotel_token', data.token)
        localStorage.setItem('hotel_user', JSON.stringify(data.user))

        console.log('✅ Connexion gérant réussie [msylla01]')
        console.log('👤 Utilisateur:', data.user.email)
        console.log('🎭 Rôle:', data.user.role)

        // Redirection FORCÉE vers l'espace gérant
        console.log('🔀 Redirection forcée vers /manager')
        router.push('/manager')
      } else {
        throw new Error(data.message || 'Erreur de connexion')
      }
    } catch (error) {
      console.error('❌ Erreur connexion gérant [msylla01]:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Connexion Gérant - Hotel Luxe</title>
        <meta name="description" content="Connexion à l'espace gérant - Hotel Luxe" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
        >
          {/* En-tête */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <BuildingOfficeIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Espace Gérant
            </h1>
            <p className="text-gray-600">
              Connexion à la gestion physique de l'hôtel
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 text-sm whitespace-pre-line">❌ {error}</p>
            </div>
          )}

          {/* Infos de connexion */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">🔑 Compte Gérant</h3>
            <div className="text-sm text-blue-800">
              <p><strong>Email:</strong> geranto@hotelluxe.com</p>
              <p><strong>Mot de passe:</strong> manager123</p>
              <p><strong>Rôle:</strong> MANAGER</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email gérant
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="geranto@hotelluxe.com"
                  required
                />
              </div>
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
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="manager123"
                  required
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
            </div>

            {/* Bouton connexion */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white py-3 rounded-lg hover:from-blue-700 hover:to-blue-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Connexion...</span>
                </>
              ) : (
                <>
                  <BuildingOfficeIcon className="w-5 h-5" />
                  <span>Accéder à l'Espace Gérant</span>
                </>
              )}
            </button>
          </form>

          {/* Liens utiles */}
          <div className="mt-6 text-center space-y-2">
            <Link
              href="/auth/login"
              className="text-blue-600 hover:text-blue-700 text-sm transition-colors"
            >
              ← Connexion générale
            </Link>
            <div className="text-xs text-gray-500">
              Accès réservé aux gérants et administrateurs
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-xs text-gray-500">
            Hotel Luxe • Espace Gérant • msylla01 • 2025-10-04 02:02:12
          </div>
        </motion.div>
      </div>
    </>
  )
}
