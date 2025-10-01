import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  ArrowLeftIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline'
import { useProfile } from '../../hooks/useProfile'

export default function ChangePassword() {
  const router = useRouter()
  const { changePassword, loading } = useProfile()
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState('')
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

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

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Mot de passe actuel requis'
    }
    
    if (!formData.newPassword) {
      newErrors.newPassword = 'Nouveau mot de passe requis'
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Le mot de passe doit contenir au moins 6 caractères'
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmation du mot de passe requise'
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas'
    }
    
    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'Le nouveau mot de passe doit être différent de l\'actuel'
    }
    
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const validationErrors = validateForm()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    
    setErrors({})
    setSuccess('')
    
    console.log('🔐 Changement mot de passe [msylla01] - 2025-10-01 17:36:39')
    
    const result = await changePassword(formData)
    
    if (result.success) {
      setSuccess('Mot de passe modifié avec succès !')
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      
      // Redirection après 2 secondes
      setTimeout(() => {
        router.push('/profile')
      }, 2000)
    } else {
      if (result.field) {
        setErrors({ [result.field]: result.error })
      } else {
        setErrors({ general: result.error })
      }
    }
  }

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const getPasswordStrength = (password) => {
    if (password.length === 0) return { strength: 0, label: '', color: '' }
    if (password.length < 6) return { strength: 1, label: 'Très faible', color: 'text-red-600' }
    if (password.length < 8) return { strength: 2, label: 'Faible', color: 'text-orange-600' }
    if (password.length < 12) return { strength: 3, label: 'Moyen', color: 'text-yellow-600' }
    return { strength: 4, label: 'Fort', color: 'text-green-600' }
  }

  const passwordStrength = getPasswordStrength(formData.newPassword)

  return (
    <>
      <Head>
        <title>Changer le mot de passe - Hotel Luxe</title>
        <meta name="description" content="Modifiez votre mot de passe de connexion" />
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
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <LockClosedIcon className="w-8 h-8 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Changer le mot de passe
              </h1>
              <p className="text-gray-600">
                Sécurisez votre compte avec un nouveau mot de passe
              </p>
            </div>

            {/* Erreur générale */}
            {errors.general && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                <ExclamationCircleIcon className="w-5 h-5 text-red-600" />
                <span className="text-red-700">{errors.general}</span>
              </div>
            )}

            {/* Message de succès */}
            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2"
              >
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
                <span className="text-green-700">{success}</span>
              </motion.div>
            )}

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Mot de passe actuel */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe actuel
                </label>
                <div className="relative">
                  <LockClosedIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className={`pl-10 pr-10 w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.currentPassword ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Entrez votre mot de passe actuel"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('current')}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.current ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.currentPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>
                )}
              </div>

              {/* Nouveau mot de passe */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <LockClosedIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className={`pl-10 pr-10 w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.newPassword ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Entrez votre nouveau mot de passe"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.new ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                
                {/* Indicateur de force du mot de passe */}
                {formData.newPassword && (
                  <div className="mt-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            passwordStrength.strength === 1 ? 'bg-red-500 w-1/4' :
                            passwordStrength.strength === 2 ? 'bg-orange-500 w-2/4' :
                            passwordStrength.strength === 3 ? 'bg-yellow-500 w-3/4' :
                            passwordStrength.strength === 4 ? 'bg-green-500 w-full' : 'w-0'
                          }`}
                        />
                      </div>
                      <span className={`text-sm font-medium ${passwordStrength.color}`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                  </div>
                )}
                
                {errors.newPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
                )}
              </div>

              {/* Confirmation du mot de passe */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmer le nouveau mot de passe
                </label>
                <div className="relative">
                  <LockClosedIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`pl-10 pr-10 w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Confirmez votre nouveau mot de passe"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.confirm ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Conseils de sécurité */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Conseils pour un mot de passe sécurisé :</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Au moins 8 caractères</li>
                  <li>• Mélange de lettres majuscules et minuscules</li>
                  <li>• Inclure des chiffres et des caractères spéciaux</li>
                  <li>• Éviter les informations personnelles</li>
                </ul>
              </div>

              {/* Boutons */}
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Changement en cours...</span>
                    </>
                  ) : (
                    <>
                      <LockClosedIcon className="w-5 h-5" />
                      <span>Changer le mot de passe</span>
                    </>
                  )}
                </button>
                
                <Link
                  href="/profile"
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </Link>
              </div>
            </form>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
              Sécurité renforcée • Développé par msylla01 • 2025-10-01 17:36:39 UTC
            </div>
          </motion.div>
        </main>
      </div>
    </>
  )
}
