import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  ArrowLeftIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  TrashIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline'
import { useProfile } from '../hooks/useProfile'

export default function Profile() {
  const router = useRouter()
  const { updateProfile, changePassword, loading } = useProfile()
  
  const [user, setUser] = useState(null)
  const [editing, setEditing] = useState(false)
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    birthDate: '',
    preferences: {
      newsletter: true,
      smsNotifications: false,
      roomType: 'DOUBLE',
      specialRequests: ''
    }
  })

  useEffect(() => {
    // Vérifier l'authentification
    const token = localStorage.getItem('hotel_token')
    const userData = localStorage.getItem('hotel_user')
    
    if (!token || !userData) {
      router.push('/auth/login')
      return
    }

    const user = JSON.parse(userData)
    setUser(user)
    
    // Remplir le formulaire avec les données utilisateur
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || '',
      birthDate: user.birthDate ? user.birthDate.split('T')[0] : '',
      preferences: {
        newsletter: user.preferences?.newsletter ?? true,
        smsNotifications: user.preferences?.smsNotifications ?? false,
        roomType: user.preferences?.roomType || 'DOUBLE',
        specialRequests: user.preferences?.specialRequests || ''
      }
    })
  }, [router])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setErrors({}) // Effacer les erreurs
    
    if (name.startsWith('preferences.')) {
      const prefName = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [prefName]: type === 'checkbox' ? checked : value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }))
    }
  }

  const handleSave = async () => {
    try {
      setErrors({})
      setSuccess('')
      
      console.log('💾 Sauvegarde profil [msylla01] - 2025-10-01 17:42:14:', formData)
      
      const result = await updateProfile(formData)
      
      if (result.success) {
        setUser(result.user)
        setEditing(false)
        setSuccess('Profil mis à jour avec succès !')
        
        // Faire disparaître le message de succès après 3 secondes
        setTimeout(() => setSuccess(''), 3000)
      } else {
        if (result.field) {
          setErrors({ [result.field]: result.error })
        } else {
          setErrors({ general: result.error })
        }
      }
    } catch (error) {
      console.error('❌ Erreur sauvegarde profil [msylla01]:', error)
      setErrors({ general: 'Erreur lors de la sauvegarde' })
    }
  }

  const handleCancel = () => {
    // Restaurer les données originales
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || '',
      birthDate: user.birthDate ? user.birthDate.split('T')[0] : '',
      preferences: {
        newsletter: user.preferences?.newsletter ?? true,
        smsNotifications: user.preferences?.smsNotifications ?? false,
        roomType: user.preferences?.roomType || 'DOUBLE',
        specialRequests: user.preferences?.specialRequests || ''
      }
    })
    setEditing(false)
    setErrors({})
    setSuccess('')
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
        <title>Mon Profil - Hotel Luxe</title>
        <meta name="description" content="Gérez vos informations personnelles" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-6">
              <Link
                href="/dashboard"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                <span>Retour au dashboard</span>
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
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm overflow-hidden"
          >
            {/* Erreurs globales */}
            {errors.general && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4">
                <div className="text-red-700">{errors.general}</div>
              </div>
            )}

            {/* Message de succès */}
            {success && (
              <div className="bg-green-50 border-l-4 border-green-400 p-4">
                <div className="text-green-700">{success}</div>
              </div>
            )}

            {/* Profile Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">
                      {(formData.firstName?.[0] || user.firstName?.[0] || 'U')}{(formData.lastName?.[0] || user.lastName?.[0] || '')}
                    </span>
                  </div>
                  <div className="text-white">
                    <h1 className="text-2xl font-bold">
                      {formData.firstName || user.firstName} {formData.lastName || user.lastName}
                    </h1>
                    <p className="text-blue-100">{formData.email || user.email}</p>
                    <p className="text-blue-200 text-sm">
                      Membre depuis {user.createdAt ? new Date(user.createdAt).getFullYear() : '2024'}
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  {editing ? (
                    <>
                      <button
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                      >
                        {loading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <CheckIcon className="w-4 h-4" />
                        )}
                        <span>{loading ? 'Sauvegarde...' : 'Sauvegarder'}</span>
                      </button>
                      <button
                        onClick={handleCancel}
                        disabled={loading}
                        className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                      >
                        <XMarkIcon className="w-4 h-4" />
                        <span>Annuler</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setEditing(true)}
                      className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg hover:bg-opacity-30 transition-colors flex items-center space-x-2"
                    >
                      <PencilIcon className="w-4 h-4" />
                      <span>Modifier</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Informations personnelles */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Informations personnelles</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          disabled={!editing}
                          className={`pl-10 w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 ${
                            errors.firstName ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {errors.firstName && (
                          <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          disabled={!editing}
                          className={`pl-10 w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 ${
                            errors.lastName ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {errors.lastName && (
                          <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <div className="relative">
                        <EnvelopeIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          disabled={!editing}
                          className={`pl-10 w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 ${
                            errors.email ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {errors.email && (
                          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                      <div className="relative">
                        <PhoneIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          disabled={!editing}
                          placeholder="+33 1 23 45 67 89"
                          className={`pl-10 w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 ${
                            errors.phone ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {errors.phone && (
                          <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
                      <div className="relative">
                        <MapPinIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          disabled={!editing}
                          placeholder="Votre adresse"
                          className="pl-10 w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date de naissance</label>
                      <div className="relative">
                        <CalendarIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                          type="date"
                          name="birthDate"
                          value={formData.birthDate}
                          onChange={handleChange}
                          disabled={!editing}
                          className="pl-10 w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Préférences */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Préférences</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Type de chambre préféré</label>
                      <select
                        name="preferences.roomType"
                        value={formData.preferences.roomType}
                        onChange={handleChange}
                        disabled={!editing}
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                      >
                        <option value="SINGLE">Simple</option>
                        <option value="DOUBLE">Double</option>
                        <option value="SUITE">Suite</option>
                        <option value="FAMILY">Familiale</option>
                        <option value="DELUXE">Deluxe</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Demandes spéciales</label>
                      <textarea
                        name="preferences.specialRequests"
                        value={formData.preferences.specialRequests}
                        onChange={handleChange}
                        disabled={!editing}
                        rows={3}
                        placeholder="Étage élevé, vue mer, lit king size..."
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-gray-700">Notifications</h4>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="preferences.newsletter"
                          checked={formData.preferences.newsletter}
                          onChange={handleChange}
                          disabled={!editing}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                        />
                        <label className="ml-3 text-sm text-gray-700">
                          Recevoir la newsletter et les offres spéciales
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="preferences.smsNotifications"
                          checked={formData.preferences.smsNotifications}
                          onChange={handleChange}
                          disabled={!editing}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                        />
                        <label className="ml-3 text-sm text-gray-700">
                          Recevoir les notifications par SMS
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions du compte */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions du compte</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link
                    href="/profile/change-password"
                    className="p-4 border border-blue-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-center group"
                  >
                    <LockClosedIcon className="w-6 h-6 text-blue-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <h4 className="font-medium text-blue-900">Changer le mot de passe</h4>
                    <p className="text-sm text-blue-700 mt-1">Sécurisez votre compte</p>
                  </Link>

                  <button 
                    onClick={() => router.push('/profile/delete-account')}
                    className="p-4 border border-red-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors text-center group"
                  >
                    <TrashIcon className="w-6 h-6 text-red-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <h4 className="font-medium text-red-900">Supprimer le compte</h4>
                    <p className="text-sm text-red-700 mt-1">Action irréversible</p>
                  </button>
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Besoin d'aide ?</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Notre équipe support est disponible 24h/24 pour vous assister.
                  </p>
                  <div className="flex space-x-4">
                    <Link
                      href="/contact"
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Contacter le support
                    </Link>
                    <Link
                      href="/help"
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Centre d'aide
                    </Link>
                  </div>
                </div>
              </div>

              {/* Developer Info */}
              <div className="mt-8 pt-8 border-t border-gray-200 text-center text-gray-500">
                <p className="text-sm">
                  Profil utilisateur avec gestion complète • Développé par msylla01 • 2025-10-01 17:42:14 UTC
                </p>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </>
  )
}
