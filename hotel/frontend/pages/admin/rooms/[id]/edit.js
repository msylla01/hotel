import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  ArrowLeftIcon,
  PencilIcon,
  HomeIcon,
  CurrencyEuroIcon,
  UsersIcon,
  PhotoIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline'

export default function EditRoom() {
  const router = useRouter()
  const { id } = router.query
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [error, setError] = useState('')
  const [room, setRoom] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'DOUBLE',
    price: '',
    capacity: '2',
    size: '',
    images: [''],
    amenities: [],
    isActive: true
  })

  const roomTypes = [
    { value: 'SINGLE', label: 'Chambre Simple', icon: '🛏️' },
    { value: 'DOUBLE', label: 'Chambre Double', icon: '🛏️🛏️' },
    { value: 'SUITE', label: 'Suite', icon: '🏨' },
    { value: 'FAMILY', label: 'Chambre Familiale', icon: '��‍👩‍👧‍👦' },
    { value: 'DELUXE', label: 'Chambre Deluxe', icon: '✨' }
  ]

  const defaultAmenities = [
    'WiFi gratuit', 'TV écran plat', 'Climatisation', 'Minibar', 'Coffre-fort',
    'Sèche-cheveux', 'Balcon privé', 'Vue sur mer', 'Jacuzzi', 'Service en chambre',
    'Téléphone', 'Bureau', 'Canapé', 'Machine à café', 'Peignoirs'
  ]

  useEffect(() => {
    if (id) {
      fetchRoom()
    }
  }, [id])

  const fetchRoom = async () => {
    try {
      setFetchLoading(true)
      setError('')

      console.log('🏨 Récupération chambre pour édition [msylla01] - 2025-10-03 18:34:05:', id)

      const response = await fetch(`http://localhost:5000/api/rooms/${id}`)
      const data = await response.json()

      if (response.ok && data.success) {
        const room = data.room
        setRoom(room)
        
        // Remplir le formulaire avec les données existantes
        setFormData({
          name: room.name || '',
          description: room.description || '',
          type: room.type || 'DOUBLE',
          price: room.price?.toString() || '',
          capacity: room.capacity?.toString() || '2',
          size: room.size?.toString() || '',
          images: room.images && room.images.length > 0 ? room.images : [''],
          amenities: room.amenities || [],
          isActive: room.isActive !== false
        })
        
        console.log('✅ Chambre récupérée pour édition [msylla01]')
      } else {
        throw new Error(data.message || 'Erreur de récupération')
      }
    } catch (error) {
      console.error('❌ Erreur récupération chambre [msylla01]:', error)
      setError(error.message)
    } finally {
      setFetchLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.price || !formData.capacity) {
      setError('Veuillez remplir tous les champs obligatoires')
      return
    }

    if (Number(formData.price) <= 0) {
      setError('Le prix doit être supérieur à 0')
      return
    }

    if (Number(formData.capacity) <= 0) {
      setError('La capacité doit être supérieure à 0')
      return
    }

    try {
      setLoading(true)
      setError('')

      const token = localStorage.getItem('hotel_token')
      
      // Nettoyer les données
      const cleanImages = formData.images.filter(img => img.trim() !== '')
      const cleanAmenities = formData.amenities.filter(amenity => amenity.trim() !== '')

      const requestBody = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        type: formData.type,
        price: Number(formData.price),
        capacity: Number(formData.capacity),
        size: formData.size ? Number(formData.size) : null,
        images: cleanImages,
        amenities: cleanAmenities,
        isActive: formData.isActive
      }

      console.log('📡 Modification chambre [msylla01] - 2025-10-03 18:34:05:', requestBody)

      const response = await fetch(`http://localhost:5000/api/rooms/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      const data = await response.json()

      if (response.ok && data.success) {
        console.log('✅ Chambre modifiée avec succès [msylla01]:', data.room.id)
        alert('✅ Chambre modifiée avec succès !')
        router.push(`/admin/rooms/${id}`)
      } else {
        const errorMessage = data.message || `Erreur ${response.status}: ${response.statusText}`
        console.error('❌ Erreur modification chambre [msylla01]:', errorMessage)
        setError(errorMessage)
      }

    } catch (error) {
      console.error('❌ Erreur réseau modification chambre [msylla01]:', error)
      setError(`Erreur de connexion: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const addImageField = () => {
    setFormData({ ...formData, images: [...formData.images, ''] })
  }

  const removeImageField = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index)
    setFormData({ ...formData, images: newImages.length > 0 ? newImages : [''] })
  }

  const updateImage = (index, value) => {
    const newImages = [...formData.images]
    newImages[index] = value
    setFormData({ ...formData, images: newImages })
  }

  const toggleAmenity = (amenity) => {
    const amenities = formData.amenities.includes(amenity)
      ? formData.amenities.filter(a => a !== amenity)
      : [...formData.amenities, amenity]
    setFormData({ ...formData, amenities })
  }

  if (fetchLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de la chambre...</p>
        </div>
      </div>
    )
  }

  if (error && !room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-gray-600 mb-4">Erreur de chargement de la chambre</p>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <div className="space-x-4">
            <button
              onClick={fetchRoom}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Réessayer
            </button>
            <Link
              href="/admin/rooms"
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 inline-block"
            >
              Retour
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Modifier {room?.name || 'Chambre'} - Admin Hotel Luxe</title>
        <meta name="description" content={`Modifier la chambre ${room?.name || ''}`} />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <Link href={`/admin/rooms/${id}`} className="flex items-center text-gray-600 hover:text-red-600 transition-colors">
                  <ArrowLeftIcon className="w-5 h-5 mr-2" />
                  Détails Chambre
                </Link>
                <div className="text-gray-300">•</div>
                <h1 className="text-xl font-bold text-gray-900">Modifier {room?.name}</h1>
              </div>

              <div className="flex items-center space-x-4">
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">👑 Admin</span>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm p-8"
          >
            {/* En-tête */}
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <PencilIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Modifier la chambre</h2>
                <p className="text-gray-600">Modifiez les détails de votre chambre</p>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800">❌ {error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Informations de base */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de la chambre *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Suite Présidentielle Ocean View"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de chambre *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {roomTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Prix et capacité */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix par nuit (€) *
                  </label>
                  <div className="relative">
                    <CurrencyEuroIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="150"
                      min="1"
                      step="0.01"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capacité (personnes) *
                  </label>
                  <div className="relative">
                    <UsersIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                      placeholder="2"
                      min="1"
                      max="10"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Surface (m²)
                  </label>
                  <div className="relative">
                    <HomeIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                      placeholder="25"
                      min="1"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Décrivez la chambre, ses spécificités, l'ambiance..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Images de la chambre
                </label>
                <div className="space-y-3">
                  {formData.images.map((image, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="relative flex-1">
                        <PhotoIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                          type="url"
                          value={image}
                          onChange={(e) => updateImage(index, e.target.value)}
                          placeholder="https://exemple.com/image.jpg"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      {formData.images.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeImageField(index)}
                          className="text-red-500 hover:text-red-700 p-2"
                        >
                          <XMarkIcon className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addImageField}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    ➕ Ajouter une image
                  </button>
                </div>
              </div>

              {/* Équipements */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Équipements et services
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {defaultAmenities.map(amenity => (
                    <label key={amenity} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.amenities.includes(amenity)}
                        onChange={() => toggleAmenity(amenity)}
                        className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Statut */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Chambre active (visible pour les clients)
                  </span>
                </label>
              </div>

              {/* Boutons */}
              <div className="flex space-x-4 pt-6 border-t">
                <Link
                  href={`/admin/rooms/${id}`}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors text-center"
                >
                  Annuler
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Modification...</span>
                    </>
                  ) : (
                    <>
                      <CheckIcon className="w-5 h-5" />
                      <span>Sauvegarder les modifications</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>

          {/* Footer info */}
          <div className="mt-8 text-center text-gray-500 text-sm">
            Modification Chambre • Données Prisma PostgreSQL • msylla01 • 2025-10-03 18:34:05
          </div>
        </main>
      </div>
    </>
  )
}
