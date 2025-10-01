import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  ArrowLeftIcon,
  PauseIcon,
  LockClosedIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { useUser } from '../../hooks/useUser'

export default function DeactivateAccount() {
  const router = useRouter()
  const { user, logout } = useUser()
  
  const [step, setStep] = useState(1) // 1: Info, 2: Raison, 3: Confirmation
  const [password, setPassword] = useState('')
  const [reason, setReason] = useState('')
  const [customReason, setCustomReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const predefinedReasons = [
    { value: 'break', label: 'Pause temporaire', description: 'Je veux faire une pause dans l\'utilisation' },
    { value: 'privacy', label: 'Confidentialité', description: 'Préoccupations concernant mes données' },
    { value: 'too_many_emails', label: 'Trop d\'emails', description: 'Je reçois trop de notifications' },
    { value: 'not_using', label: 'N\'utilise plus', description: 'Je n\'utilise plus le service actuellement' },
    { value: 'other', label: 'Autre raison', description: 'Raison personnalisée' }
  ]

  const deactivateAccount = async () => {
    try {
      setLoading(true)
      setErrors({})
      
      console.log('⏸️ Désactivation temporaire [msylla01] - 2025-10-01 17:47:22:', user.email)
      
      const token = localStorage.getItem('hotel_token')
      const finalReason = reason === 'other' ? customReason : predefinedReasons.find(r => r.value === reason)?.label
      
      const response = await fetch('http://localhost:5000/api/users/deactivate', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          password,
          reason: finalReason
        })
      })

      const data = await response.json()

      if (data.success) {
        console.log('✅ Compte désactivé temporairement [msylla01]')
        // Déconnexion automatique
        logout()
        // Redirection vers une page de confirmation
        router.push('/auth/account-deactivated')
      } else {
        if (data.field) {
          setErrors({ [data.field]: data.message })
        } else {
          setErrors({ general: data.message })
        }
      }
    } catch (error) {
      console.error('❌ Erreur désactivation [msylla01]:', error)
      setErrors({ general: 'Erreur lors de la désactivation du compte' })
    } finally {
      setLoading(false)
    }
  }

  const handleNext = () => {
    if (step === 2) {
      if (!reason) {
        setErrors({ reason: 'Veuillez sélectionner une raison' })
        return
      }
      if (reason === 'other' && !customReason.trim()) {
        setErrors({ customReason: 'Veuillez préciser la raison' })
        return
      }
    }
    
    if (step === 3) {
      if (!password) {
        setErrors({ password: 'Mot de passe requis pour confirmer' })
        return
      }
      
      deactivateAccount()
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
        <title>Désactiver temporairement - Hotel Luxe</title>
        <meta name="description" content="Désactivation temporaire de votre compte" />
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
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <PauseIcon className="w-8 h-8 text-orange-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Désactivation temporaire
              </h1>
              <p className="text-gray-600">
                Étape {step} sur 3 - Votre compte peut être réactivé à tout moment
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
                  className="bg-orange-600 h-2 rounded-full transition-all duration-300"
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

            {/* Étape 1: Informations */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                    <InformationCircleIcon className="w-5 h-5 mr-2" />
                    Désactivation temporaire vs Suppression
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4">
                      <h4 className="font-semibold text-green-900 mb-2">✅ Désactivation temporaire</h4>
                      <ul className="text-green-700 text-sm space-y-1">
                        <li>• Vos données sont conservées en sécurité</li>
                        <li>• Votre historique de réservations est préservé</li>
                        <li>• Vous pouvez réactiver à tout moment</li>
                        <li>• Vos préférences sont sauvegardées</li>
                        <li>• Accès suspendu temporairement</li>
                      </ul>
                    </div>
                    
                    <div className="bg-red-50 rounded-lg p-4">
                      <h4 className="font-semibold text-red-900 mb-2">❌ Suppression définitive</h4>
                      <ul className="text-red-700 text-sm space-y-1">
                        <li>• Toutes vos données sont supprimées</li>
                        <li>• Impossible de récupérer votre compte</li>
                        <li>• Historique perdu définitivement</li>
                        <li>• Action irréversible</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                  <h4 className="font-semibold text-orange-900 mb-2">Pendant la désactivation :</h4>
                  <ul className="text-orange-700 space-y-1">
                    <li>• Vous ne pourrez pas vous connecter</li>
                    <li>• Aucun nouvel email ne sera envoyé</li>
                    <li>• Vos réservations actives restent valides</li>
                    <li>• La réactivation se fait instantanément</li>
                  </ul>
                </div>

                <div className="text-center">
                  <p className="text-gray-600 mb-4">
                    Cette option est parfaite si vous voulez faire une pause temporaire.
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
                      className="flex-1 bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
                    >
                      Continuer
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Étape 2: Raison */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Pourquoi désactivez-vous votre compte ?
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Cela nous aide à améliorer notre service (optionnel)
                  </p>
                </div>

                <div className="space-y-3">
                  {predefinedReasons.map((reasonOption) => (
                    <label
                      key={reasonOption.value}
                      className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                        reason === reasonOption.value
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start">
                        <input
                          type="radio"
                          name="reason"
                          value={reasonOption.value}
                          checked={reason === reasonOption.value}
                          onChange={(e) => setReason(e.target.value)}
                          className="mt-1 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                        />
                        <div className="ml-3">
                          <div className="font-medium text-gray-900">{reasonOption.label}</div>
                          <div className="text-sm text-gray-600">{reasonOption.description}</div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Raison personnalisée */}
                {reason === 'other' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4"
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Précisez votre raison
                    </label>
                    <textarea
                      value={customReason}
                      onChange={(e) => {
                        setCustomReason(e.target.value)
                        if (errors.customReason) setErrors({})
                      }}
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                        errors.customReason ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Dites-nous pourquoi vous désactivez votre compte..."
                    />
                    {errors.customReason && (
                      <p className="mt-1 text-sm text-red-600">{errors.customReason}</p>
                    )}
                  </motion.div>
                )}

                {errors.reason && (
                  <p className="text-sm text-red-600">{errors.reason}</p>
                )}

                <div className="flex space-x-4">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Retour
                  </button>
                  <button
                    onClick={handleNext}
                    className="flex-1 bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
                  >
                    Continuer
                  </button>
                </div>
              </motion.div>
            )}

            {/* Étape 3: Confirmation */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Confirmation finale
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Saisissez votre mot de passe pour confirmer la désactivation temporaire.
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
                      className={`pl-10 w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                        errors.password ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Entrez votre mot de passe"
                    />
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-900 mb-2">Récapitulatif :</h4>
                  <ul className="text-yellow-800 text-sm space-y-1">
                    <li><strong>Compte :</strong> {user.firstName} {user.lastName} ({user.email})</li>
                    <li><strong>Action :</strong> Désactivation temporaire</li>
                    <li><strong>Raison :</strong> {reason === 'other' ? customReason : predefinedReasons.find(r => r.value === reason)?.label}</li>
                    <li><strong>Réactivation :</strong> Possible à tout moment avec email + mot de passe</li>
                  </ul>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-green-900">Pour réactiver votre compte :</h4>
                      <p className="text-green-700 text-sm mt-1">
                        Rendez-vous sur la page de connexion et cliquez sur "Réactiver mon compte". 
                        Vous pourrez vous reconnecter immédiatement avec vos identifiants habituels.
                      </p>
                    </div>
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
                    className="flex-1 bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Désactivation...</span>
                      </>
                    ) : (
                      <>
                        <PauseIcon className="w-5 h-5" />
                        <span>Désactiver temporairement</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
              Désactivation temporaire • Développé par msylla01 • 2025-10-01 17:47:22 UTC
            </div>
          </motion.div>
        </main>
      </div>
    </>
  )
}
