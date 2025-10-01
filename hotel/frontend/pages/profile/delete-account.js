import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  TrashIcon,
  LockClosedIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { useUser } from '../../hooks/useUser'

export default function DeleteAccount() {
  const router = useRouter()
  const { user, logout } = useUser()
  
  const [step, setStep] = useState(1) // 1: Avertissement, 2: Confirmation, 3: Mot de passe
  const [password, setPassword] = useState('')
  const [confirmText, setConfirmText] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const deleteAccount = async () => {
    try {
      setLoading(true)
      setErrors({})
      
      console.log('🗑️ Suppression compte [msylla01] - 2025-10-01 17:36:39:', user.email)
      
      const token = localStorage.getItem('hotel_token')
      
      const response = await fetch('http://localhost:5000/api/users/account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password })
      })

      const data = await response.json()

      if (data.success) {
        console.log('✅ Compte supprimé [msylla01]')
        // Déconnexion automatique
        logout()
        // Redirection vers une page de confirmation
        router.push('/auth/account-deleted')
      } else {
        if (data.field) {
          setErrors({ [data.field]: data.error })
        } else {
          setErrors({ general: data.message })
        }
      }
    } catch (error) {
      console.error('❌ Erreur suppression compte [msylla01]:', error)
      setErrors({ general: 'Erreur lors de la suppression du compte' })
    } finally {
      setLoading(false)
    }
  }

  const handleNext = () => {
    if (step === 2) {
      // Vérifier que l'utilisateur a tapé "SUPPRIMER"
      if (confirmText !== 'SUPPRIMER') {
        setErrors({ confirmText: 'Vous devez taper "SUPPRIMER" pour continuer' })
        return
      }
    }
    
    if (step === 3) {
      // Vérifier le mot de passe
      if (!password) {
        setErrors({ password: 'Mot de passe requis pour confirmer la suppression' })
        return
      }
      
      // Procéder à la suppression
      deleteAccount()
      return
    }
    
    setErrors({})
    setStep(step + 1)
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Supprimer le compte - Hotel Luxe</title>
        <meta name="description" content="Suppression définitive de votre compte" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-6">
              <Link
                href="/profile"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                <span>Retour au profil</span>
              </Link>
              
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">H</span>
                </div>
                <span className="font-semibold text-gray-900">Hotel Luxe</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm p-8"
          >
            {/* Header avec étapes */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrashIcon className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Supprimer le compte
              </h1>
              <p className="text-gray-600">
                Étape {step} sur 3 - Action irréversible
              </p>
            </div>

            {/* Indicateur de progression */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Progression</span>
                <span className="text-sm text-gray-500">{Math.round((step / 3) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(step / 3) * 100}%` }}
                />
              </div>
            </div>

            {/* Erreur générale */}
            {errors.general && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                <span className="text-red-700">{errors.general}</span>
              </div>
            )}

            {/* Étape 1: Avertissement */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-red-900 mb-4">
                    ⚠️ Attention : Action irréversible
                  </h3>
                  
                  <div className="space-y-3 text-red-700">
                    <p>La suppression de votre compte entraînera :</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Suppression définitive de toutes vos données personnelles</li>
                      <li>Annulation de toutes vos réservations actives</li>
                      <li>Perte de votre historique de séjours</li>
                      <li>Suppression de vos préférences et favoris</li>
                      <li>Impossible de récupérer votre compte</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h4 className="font-semibold text-blue-900 mb-2">Alternatives à considérer :</h4>
                  <ul className="text-blue-700 space-y-1">
                    <li>• Désactivation temporaire du compte</li>
                    <li>• Modification des paramètres de confidentialité</li>
                    <li>• Contact avec notre support client</li>
                  </ul>
                </div>

                <div className="text-center">
                  <p className="text-gray-600 mb-4">
                    Êtes-vous certain de vouloir continuer ?
                  </p>
                  <div className="flex space-x-4">
                    <Link
                      href="/profile"
                      className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-center"
                    >
                      Annuler
                    </Link>
                    <button
                      onClick={handleNext}
                      className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                    >
                      Continuer
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Étape 2: Confirmation */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Confirmation requise
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Pour confirmer la suppression, tapez exactement le mot <strong>"SUPPRIMER"</strong> ci-dessous :
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tapez "SUPPRIMER" pour confirmer
                  </label>
                  <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => {
                      setConfirmText(e.target.value)
                      if (errors.confirmText) setErrors({})
                    }}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                      errors.confirmText ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="SUPPRIMER"
                  />
                  {errors.confirmText && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmText}</p>
                  )}
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 text-sm">
                    <strong>Compte concerné :</strong> {user.firstName} {user.lastName} ({user.email})
                  </p>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Retour
                  </button>
                  <button
                    onClick={handleNext}
                    className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                  >
                    Continuer
                  </button>
                </div>
              </motion.div>
            )}

            {/* Étape 3: Mot de passe */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Dernière étape : Authentification
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Saisissez votre mot de passe pour confirmer définitivement la suppression de votre compte.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mot de passe actuel
                  </label>
                  <div className="relative">
                    <LockClosedIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        if (errors.password) setErrors({})
                      }}
                      className={`pl-10 w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                        errors.password ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Entrez votre mot de passe"
                    />
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                    <p className="text-red-800 text-sm font-medium">
                      Cette action est définitive et ne peut pas être annulée !
                    </p>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => setStep(2)}
                    disabled={loading}
                    className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50"
                  >
                    Retour
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={loading}
                    className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Suppression...</span>
                      </>
                    ) : (
                      <>
                        <TrashIcon className="w-5 h-5" />
                        <span>Supprimer définitivement</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
              Suppression de compte • Développé par msylla01 • 2025-10-01 17:36:39 UTC
            </div>
          </motion.div>
        </main>
      </div>
    </>
  )
}
