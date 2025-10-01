import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  ArrowLeftIcon,
  UserGroupIcon,
  HomeIcon,
  WifiIcon,
  TvIcon,
  HeartIcon,
  ShareIcon,
  MapPinIcon,
  PhoneIcon,
  CheckIcon
} from '@heroicons/react/24/outline'
import { StarIcon } from '@heroicons/react/24/solid'

export default function RoomDetails() {
  const router = useRouter()
  const { id } = router.query
  
  const [room, setRoom] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Vérifier si utilisateur connecté
    try {
      const userData = localStorage.getItem('hotel_user')
      if (userData) {
        setUser(JSON.parse(userData))
      }
    } catch (err) {
      console.log('Pas d\'utilisateur connecté')
    }
  }, [])

  useEffect(() => {
    if (id) {
      fetchRoomDetails()
    }
  }, [id])

  const fetchRoomDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:5000/api/rooms/${id}`)
      const data = await response.json()
      
      if (data.success) {
        setRoom(data.room)
      } else {
        setError(data.message || 'Chambre non trouvée')
      }
    } catch (err) {
      console.error('❌ Erreur récupération chambre [msylla01]:', err)
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const getRoomTypeLabel = (type) => {
    const types = {
      'SINGLE': 'Simple',
      'DOUBLE': 'Double',
      'SUITE': 'Suite',
      'FAMILY': 'Familiale',
      'DELUXE': 'Deluxe'
    }
    return types[type] || type
  }

  const getRoomTypeColor = (type) => {
    const colors = {
      'SINGLE': 'bg-green-100 text-green-800',
      'DOUBLE': 'bg-blue-100 text-blue-800',
      'SUITE': 'bg-purple-100 text-purple-800',
      'FAMILY': 'bg-orange-100 text-orange-800',
      'DELUXE': 'bg-red-100 text-red-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  const handleReservation = () => {
    if (user) {
      // Si connecté, aller vers réservation (à implémenter)
      alert(`Réservation de ${room.name} - Fonctionnalité en cours de développement par msylla01`)
    } else {
      // Si pas connecté, aller vers login
      router.push('/auth/login')
    }
  }

  const defaultImages = [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&w=800',
    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-4.0.3&w=800',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&w=800'
  ]

  const defaultAmenities = [
    'WiFi gratuit',
    'TV écran plat', 
    'Climatisation',
    'Coffre-fort',
    'Minibar',
    'Salle de bain privée',
    'Service en chambre',
    'Balcon'
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des détails...</p>
          <p className="text-xs text-gray-500 mt-2">Développé par msylla01</p>
        </div>
      </div>
    )
  }

  if (error || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <HomeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Chambre non trouvée</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-x-4">
            <Link
              href="/rooms"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Voir toutes les chambres
            </Link>
            <Link
              href="/"
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{room.name} - Hotel Luxe</title>
        <meta name="description" content={room.description || `Découvrez ${room.name} à Hotel Luxe`} />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <Link
                href="/rooms"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                <span>Retour aux chambres</span>
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
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Colonne principale - Images et détails */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Images */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm overflow-hidden"
              >
                <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                  <img
                    src={room.images?.[selectedImageIndex] || defaultImages[selectedImageIndex]}
                    alt={room.name}
                    className="w-full h-64 sm:h-96 object-cover"
                    onError={(e) => {
                      e.target.src = defaultImages[selectedImageIndex % defaultImages.length]
                    }}
                  />
                </div>
                
                {/* Miniatures */}
                <div className="p-4 flex space-x-2 overflow-x-auto">
                  {defaultImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                        selectedImageIndex === index ? 'border-blue-500' : 'border-gray-200'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${room.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Détails de la chambre */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-sm p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{room.name}</h1>
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoomTypeColor(room.type)}`}>
                        {getRoomTypeLabel(room.type)}
                      </span>
                      <div className="flex items-center space-x-1">
                        <StarIcon className="w-5 h-5 text-yellow-400" />
                        <span className="font-medium">{room.averageRating || 4.8}</span>
                        <span className="text-gray-500">({room.totalReviews || 12} avis)</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      <ShareIcon className="w-5 h-5 text-gray-600" />
                    </button>
                    <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      <HeartIcon className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Informations principales */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <UserGroupIcon className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <div className="text-sm font-medium text-gray-900">{room.capacity} pers.</div>
                    <div className="text-xs text-gray-500">Capacité</div>
                  </div>
                  
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <HomeIcon className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <div className="text-sm font-medium text-gray-900">{room.size || 25}m²</div>
                    <div className="text-xs text-gray-500">Surface</div>
                  </div>
                  
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <WifiIcon className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <div className="text-sm font-medium text-gray-900">Gratuit</div>
                    <div className="text-xs text-gray-500">WiFi</div>
                  </div>
                  
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <TvIcon className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <div className="text-sm font-medium text-gray-900">HD</div>
                    <div className="text-xs text-gray-500">TV</div>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {room.description || 
                      `Découvrez le confort et l'élégance de notre ${getRoomTypeLabel(room.type).toLowerCase()}. 
                      Soigneusement aménagée pour votre bien-être, cette chambre offre tous les équipements 
                      modernes dans un cadre raffiné. Profitez d'un séjour inoubliable à Hotel Luxe.`
                    }
                  </p>
                </div>

                {/* Équipements */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Équipements inclus</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {(room.amenities || defaultAmenities).map((amenity, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckIcon className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-gray-700">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Avis clients */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-sm p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Avis clients (12)
                </h3>
                
                <div className="space-y-4">
                  {/* Avis simulés */}
                  {[
                    { name: 'Marie D.', rating: 5, comment: 'Séjour parfait ! Chambre très propre et confortable. Le personnel était très accueillant.' },
                    { name: 'Pierre L.', rating: 4, comment: 'Très bon hôtel avec un excellent service. La vue depuis la chambre était magnifique.' },
                    { name: 'Sophie M.', rating: 5, comment: 'Expérience exceptionnelle ! Je recommande vivement cet hôtel.' }
                  ].map((review, index) => (
                    <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {review.name[0]}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900">{review.name}</span>
                        </div>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Sidebar - Réservation */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl shadow-sm p-6 sticky top-24"
              >
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {room.price}€
                    <span className="text-lg text-gray-500 font-normal">/nuit</span>
                  </div>
                  <p className="text-sm text-gray-600">Taxes et frais inclus</p>
                </div>

                <button
                  onClick={handleReservation}
                  className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors mb-4"
                >
                  {user ? 'Réserver maintenant' : 'Se connecter pour réserver'}
                </button>

                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center justify-between">
                    <span>Prix de base</span>
                    <span>{room.price}€</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Taxes</span>
                    <span>Incluses</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 flex items-center justify-between font-semibold text-gray-900">
                    <span>Total</span>
                    <span>{room.price}€</span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Informations importantes</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>✓ Annulation gratuite jusqu'à 24h</li>
                    <li>✓ WiFi gratuit dans toute la chambre</li>
                    <li>✓ Service client 24h/24</li>
                    <li>✓ Petit-déjeuner disponible (+15€)</li>
                  </ul>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPinIcon className="w-4 h-4" />
                    <span>123 Avenue de l'Élégance, Paris</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mt-2">
                    <PhoneIcon className="w-4 h-4" />
                    <span>+33 1 23 45 67 89</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-3 text-center">
                    Développé par msylla01 • 2025-10-01 16:18:39
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
