import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  ArrowLeftIcon,
  HeartIcon,
  UsersIcon,
  HomeIcon,
  StarIcon as StarIconOutline,
  TrashIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid, StarIcon } from '@heroicons/react/24/solid'

export default function Favorites() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [favoriteRooms, setFavoriteRooms] = useState([])
  const [allRooms, setAllRooms] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('hotel_token')
    const userData = localStorage.getItem('hotel_user')
    
    if (!token || !userData) {
      router.push('/auth/login')
      return
    }

    const user = JSON.parse(userData)
    setUser(user)
    
    loadFavorites()
    fetchRooms()
  }, [router])

  const loadFavorites = () => {
    const savedFavorites = localStorage.getItem('hotel_favorites')
    if (savedFavorites) {
      try {
        const favorites = JSON.parse(savedFavorites)
        setFavoriteRooms(favorites)
        console.log('❤️ Favoris chargés [msylla01] - 2025-10-02 01:26:51:', favorites)
      } catch (error) {
        console.error('❌ Erreur chargement favoris [msylla01]:', error)
        setFavoriteRooms([])
      }
    }
  }

  const fetchRooms = async () => {
    try {
      setLoading(true)
      
      console.log('🏨 Récupération chambres pour favoris [msylla01]')
      
      const response = await fetch('http://localhost:5000/api/rooms')
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setAllRooms(data.rooms)
          console.log(`✅ ${data.rooms.length} chambres récupérées pour favoris [msylla01]`)
        }
      }

    } catch (error) {
      console.error('❌ Erreur récupération chambres [msylla01]:', error)
    } finally {
      setLoading(false)
    }
  }

  const removeFavorite = (roomId) => {
    const newFavorites = favoriteRooms.filter(id => id !== roomId)
    setFavoriteRooms(newFavorites)
    localStorage.setItem('hotel_favorites', JSON.stringify(newFavorites))
    
    const room = allRooms.find(r => r.id === roomId)
    if (room) {
      alert(`💔 "${room.name}" retiré des favoris`)
    }
  }

  const getFavoriteRoomsData = () => {
    return allRooms.filter(room => favoriteRooms.includes(room.id))
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de vos favoris...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const favoriteRoomsData = getFavoriteRoomsData()

  return (
    <>
      <Head>
        <title>Mes Favoris - Hotel Luxe</title>
        <meta name="description" content="Vos chambres favorites - Hotel Luxe" />
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
                <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                  <HeartIconSolid className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-gray-900">Mes Favoris</span>
              </div>

              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {user.firstName} {user.lastName}
                </span>
                <div className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                  ❤️ {favoriteRooms.length} favoris
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              ❤️ Mes Chambres Favorites
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Retrouvez ici toutes les chambres que vous avez ajoutées à vos favoris. 
              Réservez-les en un clic !
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {favoriteRooms.length} chambre(s) favorite(s) • {user.firstName} {user.lastName}
            </p>
          </motion.div>

          {/* Message si aucun favori */}
          {favoriteRoomsData.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <HeartIcon className="h-24 w-24 text-gray-300 mx-auto mb-6" />
              <h3 className="text-2xl font-medium text-gray-900 mb-4">
                Aucune chambre favorite
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Vous n'avez pas encore ajouté de chambres à vos favoris. 
                Explorez nos chambres et ajoutez celles qui vous plaisent !
              </p>
              <Link
                href="/rooms"
                className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                <HeartIcon className="w-5 h-5 mr-2" />
                Découvrir nos chambres
              </Link>
            </motion.div>
          )}

          {/* Grille des favoris */}
          {favoriteRoomsData.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {favoriteRoomsData.map((room, index) => (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-lg transition-all ring-2 ring-red-200"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={room.images && room.images[0] ? room.images[0] : '/api/placeholder/800/400'}
                      alt={room.name}
                      className="w-full h-full object-cover transition-transform hover:scale-105"
                      onError={(e) => {
                        e.target.src = '/api/placeholder/800/400'
                      }}
                    />
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getTypeColor(room.type)}`}>
                        {getTypeLabel(room.type)}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4 flex space-x-2">
                      <div className="bg-red-500 rounded-full p-2">
                        <HeartIconSolid className="w-4 h-4 text-white" />
                      </div>
                      {room.rating && (
                        <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1">
                          <StarIcon className="w-4 h-4 text-yellow-400" />
                          <span className="text-sm font-medium">{room.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Contenu */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center">
                          {room.name}
                          <HeartIconSolid className="w-4 h-4 text-red-500 ml-2" />
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <UsersIcon className="w-4 h-4" />
                            <span>{room.capacity} pers.</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <HomeIcon className="w-4 h-4" />
                            <span>{room.size}m²</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-red-600">
                          {room.price}€
                        </div>
                        <div className="text-sm text-gray-500">par nuit</div>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {room.description}
                    </p>

                    {/* Équipements principaux */}
                    {room.amenities && room.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {room.amenities.slice(0, 3).map((amenity, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-1 bg-red-50 text-red-700 text-xs rounded-full"
                          >
                            {amenity.length > 20 ? amenity.slice(0, 20) + '...' : amenity}
                          </span>
                        ))}
                        {room.amenities.length > 3 && (
                          <span className="text-xs text-red-600">
                            +{room.amenities.length - 3} autres
                          </span>
                        )}
                      </div>
                    )}

                    {/* Reviews */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-1">
                        {room.rating ? (
                          <>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <StarIcon
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < Math.floor(room.rating) 
                                      ? 'text-yellow-400' 
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">
                              ({room.reviewCount || 0} avis)
                            </span>
                          </>
                        ) : (
                          <span className="text-sm text-gray-500">Pas encore d'avis</span>
                        )}
                      </div>
                      {room.available && (
                        <div className="flex items-center space-x-1 text-green-600">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs font-medium">Disponible</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="space-y-2">
                      <Link
                        href={`/rooms/${room.id}`}
                        className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors text-center block"
                      >
                        {user.isActive ? 'Voir & Réserver' : 'Voir les détails'}
                      </Link>
                      <button
                        onClick={() => removeFavorite(room.id)}
                        className="w-full border border-red-300 text-red-700 py-2 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium flex items-center justify-center space-x-2"
                      >
                        <TrashIcon className="w-4 h-4" />
                        <span>Retirer des favoris</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Actions en bas */}
          {favoriteRoomsData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-12 text-center"
            >
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  💡 Vous aimez ces chambres ?
                </h3>
                <p className="text-gray-600 mb-6">
                  Découvrez d'autres chambres qui pourraient vous plaire et ajoutez-les à vos favoris
                </p>
                <Link
                  href="/rooms"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  <HeartIcon className="w-5 h-5 mr-2" />
                  Découvrir plus de chambres
                </Link>
              </div>
            </motion.div>
          )}

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-16 text-center text-gray-500"
          >
            <p className="text-sm">
              Favoris Hotel Luxe • Gestion localStorage • msylla01 • 2025-10-02 01:30:58 UTC
            </p>
          </motion.div>
        </main>
      </div>
    </>
  )
}
