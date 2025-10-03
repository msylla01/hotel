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
  MagnifyingGlassIcon,
  FunnelIcon,
  HomeIcon,
  WifiIcon,
  TvIcon,
  CarIcon,
  UserCircleIcon,
  HeartIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { StarIcon, HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'

export default function Rooms() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [favoriteRooms, setFavoriteRooms] = useState([])
  const [filters, setFilters] = useState({
    type: '',
    minPrice: '',
    maxPrice: '',
    capacity: '',
    search: ''
  })

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté (SANS redirection forcée)
    const token = localStorage.getItem('hotel_token')
    const userData = localStorage.getItem('hotel_user')
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData)
        setUser(user)
        setIsConnected(true)
        console.log('👤 Utilisateur connecté [msylla01] - 2025-10-03 10:09:14:', user.firstName, user.lastName)
        loadFavorites()
      } catch (error) {
        console.log('❌ Erreur parsing user data:', error)
        setIsConnected(false)
      }
    } else {
      setIsConnected(false)
      console.log('👥 Visiteur non connecté [msylla01] - 2025-10-03 10:09:14')
    }
    
    fetchRoomsFromAPI()
  }, [])

  const fetchRoomsFromAPI = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🏨 Récupération chambres API [msylla01] - 2025-10-03 10:09:14')
      
      const response = await fetch('http://localhost:5000/api/rooms')
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.message || 'Erreur API')
      }

      setRooms(data.rooms)
      console.log(`✅ ${data.rooms.length} chambres API récupérées [msylla01]`)

    } catch (error) {
      console.error('❌ Erreur récupération chambres API [msylla01]:', error)
      setError(`Impossible de charger les chambres: ${error.message}`)
      setRooms([])
    } finally {
      setLoading(false)
    }
  }

  const loadFavorites = () => {
    if (!isConnected) return
    
    const savedFavorites = localStorage.getItem('hotel_favorites')
    if (savedFavorites) {
      try {
        const favorites = JSON.parse(savedFavorites)
        setFavoriteRooms(favorites)
        console.log('❤️ Favoris chargés [msylla01]:', favorites)
      } catch (error) {
        console.error('❌ Erreur chargement favoris [msylla01]:', error)
        setFavoriteRooms([])
      }
    } else {
      setFavoriteRooms([])
    }
  }

  const saveFavorites = (favorites) => {
    localStorage.setItem('hotel_favorites', JSON.stringify(favorites))
  }

  const toggleFavorite = async (roomId) => {
    if (!isConnected) {
      const confirmLogin = window.confirm('Veuillez vous connecter pour gérer les favoris.\n\nSouhaitez-vous vous connecter maintenant ?')
      if (confirmLogin) {
        router.push('/auth/login')
      }
      return
    }

    try {
      console.log('❤️ Toggle favori [msylla01]:', roomId)

      const isFavorite = favoriteRooms.includes(roomId)
      
      if (isFavorite) {
        const newFavorites = favoriteRooms.filter(id => id !== roomId)
        setFavoriteRooms(newFavorites)
        saveFavorites(newFavorites)
        
        const room = rooms.find(r => r.id === roomId)
        alert(`💔 "${room?.name}" retiré des favoris`)
        
      } else {
        const newFavorites = [...favoriteRooms, roomId]
        setFavoriteRooms(newFavorites)
        saveFavorites(newFavorites)
        
        const room = rooms.find(r => r.id === roomId)
        alert(`❤️ "${room?.name}" ajouté aux favoris`)
      }

    } catch (error) {
      console.error('❌ Erreur favoris [msylla01]:', error)
      alert('Erreur lors de la gestion des favoris')
    }
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

  const filteredRooms = rooms.filter(room => {
    if (filters.type && room.type !== filters.type) return false
    if (filters.capacity && room.capacity < parseInt(filters.capacity)) return false
    if (filters.minPrice && room.price < parseInt(filters.minPrice)) return false
    if (filters.maxPrice && room.price > parseInt(filters.maxPrice)) return false
    if (filters.search && !room.name.toLowerCase().includes(filters.search.toLowerCase())) return false
    return true
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des chambres depuis la base de données...</p>
          <p className="text-xs text-gray-500 mt-2">msylla01 • 2025-10-03 10:09:14</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Erreur de chargement</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchRoomsFromAPI}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Réessayer
          </button>
          <div className="mt-4">
            <Link
              href={isConnected ? "/dashboard" : "/"}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              ← Retour {isConnected ? 'au dashboard' : 'à l\'accueil'}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Nos Chambres - Hotel Luxe</title>
        <meta name="description" content="Découvrez nos chambres d'exception avec données réelles" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-6">
              <Link
                href={isConnected ? "/dashboard" : "/"}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                <span>Retour {isConnected ? 'au dashboard' : 'à l\'accueil'}</span>
              </Link>
              
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">H</span>
                </div>
                <span className="font-semibold text-gray-900">Hotel Luxe</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  {rooms.length} chambres
                </span>
              </div>

              <div className="flex items-center space-x-4">
                {isConnected && user ? (
                  <>
                    <div className="flex items-center space-x-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        user.isActive ? 'bg-green-500' : 'bg-orange-500'
                      }`}>
                        <UserCircleIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className={`text-xs ${user.isActive ? 'text-green-600' : 'text-orange-600'}`}>
                          {user.isActive ? '✅ Compte actif' : '⚠️ Compte désactivé'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                      ❤️ {favoriteRooms.length} favoris
                    </div>
                    
                    <Link
                      href="/dashboard"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Mon Espace
                    </Link>
                  </>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Link
                      href="/auth/login"
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Se connecter
                    </Link>
                    <Link
                      href="/auth/register"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
                    >
                      S'inscrire
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Message pour visiteurs non connectés */}
        {!isConnected && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-blue-700">
                    👋 <strong>Bienvenue !</strong> Vous pouvez consulter toutes nos chambres. 
                    <Link href="/auth/login" className="font-medium underline ml-1">
                      Connectez-vous
                    </Link> ou 
                    <Link href="/auth/register" className="font-medium underline ml-1">
                      créez un compte
                    </Link> pour réserver et gérer vos favoris.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Alerte si compte désactivé */}
        {isConnected && user && !user.isActive && (
          <div className="bg-orange-50 border-l-4 border-orange-400 p-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-orange-700">
                    ⚠️ Votre compte est temporairement désactivé. Vous pouvez consulter les chambres mais 
                    <Link href="/auth/reactivate" className="font-medium underline ml-1">
                      réactivez votre compte
                    </Link> pour pouvoir réserver.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🏨 Nos Chambres d'Exception
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez notre collection de chambres premium. Données en temps réel depuis notre base PostgreSQL.
            </p>
            <div className="mt-4 flex items-center justify-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <span>🗄️</span>
                <span>{rooms.length} chambres en base</span>
              </div>
              {isConnected && (
                <div className="flex items-center space-x-1">
                  <span>❤️</span>
                  <span>{favoriteRooms.length} favoris</span>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <span>👤</span>
                <span>{isConnected ? `Connecté: ${user?.firstName}` : 'Visiteur'}</span>
              </div>
            </div>
          </motion.div>

          {/* Filtres */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-sm p-6 mb-8"
          >
            <div className="flex items-center space-x-4 mb-4">
              <FunnelIcon className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Filtrer les chambres</h2>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {rooms.length} chambres disponibles
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Recherche */}
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher une chambre..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  className="pl-9 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Type */}
              <select
                value={filters.type}
                onChange={(e) => setFilters({...filters, type: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tous les types</option>
                <option value="SINGLE">Simple</option>
                <option value="DOUBLE">Double</option>
                <option value="SUITE">Suite</option>
                <option value="FAMILY">Familiale</option>
                <option value="DELUXE">Deluxe</option>
              </select>

              {/* Capacité */}
              <select
                value={filters.capacity}
                onChange={(e) => setFilters({...filters, capacity: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Toutes capacités</option>
                <option value="1">1 personne</option>
                <option value="2">2+ personnes</option>
                <option value="3">3+ personnes</option>
                <option value="4">4+ personnes</option>
              </select>

              {/* Prix min */}
              <input
                type="number"
                placeholder="Prix min (€)"
                value={filters.minPrice}
                onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              {/* Prix max */}
              <input
                type="number"
                placeholder="Prix max (€)"
                value={filters.maxPrice}
                onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Résumé des filtres */}
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {filteredRooms.length} chambre(s) affichée(s) sur {rooms.length} disponibles
                {isConnected && favoriteRooms.length > 0 && (
                  <span className="ml-2 text-red-600">• ❤️ {favoriteRooms.length} favoris</span>
                )}
              </p>
              <button
                onClick={() => setFilters({type: '', minPrice: '', maxPrice: '', capacity: '', search: ''})}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Réinitialiser les filtres
              </button>
            </div>
          </motion.div>

          {/* Message si aucune chambre */}
          {rooms.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-white rounded-2xl shadow-sm"
            >
              <HomeIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune chambre en base de données
              </h3>
              <p className="text-gray-600 mb-4">
                Il semble que la base de données ne contienne aucune chambre active.
              </p>
              <button
                onClick={fetchRoomsFromAPI}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Recharger
              </button>
            </motion.div>
          )}

          {/* Grille des chambres */}
          {filteredRooms.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredRooms.map((room, index) => (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className={`bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-lg transition-all ${
                    isConnected && favoriteRooms.includes(room.id) ? 'ring-2 ring-red-200' : ''
                  }`}
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
                      {room.rating && (
                        <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1">
                          <StarIcon className="w-4 h-4 text-yellow-400" />
                          <span className="text-sm font-medium">{room.rating}</span>
                        </div>
                      )}
                      {isConnected && favoriteRooms.includes(room.id) && (
                        <div className="bg-red-500 rounded-full p-1">
                          <HeartIconSolid className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Contenu */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {room.name}
                          {isConnected && favoriteRooms.includes(room.id) && (
                            <HeartIconSolid className="w-4 h-4 text-red-500 inline ml-2" />
                          )}
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
                        <div className="text-2xl font-bold text-blue-600">
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
                            className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                          >
                            {amenity.includes('WiFi') && <WifiIcon className="w-3 h-3 mr-1" />}
                            {amenity.includes('TV') && <TvIcon className="w-3 h-3 mr-1" />}
                            {amenity.length > 20 ? amenity.slice(0, 20) + '...' : amenity}
                          </span>
                        ))}
                        {room.amenities.length > 3 && (
                          <span className="text-xs text-blue-600">
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
                          <CheckCircleIcon className="w-4 h-4" />
                          <span className="text-xs font-medium">Disponible</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="space-y-2">
                      <Link
                        href={`/rooms/${room.id}`}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center block"
                      >
                        {isConnected && user?.isActive 
                          ? 'Voir détails & Réserver' 
                          : isConnected 
                            ? 'Voir les détails' 
                            : 'Voir détails (Connexion pour réserver)'
                        }
                      </Link>
                      
                      {/* Bouton favori conditionnel */}
                      <button
                        onClick={() => toggleFavorite(room.id)}
                        className={`w-full border py-2 rounded-lg transition-colors text-sm font-medium ${
                          isConnected && favoriteRooms.includes(room.id) 
                            ? 'border-red-300 text-red-700 bg-red-50 hover:bg-red-100' 
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {isConnected ? (
                          favoriteRooms.includes(room.id) ? (
                            <>
                              <HeartIconSolid className="w-4 h-4 inline mr-1" />
                              Retirer des favoris
                            </>
                          ) : (
                            <>
                              <HeartIcon className="w-4 h-4 inline mr-1" />
                              Ajouter aux favoris
                            </>
                          )
                        ) : (
                          <>
                            <HeartIcon className="w-4 h-4 inline mr-1" />
                            Se connecter pour favoris
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Message si aucune chambre filtrée */}
          {rooms.length > 0 && filteredRooms.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <HomeIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune chambre ne correspond aux filtres
              </h3>
              <p className="text-gray-600 mb-4">
                Essayez de modifier vos critères de recherche
              </p>
              <button
                onClick={() => setFilters({type: '', minPrice: '', maxPrice: '', capacity: '', search: ''})}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Réinitialiser les filtres
              </button>
            </motion.div>
          )}

          {/* CTA selon statut connexion */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-12 text-center"
          >
            <div className="bg-white rounded-2xl shadow-sm p-8">
              {isConnected ? (
                <>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    🎯 Prêt à réserver votre séjour ?
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Vous avez trouvé la chambre parfaite ? Réservez-la dès maintenant !
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                      href="/dashboard"
                      className="w-full sm:w-auto bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                    >
                      🏠 Mon Dashboard
                    </Link>
                    <Link
                      href="/favorites"
                      className="w-full sm:w-auto border border-blue-600 text-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors font-semibold"
                    >
                      ❤️ Mes Favoris ({favoriteRooms.length})
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    🔑 Connectez-vous pour réserver
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Créez votre compte Hotel Luxe pour réserver en ligne, gérer vos favoris et accéder à votre historique.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                      href="/auth/register"
                      className="w-full sm:w-auto bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                    >
                      ✨ Créer mon compte
                    </Link>
                    <Link
                      href="/auth/login"
                      className="w-full sm:w-auto border border-blue-600 text-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors font-semibold"
                    >
                      🔑 Se connecter
                    </Link>
                  </div>
                </>
              )}
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="mt-16 text-center text-gray-500"
          >
            <p className="text-sm">
              Chambres Hotel Luxe • Accessibles à tous • Données PostgreSQL • msylla01 • 2025-10-03 10:09:14 UTC
            </p>
          </motion.div>
        </main>
      </div>
    </>
  )
}
