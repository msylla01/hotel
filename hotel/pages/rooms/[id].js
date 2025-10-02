import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  ArrowLeftIcon,
  UsersIcon,
  CheckCircleIcon,
  StarIcon as StarIconOutline,
  CurrencyEuroIcon,
  CalendarDaysIcon,
  HomeIcon,
  WifiIcon,
  TvIcon,
  ShieldCheckIcon,
  HeartIcon,
  ShareIcon,
  MinusIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import { StarIcon } from '@heroicons/react/24/solid'

export default function RoomDetail() {
  const router = useRouter()
  const { id } = router.query
  const [user, setUser] = useState(null)
  const [room, setRoom] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1,
    specialRequests: ''
  })
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingError, setBookingError] = useState('')

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
    
    if (id) {
      fetchRoomDetail()
    }
  }, [router, id])

  const fetchRoomDetail = async () => {
    try {
      setLoading(true)
      
      console.log('🏨 Récupération détail chambre [msylla01] - 2025-10-01 23:59:11:', id)
      
      // Simuler les données de chambre pour l'instant
      const mockRooms = {
        'room_1': {
          id: 'room_1',
          name: 'Chambre Simple Confort',
          description: 'Une chambre élégante et fonctionnelle pour un séjour en solo. Parfaitement équipée avec un lit simple, un bureau et tout le confort moderne. Cette chambre offre un espace optimisé avec une décoration contemporaine et des équipements de qualité pour garantir votre confort.',
          type: 'SINGLE',
          price: 120,
          capacity: 1,
          size: 22,
          images: [
            'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
            'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
            'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'
          ],
          amenities: [
            'WiFi gratuit haut débit',
            'TV écran plat 43"',
            'Climatisation individuelle',
            'Coffre-fort numérique',
            'Salle de bain privée avec douche',
            'Minibar',
            'Bureau de travail',
            'Téléphone direct',
            'Sèche-cheveux',
            'Peignoir et chaussons',
            'Produits de toilette premium',
            'Service de ménage quotidien'
          ],
          rating: 4.2,
          reviews: 45,
          available: true,
          features: [
            'Lit simple 120cm',
            'Espace bureau ergonomique',
            'Dressing avec cintres',
            'Éclairage LED réglable',
            'Isolation phonique renforcée',
            'Fenêtre avec vue dégagée'
          ]
        },
        'room_2': {
          id: 'room_2',
          name: 'Chambre Double Prestige',
          description: 'Spacieuse chambre double avec balcon privé offrant une vue imprenable. Idéale pour les couples recherchant confort et romantisme. Cette chambre dispose d\'un aménagement soigné avec des matériaux nobles et une attention particulière aux détails.',
          type: 'DOUBLE',
          price: 180,
          capacity: 2,
          size: 28,
          images: [
            'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
            'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
            'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'
          ],
          amenities: [
            'WiFi gratuit haut débit',
            'TV écran plat 50"',
            'Climatisation individuelle',
            'Balcon privé avec vue',
            'Lit king size',
            'Minibar premium',
            'Coffre-fort numérique',
            'Salle de bain avec baignoire',
            'Peignoirs et chaussons',
            'Service en chambre 24h/24',
            'Machine à café Nespresso',
            'Bouteille d\'eau offerte quotidiennement'
          ],
          rating: 4.5,
          reviews: 128,
          available: true,
          features: [
            'Lit king size 180cm',
            'Balcon privé 6m²',
            'Dressing spacieux',
            'Coin salon avec fauteuils',
            'Vue panoramique',
            'Baignoire relaxante'
          ]
        },
        'room_3': {
          id: 'room_3',
          name: 'Suite Junior Executive',
          description: 'Suite élégante avec salon séparé, parfaite pour les voyages d\'affaires ou les séjours prolongés. Décoration raffinée et équipements haut de gamme. Cette suite offre un espace de vie et de travail optimal avec des prestations de luxe.',
          type: 'SUITE',
          price: 350,
          capacity: 2,
          size: 45,
          images: [
            'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
            'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
            'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800'
          ],
          amenities: [
            'WiFi gratuit haut débit',
            'TV écran plat 55" + TV salon',
            'Climatisation multi-zones',
            'Salon séparé avec canapé',
            'Bureau executive',
            'Minibar premium',
            'Machine à café Nespresso',
            'Salle de bain avec douche italienne',
            'Peignoirs et chaussons premium',
            'Service butler disponible',
            'Vue panoramique',
            'Bouteille de champagne offerte',
            'Accès prioritaire spa',
            'Service pressing'
          ],
          rating: 4.8,
          reviews: 89,
          available: true,
          features: [
            'Salon séparé 15m²',
            'Bureau executive équipé',
            'Chambre avec dressing',
            'Salle de bain marbre',
            'Terrasse privée',
            'Service butler'
          ]
        },
        'room_4': {
          id: 'room_4',
          name: 'Chambre Familiale Spacieuse',
          description: 'Chambre parfaite pour les familles avec enfants. Espace optimisé avec lits superposés et coin jeux pour le bonheur des petits et grands. Sécurité et confort sont nos priorités pour des vacances familiales réussies.',
          type: 'FAMILY',
          price: 250,
          capacity: 4,
          size: 40,
          images: [
            'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
            'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
            'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'
          ],
          amenities: [
            'WiFi gratuit haut débit',
            'TV écran plat 50"',
            'Climatisation individuelle',
            'Lit double parents',
            'Lits superposés enfants',
            'Coin jeux aménagé',
            'Minibar adapté famille',
            'Coffre-fort numérique',
            'Salle de bain familiale',
            'Kit de bienvenue enfants',
            'Console de jeux',
            'Balcon sécurisé',
            'Réfrigérateur supplémentaire',
            'Service baby-sitting sur demande'
          ],
          rating: 4.6,
          reviews: 67,
          available: true,
          features: [
            'Espace parents séparé',
            'Coin enfants sécurisé',
            'Jeux et livres fournis',
            'Baignoire familiale',
            'Balcon avec protection',
            'Service baby-sitting'
          ]
        },
        'room_5': {
          id: 'room_5',
          name: 'Suite Présidentielle Deluxe',
          description: 'Notre suite la plus luxueuse avec jacuzzi privé, terrasse et service personnalisé. Une expérience inoubliable pour les occasions spéciales. Cette suite représente le summum du luxe avec des prestations exceptionnelles et un service sur mesure.',
          type: 'DELUXE',
          price: 450,
          capacity: 2,
          size: 65,
          images: [
            'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
            'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
            'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'
          ],
          amenities: [
            'WiFi gratuit haut débit',
            'TV écran plat 65" + système audio',
            'Climatisation multi-zones',
            'Jacuzzi privé',
            'Terrasse privée 15m²',
            'Salon de réception',
            'Chambre avec dressing',
            'Bar privé équipé',
            'Machine à café premium',
            'Salle de bain marbre avec douche pluie',
            'Service butler 24h/24',
            'Transfert VIP inclus',
            'Bouquet de fleurs fraîches',
            'Champagne et fruits de bienvenue',
            'Accès spa privatisé',
            'Dîner gastronomique offert'
          ],
          rating: 4.9,
          reviews: 34,
          available: true,
          features: [
            'Jacuzzi privatisé',
            'Terrasse panoramique',
            'Service butler 24h/24',
            'Bar privé équipé',
            'Dressing sur mesure',
            'Transfert VIP inclus'
          ]
        }
      }

      const roomData = mockRooms[id]
      if (roomData) {
        setRoom(roomData)
        console.log('✅ Détail chambre chargé [msylla01]:', roomData.name)
      } else {
        console.error('❌ Chambre non trouvée [msylla01]:', id)
        router.push('/rooms')
      }

    } catch (error) {
      console.error('❌ Erreur chargement détail chambre [msylla01]:', error)
      router.push('/rooms')
    } finally {
      setLoading(false)
    }
  }

  const handleBooking = async () => {
    if (!user.isActive) {
      alert('Veuillez réactiver votre compte pour effectuer une réservation')
      return
    }

    if (!bookingData.checkIn || !bookingData.checkOut) {
      setBookingError('Veuillez sélectionner vos dates de séjour')
      return
    }

    if (new Date(bookingData.checkIn) >= new Date(bookingData.checkOut)) {
      setBookingError('La date de départ doit être après la date d\'arrivée')
      return
    }

    if (bookingData.guests > room.capacity) {
      setBookingError(`Cette chambre peut accueillir maximum ${room.capacity} personne(s)`)
      return
    }

    try {
      setBookingLoading(true)
      setBookingError('')

      console.log('🎯 Tentative réservation [msylla01]:', {
        roomId: room.id,
        ...bookingData
      })

      const token = localStorage.getItem('hotel_token')
      
      const response = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          roomId: room.id,
          ...bookingData
        })
      })

      const data = await response.json()

      if (data.success) {
        console.log('✅ Réservation créée [msylla01]:', data.booking.id)
        alert(`🎉 Réservation confirmée !\n\nRéférence: ${data.booking.id}\nChambre: ${room.name}\nDu ${bookingData.checkIn} au ${bookingData.checkOut}\n\nVous allez être redirigé vers vos réservations.`)
        router.push('/dashboard')
      } else {
        setBookingError(data.message || 'Erreur lors de la réservation')
      }

    } catch (error) {
      console.error('❌ Erreur réservation [msylla01]:', error)
      setBookingError('Erreur de connexion. Veuillez réessayer.')
    } finally {
      setBookingLoading(false)
    }
  }

  const calculateTotal = () => {
    if (!bookingData.checkIn || !bookingData.checkOut) return 0
    
    const checkIn = new Date(bookingData.checkIn)
    const checkOut = new Date(bookingData.checkOut)
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24))
    
    return nights > 0 ? nights * room.price : 0
  }

  const getNights = () => {
    if (!bookingData.checkIn || !bookingData.checkOut) return 0
    
    const checkIn = new Date(bookingData.checkIn)
    const checkOut = new Date(bookingData.checkOut)
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24))
    
    return nights > 0 ? nights : 0
  }

  const getTypeLabel = (type) => {
    const typeLabels = {
      'SINGLE': 'Simple',
      'DOUBLE': 'Double',
      'SUITE': 'Suite',
      'FAMILY': 'Familiale',
      'DELUXE': 'Deluxe'
    }
    return typeLabels[type] || type
  }

  const getTypeColor = (type) => {
    const typeColors = {
      'SINGLE': 'bg-blue-100 text-blue-800',
      'DOUBLE': 'bg-green-100 text-green-800',
      'SUITE': 'bg-purple-100 text-purple-800',
      'FAMILY': 'bg-orange-100 text-orange-800',
      'DELUXE': 'bg-yellow-100 text-yellow-800'
    }
    return typeColors[type] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des détails...</p>
        </div>
      </div>
    )
  }

  if (!room || !user) {
    return null
  }

  return (
    <>
      <Head>
        <title>{room.name} - Hotel Luxe</title>
        <meta name="description" content={room.description} />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-6">
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

              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {user.firstName} {user.lastName}
                </span>
                <Link
                  href="/dashboard"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Mon Espace
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Colonne principale - Images et détails */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Images */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm overflow-hidden"
              >
                {/* Image principale */}
                <div className="relative h-96 overflow-hidden">
                  <img
                    src={room.images[selectedImage]}
                    alt={room.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'
                    }}
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex space-x-2">
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getTypeColor(room.type)}`}>
                      {getTypeLabel(room.type)}
                    </span>
                    {room.available && (
                      <div className="bg-green-100 text-green-800 px-3 py-1 text-sm font-medium rounded-full flex items-center space-x-1">
                        <CheckCircleIcon className="w-4 h-4" />
                        <span>Disponible</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="absolute top-4 right-4 flex space-x-2">
                    <button className="bg-white bg-opacity-90 backdrop-blur-sm p-2 rounded-full hover:bg-opacity-100 transition-colors">
                      <HeartIcon className="w-5 h-5 text-gray-600" />
                    </button>
                    <button className="bg-white bg-opacity-90 backdrop-blur-sm p-2 rounded-full hover:bg-opacity-100 transition-colors">
                      <ShareIcon className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Miniatures */}
                <div className="p-4">
                  <div className="flex space-x-2 overflow-x-auto">
                    {room.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                          selectedImage === index 
                            ? 'border-blue-500' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${room.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'
                          }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Détails de la chambre */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-sm p-8"
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {room.name}
                    </h1>
                    <div className="flex items-center space-x-6 text-gray-600">
                      <div className="flex items-center space-x-1">
                        <UsersIcon className="w-5 h-5" />
                        <span>{room.capacity} personne(s) max</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <HomeIcon className="w-5 h-5" />
                        <span>{room.size}m²</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <StarIcon className="w-5 h-5 text-yellow-400" />
                        <span>{room.rating}/5 ({room.reviews} avis)</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600">
                      {room.price}€
                    </div>
                    <div className="text-gray-500">par nuit</div>
                  </div>
                </div>

                <p className="text-gray-700 leading-relaxed mb-8">
                  {room.description}
                </p>

                {/* Caractéristiques principales */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    �� Caractéristiques principales
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {room.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Équipements */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    ⚡ Équipements et services
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {room.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-gray-700 text-sm">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Avis */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    ⭐ Note et avis clients
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-4">
                      <div className="text-4xl font-bold text-blue-600">
                        {room.rating}
                      </div>
                      <div>
                        <div className="flex items-center space-x-1 mb-1">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon
                              key={i}
                              className={`w-5 h-5 ${
                                i < Math.floor(room.rating) 
                                  ? 'text-yellow-400' 
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-gray-600 text-sm">
                          Basé sur {room.reviews} avis clients
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Colonne réservation */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl shadow-sm p-6 sticky top-8"
              >
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    🎯 Réserver cette chambre
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Complétez vos informations pour réserver
                  </p>
                </div>

                {!user.isActive && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                    <p className="text-orange-800 text-sm text-center">
                      ⚠️ Votre compte est désactivé. 
                      <Link href="/auth/reactivate" className="font-medium underline">
                        Réactivez-le
                      </Link> pour réserver.
                    </p>
                  </div>
                )}

                {bookingError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-red-800 text-sm">{bookingError}</p>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Arrivée
                      </label>
                      <input
                        type="date"
                        value={bookingData.checkIn}
                        onChange={(e) => setBookingData({...bookingData, checkIn: e.target.value})}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Départ
                      </label>
                      <input
                        type="date"
                        value={bookingData.checkOut}
                        onChange={(e) => setBookingData({...bookingData, checkOut: e.target.value})}
                        min={bookingData.checkIn || new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Nombre de personnes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre de personnes
                    </label>
                    <div className="flex items-center justify-between border border-gray-300 rounded-lg p-2">
                      <button
                        type="button"
                        onClick={() => setBookingData({
                          ...bookingData, 
                          guests: Math.max(1, bookingData.guests - 1)
                        })}
                        className="p-1 hover:bg-gray-100 rounded"
                        disabled={bookingData.guests <= 1}
                      >
                        <MinusIcon className="w-4 h-4 text-gray-600" />
                      </button>
                      
                      <div className="flex items-center space-x-2">
                        <UsersIcon className="w-4 h-4 text-gray-600" />
                        <span className="font-medium">{bookingData.guests}</span>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => setBookingData({
                          ...bookingData, 
                          guests: Math.min(room.capacity, bookingData.guests + 1)
                        })}
                        className="p-1 hover:bg-gray-100 rounded"
                        disabled={bookingData.guests >= room.capacity}
                      >
                        <PlusIcon className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Maximum {room.capacity} personne(s) pour cette chambre
                    </p>
                  </div>

                  {/* Demandes spéciales */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Demandes spéciales (optionnel)
                    </label>
                    <textarea
                      value={bookingData.specialRequests}
                      onChange={(e) => setBookingData({...bookingData, specialRequests: e.target.value})}
                      rows={3}
                      placeholder="Étage élevé, vue mer, lit king size..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Récapitulatif */}
                  {bookingData.checkIn && bookingData.checkOut && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-2">
                        💰 Récapitulatif
                      </h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-blue-700">Durée:</span>
                          <span className="font-medium text-blue-900">
                            {getNights()} nuit(s)
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700">Prix par nuit:</span>
                          <span className="font-medium text-blue-900">
                            {room.price}€
                          </span>
                        </div>
                        <div className="flex justify-between border-t border-blue-200 pt-1">
                          <span className="font-semibold text-blue-900">Total:</span>
                          <span className="font-bold text-blue-900 text-lg">
                            {calculateTotal()}€
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bouton de réservation */}
                  <button
                    onClick={handleBooking}
                    disabled={!user.isActive || bookingLoading || !bookingData.checkIn || !bookingData.checkOut}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                  >
                    {bookingLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Réservation...</span>
                      </>
                    ) : (
                      <>
                        <CalendarDaysIcon className="w-5 h-5" />
                        <span>
                          {calculateTotal() > 0 
                            ? `Réserver pour ${calculateTotal()}€` 
                            : 'Réserver maintenant'
                          }
                        </span>
                      </>
                    )}
                  </button>

                  {/* Garanties */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <ShieldCheckIcon className="w-4 h-4 text-green-500" />
                        <span>Annulation gratuite jusqu'à 24h avant</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <CheckCircleIcon className="w-4 h-4 text-green-500" />
                        <span>Confirmation immédiate</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <CheckCircleIcon className="w-4 h-4 text-green-500" />
                        <span>Paiement sécurisé</span>
                      </div>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      📞 Besoin d'aide ?
                    </h4>
                    <p className="text-gray-600 text-sm mb-2">
                      Notre équipe est là pour vous aider
                    </p>
                    <div className="space-y-1 text-sm">
                      <div className="text-gray-700">
                        📱 +33 1 23 45 67 89
                      </div>
                      <div className="text-gray-700">
                        ✉️ contact@hotel-luxe.fr
                      </div>
                      <div className="text-gray-700">
                        🕐 Support 24h/24
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-16 text-center text-gray-500"
          >
            <p className="text-sm">
              Détail chambre Hotel Luxe • Développé par msylla01 • 2025-10-02 00:02:28 UTC
            </p>
          </motion.div>
        </main>
      </div>
    </>
  )
}
