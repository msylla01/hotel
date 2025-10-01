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
  XMarkIcon
} from '@heroicons/react/24/outline'

export default function Profile() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
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
      birthDate: user.birthDate || '',
      preferences: {
        newsletter: user.preferences?.newsletter ?? true,
        smsNotifications: user.preferences?.smsNotifications ?? false,
        roomType: user.preferences?.roomType || 'DOUBLE',
        specialRequests: user.preferences?.specialRequests || ''
      }
    })
    
    setLoading(false)
  }, [router])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    
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
      // Simuler une sauvegarde
      console.log('�� Sauvegarde profil [msylla01]:', formData)
      
      // Mettre à jour le localStorage
      const updatedUser = { ...user, ...formData }
      localStorage.setItem('hotel_user', JSON.stringify(updatedUser))
      setUser(updatedUser)
      
      setEditing(false)
      alert('Profil mis à jour avec succès !')
      
    } catch (error) {
      console.error('❌ Erreur sauvegarde profil [msylla01]:', error)
      alert('Erreur lors de la sauvegarde')
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
      birthDate: user.birthDate || '',
      preferences: {
        newsletter: user.preferences?.newsletter ?? true,
        smsNotifications: user.preferences?.smsNotifications ?? false,
        roomType: user.preferences?.roomType || 'DOUBLE',
        specialRequests: user.preferences?.specialRequests || ''
      }
    })
    setEditing(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
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
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </span>
                  </div>
                  <div className="text-white">
                    <h1 className="text-2xl font-bold">{user.firstName} {user.lastName}</h1>
                    <p className="text-blue-100">{user.email}</p>
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
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                      >
                        <CheckIcon className="w-4 h-4" />
                        <span>Sauvegarder</span>
                      </button>
                      <button
                        onClick={handleCancel}
                        className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
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
                          className="pl-10 w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                        />
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
                          className="pl-10 w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                        />
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
                          className="pl-10 w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                        />
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
                          className="pl-10 w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                        />
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

              {/* Actions supplémentaires */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link
                    href="/profile/change-password"
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-center"
                  >
                    <h4 className="font-medium text-gray-900">Changer le mot de passe</h4>
                    <p className="text-sm text-gray-600 mt-1">Sécurisez votre compte</p>
                  </Link>

                  <Link
                    href="/profile/download-data"
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-center"
                  >
                    <h4 className="font-medium text-gray-900">Télécharger mes données</h4>
                    <p className="text-sm text-gray-600 mt-1">Export PDF/CSV</p>
                  </Link>

                  <button className="p-4 border border-red-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors text-center">
                    <h4 className="font-medium text-red-900">Supprimer le compte</h4>
                    <p className="text-sm text-red-600 mt-1">Action irréversible</p>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Developer Info */}
          <div className="mt-8 text-center text-gray-500">
            <p className="text-sm">
              Profil utilisateur • Développé par msylla01 • 2025-10-01 16:30:22 UTC
            </p>
          </div>
        </main>
      </div>
    </>
  )
}
