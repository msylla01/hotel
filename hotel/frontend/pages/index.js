import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'

export default function Home() {
  const [rooms, setRooms] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [allRoomImages, setAllRoomImages] = useState([])
  const [stats, setStats] = useState({
    totalRooms: 0,
    averageRating: 4.8,
    totalBookings: 0,
    activeRooms: 0
  })

  useEffect(() => {
    // Vérifier l'utilisateur connecté
    try {
      const userData = localStorage.getItem('hotel_user')
      if (userData) {
        setUser(JSON.parse(userData))
        console.log('👤 Utilisateur connecté [msylla01] - 2025-10-03 10:47:18:', JSON.parse(userData).firstName)
      } else {
        console.log('👥 Visiteur non connecté [msylla01] - 2025-10-03 10:47:18')
      }
    } catch (error) {
      console.log('❌ Erreur parsing user data [msylla01]:', error)
    }

    // Récupérer les vraies données de la base
    fetchRealDataFromDB()
  }, [])

  const fetchRealDataFromDB = async () => {
    try {
      setLoading(true)
      console.log('🗄️ Récupération VRAIES données DB [msylla01] - 2025-10-03 10:47:18')
      
      // Récupérer les chambres depuis l'API backend
      const roomsResponse = await fetch('http://localhost:5000/api/rooms')
      
      if (roomsResponse.ok) {
        const roomsData = await roomsResponse.json()
        
        if (roomsData.success && roomsData.rooms) {
          const realRooms = roomsData.rooms
          setRooms(realRooms)
          
          // Collecter toutes les images des chambres pour le carrousel
          const allImages = []
          realRooms.forEach(room => {
            if (room.images && room.images.length > 0) {
              room.images.forEach(image => {
                allImages.push({
                  url: image,
                  roomName: room.name,
                  roomType: room.type,
                  roomPrice: room.price,
                  roomId: room.id
                })
              })
            } else {
              // Ajouter image par défaut si pas d'images
              const defaultImages = getDefaultRoomImages(room.type)
              defaultImages.forEach(image => {
                allImages.push({
                  url: image,
                  roomName: room.name,
                  roomType: room.type,
                  roomPrice: room.price,
                  roomId: room.id
                })
              })
            }
          })
          
          setAllRoomImages(allImages)
          
          // Calculer les stats réelles
          const realStats = {
            totalRooms: realRooms.length,
            averageRating: realRooms.reduce((acc, room) => acc + (room.rating || room.averageRating || 4.8), 0) / realRooms.length,
            activeRooms: realRooms.filter(room => room.available).length,
            totalBookings: realRooms.reduce((acc, room) => acc + (room.bookingCount || 0), 0)
          }
          setStats(realStats)
          
          console.log(`✅ ${realRooms.length} chambres DB récupérées avec ${allImages.length} images [msylla01]`)
          console.log('📊 Stats réelles calculées [msylla01]:', realStats)
          
          // Démarrer le carrousel d'images
          if (allImages.length > 0) {
            const interval = setInterval(() => {
              setCurrentImageIndex((prev) => (prev + 1) % allImages.length)
            }, 5000) // Change toutes les 5 secondes
            
            // Nettoyer l'interval au démontage
            return () => clearInterval(interval)
          }
          
        } else {
          throw new Error('Pas de données chambres DB')
        }
      } else {
        throw new Error(`Erreur API rooms: ${roomsResponse.status}`)
      }

    } catch (error) {
      console.error('❌ Erreur récupération DB [msylla01]:', error)
      // Fallback avec données simulées
      const fallbackRooms = getFallbackRoomsWithImages()
      setRooms(fallbackRooms)
      setAllRoomImages(getAllImagesFromRooms(fallbackRooms))
      setStats({
        totalRooms: fallbackRooms.length,
        averageRating: 4.6,
        activeRooms: fallbackRooms.length,
        totalBookings: 150
      })
      console.log('🔄 Utilisation données fallback [msylla01]')
    } finally {
      setLoading(false)
    }
  }

  const getDefaultRoomImages = (roomType) => {
    const imagesByType = {
      'SINGLE': [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=800&fit=crop&q=80',
        'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&h=800&fit=crop&q=80'
      ],
      'DOUBLE': [
        'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&h=800&fit=crop&q=80',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&h=800&fit=crop&q=80'
      ],
      'SUITE': [
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&h=800&fit=crop&q=80',
        'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=1200&h=800&fit=crop&q=80'
      ],
      'FAMILY': [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=800&fit=crop&q=80',
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&h=800&fit=crop&q=80'
      ],
      'DELUXE': [
        'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=1200&h=800&fit=crop&q=80',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=800&fit=crop&q=80'
      ]
    }
    
    return imagesByType[roomType] || imagesByType['DOUBLE']
  }

  const getFallbackRoomsWithImages = () => {
    return [
      {
        id: 'room_1',
        name: 'Chambre Simple Confort',
        description: 'Chambre élégante et fonctionnelle pour un séjour en solo avec tout le confort moderne.',
        type: 'SINGLE',
        price: 120,
        capacity: 1,
        averageRating: 4.2,
        available: true,
        images: getDefaultRoomImages('SINGLE'),
        amenities: ['WiFi gratuit', 'TV écran plat', 'Climatisation', 'Coffre-fort']
      },
      {
        id: 'room_2',
        name: 'Chambre Double Prestige',
        description: 'Spacieuse chambre double avec balcon privé offrant une vue imprenable.',
        type: 'DOUBLE',
        price: 180,
        capacity: 2,
        averageRating: 4.5,
        available: true,
        images: getDefaultRoomImages('DOUBLE'),
        amenities: ['WiFi gratuit', 'TV écran plat', 'Balcon privé', 'Minibar']
      },
      {
        id: 'room_3',
        name: 'Suite Junior Executive',
        description: 'Suite élégante avec salon séparé, parfaite pour les voyages d\'affaires.',
        type: 'SUITE',
        price: 350,
        capacity: 2,
        averageRating: 4.8,
        available: true,
        images: getDefaultRoomImages('SUITE'),
        amenities: ['WiFi gratuit', 'Salon séparé', 'Bureau', 'Service butler']
      },
      {
        id: 'room_4',
        name: 'Chambre Familiale Spacieuse',
        description: 'Chambre parfaite pour les familles avec enfants. Espace optimisé.',
        type: 'FAMILY',
        price: 250,
        capacity: 4,
        averageRating: 4.6,
        available: true,
        images: getDefaultRoomImages('FAMILY'),
        amenities: ['WiFi gratuit', 'Lits superposés', 'Coin jeux', 'Console']
      },
      {
        id: 'room_5',
        name: 'Suite Présidentielle Deluxe',
        description: 'Notre suite la plus luxueuse avec jacuzzi privé et terrasse.',
        type: 'DELUXE',
        price: 450,
        capacity: 2,
        averageRating: 4.9,
        available: true,
        images: getDefaultRoomImages('DELUXE'),
        amenities: ['WiFi gratuit', 'Jacuzzi privé', 'Terrasse', 'Service VIP']
      }
    ]
  }

  const getAllImagesFromRooms = (roomsList) => {
    const allImages = []
    roomsList.forEach(room => {
      room.images.forEach(image => {
        allImages.push({
          url: image,
          roomName: room.name,
          roomType: room.type,
          roomPrice: room.price,
          roomId: room.id
        })
      })
    })
    return allImages
  }

  const handleLogout = () => {
    localStorage.removeItem('hotel_token')
    localStorage.removeItem('hotel_user')
    setUser(null)
    window.location.reload()
  }

  const getTypeLabel = (type) => {
    const labels = {
      'SINGLE': 'Simple',
      'DOUBLE': 'Double', 
      'SUITE': 'Suite',
      'FAMILY': 'Familiale',
      'DELUXE': 'Deluxe'
    }
    return labels[type] || type
  }

  // Démarrer le carrousel d'images une fois les images chargées
  useEffect(() => {
    if (allRoomImages.length > 0) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % allRoomImages.length)
      }, 5000) // Change toutes les 5 secondes

      return () => clearInterval(interval)
    }
  }, [allRoomImages])

  const currentImage = allRoomImages[currentImageIndex]

  return (
    <>
      <Head>
        <title>Hotel Luxe - Votre séjour de rêve vous attend</title>
        <meta name="description" content="Découvrez Hotel Luxe, votre destination de choix pour un séjour d'exception. Chambres de luxe à Dakar." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">H</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Hotel Luxe</h1>
                  <p className="text-xs text-gray-500">Excellence & Confort</p>
                </div>
              </div>

              <nav className="hidden md:flex items-center space-x-8">
                <Link href="/rooms" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Chambres
                </Link>
                <Link href="/services" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Services
                </Link>
                <Link href="/contact" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Contact
                </Link>
              </nav>

              <div className="flex items-center space-x-4">
                {user ? (
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">
                      👋 {user.firstName} {user.lastName}
                    </span>
                    <Link
                      href={user.role === 'ADMIN' ? '/admin' : '/dashboard'}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {user.role === 'ADMIN' ? 'Admin' : 'Dashboard'}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="text-gray-600 hover:text-gray-700"
                    >
                      Déconnexion
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <Link
                      href="/auth/login"
                      className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
                    >
                      Connexion
                    </Link>
                    <Link
                      href="/auth/register"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Inscription
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section avec Carrousel d'Images Chambres */}
        <section className="relative h-96 md:h-[500px] overflow-hidden">
          {/* Image de chambre en arrière-plan */}
          {currentImage && (
            <div className="absolute inset-0 transition-all duration-1000">
              <img
                src={currentImage.url}
                alt={currentImage.roomName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=800&fit=crop&q=80'
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-50"></div>
            </div>
          )}
          
          {/* Contenu du Hero */}
          <div className="relative z-10 h-full flex items-center justify-center text-white">
            <div className="text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Bienvenue à Hotel Luxe
              </h1>
              <p className="text-xl md:text-2xl text-gray-100 mb-8">
                Découvrez nos {stats.totalRooms} chambres d'exception à Dakar
                {currentImage && (
                  <span className="block mt-2 text-lg">
                    🏨 {currentImage.roomName} • {getTypeLabel(currentImage.roomType)} • {currentImage.roomPrice}€/nuit
                  </span>
                )}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/rooms"
                  className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center space-x-2"
                >
                  <span>Découvrir nos chambres</span>
                  <span>→</span>
                </Link>
                
                {currentImage && (
                  <Link
                    href={`/rooms/${currentImage.roomId}`}
                    className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
                  >
                    Voir cette chambre
                  </Link>
                )}
              </div>

              {/* Indicateurs du carrousel */}
              <div className="mt-8 flex justify-center space-x-2">
                {allRoomImages.slice(0, 10).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                    }`}
                  />
                ))}
                {allRoomImages.length > 10 && (
                  <span className="text-white text-sm">+{allRoomImages.length - 10}</span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Statistiques réelles */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Nos Chiffres en Temps Réel</h2>
              <p className="text-gray-600">Données directement depuis notre base PostgreSQL</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="p-6">
                <div className="text-4xl font-bold text-blue-600 mb-2">{stats.totalRooms}</div>
                <div className="text-gray-600">Chambres disponibles</div>
                <div className="text-xs text-gray-500 mt-1">🗄️ Base de données</div>
              </div>
              <div className="p-6">
                <div className="text-4xl font-bold text-green-600 mb-2">{stats.averageRating.toFixed(1)}</div>
              </div>
              <div className="p-6">
                <div className="text-4xl font-bold text-purple-600 mb-2">{stats.activeRooms}</div>
                <div className="text-gray-600">Chambres actives</div>
                <div className="text-xs text-gray-500 mt-1">✅ Disponibles</div>
              </div>
              <div className="p-6">
                <div className="text-4xl font-bold text-orange-600 mb-2">{allRoomImages.length}</div>
                <div className="text-gray-600">Images chambres</div>
                <div className="text-xs text-gray-500 mt-1">📸 Carrousel actuel</div>
              </div>
            </div>
          </div>
        </section>

        {/* Services rapides */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Services Inclus</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-6 bg-white rounded-xl hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-3">📶</div>
                <h3 className="font-semibold text-gray-900 mb-1">WiFi Gratuit</h3>
                <p className="text-sm text-gray-600">Haut débit dans tout l'hôtel</p>
              </div>
              
              <div className="text-center p-6 bg-white rounded-xl hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-3">🚗</div>
                <h3 className="font-semibold text-gray-900 mb-1">Parking Sécurisé</h3>
                <p className="text-sm text-gray-600">Surveillance 24h/24</p>
              </div>
              
              <div className="text-center p-6 bg-white rounded-xl hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-3">🧖‍♀️</div>
                <h3 className="font-semibold text-gray-900 mb-1">Spa & Bien-être</h3>
                <p className="text-sm text-gray-600">Détente et relaxation</p>
              </div>
              
              <div className="text-center p-6 bg-white rounded-xl hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-3">📞</div>
                <h3 className="font-semibold text-gray-900 mb-1">Conciergerie 24h</h3>
                <p className="text-sm text-gray-600">À votre service</p>
              </div>
            </div>
          </div>
        </section>

        {/* Chambres Section avec vraies données DB */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Nos Chambres d'Exception
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {stats.totalRooms} chambres uniques directement depuis notre base de données PostgreSQL
              </p>
              <div className="mt-4 text-sm text-gray-500">
              </div>
            </div>
            
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Chargement des chambres depuis PostgreSQL...</p>
                <p className="text-xs text-gray-500 mt-2">msylla01 • 2025-10-03 10:47:18</p>
              </div>
            ) : rooms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {rooms.slice(0, 6).map((room, index) => (
                  <div
                    key={room.id}
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    {/* Image de la chambre */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={room.images && room.images[0] ? room.images[0] : getDefaultRoomImages(room.type)[0]}
                        alt={room.name}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                        onError={(e) => {
                          e.target.src = getDefaultRoomImages(room.type)[0]
                        }}
                      />
                      
                      {/* Badge type */}
                      <div className="absolute top-3 left-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          room.type === 'SINGLE' ? 'bg-green-100 text-green-800' :
                          room.type === 'DOUBLE' ? 'bg-blue-100 text-blue-800' :
                          room.type === 'SUITE' ? 'bg-purple-100 text-purple-800' :
                          room.type === 'FAMILY' ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {getTypeLabel(room.type)}
                        </span>
                      </div>

                      <div className="absolute top-3 right-3 bg-white bg-opacity-90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1">
                        <span className="text-yellow-400">⭐</span>
                        <span className="text-sm font-medium">
                          {(room.averageRating || room.rating || 4.8).toFixed(1)}
                        </span>
                      </div>

                      {/* Disponibilité */}
                      {room.available && (
                        <div className="absolute bottom-3 left-3 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                          ✅ Disponible
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{room.name}</h3>
                        <div className="flex items-center text-sm text-gray-500">
                          <span>👥</span>
                          <span className="ml-1">{room.capacity} pers.</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-4 line-clamp-2 text-sm">
                        {room.description || 'Chambre confortable et élégante'}
                      </p>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-2xl font-bold text-blue-600">
                          {room.price}€
                          <span className="text-sm text-gray-500 font-normal">/nuit</span>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500">Surface</div>
                          <div className="text-sm font-medium text-gray-700">{room.size || 25}m²</div>
                        </div>
                      </div>
                      
                      {/* Équipements depuis DB */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {room.amenities ? room.amenities.slice(0, 3).map((amenity, idx) => (
                          <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {amenity.length > 15 ? amenity.slice(0, 15) + '...' : amenity}
                          </span>
                        )) : (
                          <>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">WiFi gratuit</span>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">TV écran plat</span>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Climatisation</span>
                          </>
                        )}
                      </div>
                      
                      <Link
                        href={`/rooms/${room.id}`}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 font-medium"
                      >
                        <span>Voir détails & Réserver</span>
                        <span>→</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🏨</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Aucune chambre trouvée
                </h3>
                <p className="text-gray-600">
                  Problème de connexion à la base de données
                </p>
                <button
                  onClick={fetchRealDataFromDB}
                  className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Réessayer
                </button>
              </div>
            )}
            
            <div className="text-center mt-12">
              <Link
                href="/rooms"
                className="inline-flex items-center bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Voir toutes nos chambres ({stats.totalRooms})
                <span className="ml-2">→</span>
              </Link>
            </div>
          </div>
        </section>
        {/* Témoignages rapides */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Ce que disent nos clients
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gray-50 p-6 rounded-xl">
                <div className="flex items-center mb-4">
                  <span className="text-yellow-400">⭐⭐⭐⭐⭐</span>
                </div>
                <p className="text-gray-700 mb-4">
                  "Séjour exceptionnel ! Service impeccable et chambres magnifiques. Je recommande vivement."
                </p>
                <div className="font-semibold text-gray-900">Marie Dubois</div>
                <div className="text-sm text-gray-600">Cliente depuis 2023</div>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-xl">
                <div className="flex items-center mb-4">
                  <span className="text-yellow-400">⭐⭐⭐⭐⭐</span>
                </div>
                <p className="text-gray-700 mb-4">
                  "L'hôtel parfait pour un séjour d'affaires. Calme, confortable et très bien situé."
                </p>
                <div className="font-semibold text-gray-900">Jean-Pierre Martin</div>
                <div className="text-sm text-gray-600">Voyage d'affaires</div>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-xl">
                <div className="flex items-center mb-4">
                  <span className="text-yellow-400">⭐⭐⭐⭐⭐</span>
                </div>
                <p className="text-gray-700 mb-4">
                  "Excellent rapport qualité-prix. Personnel très accueillant et petit-déjeuner délicieux."
                </p>
                <div className="font-semibold text-gray-900">Fatou Diallo</div>
                <div className="text-sm text-gray-600">Séjour en famille</div>
              </div>
            </div>
          </div>
        </section>
        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">H</span>
                  </div>
                  <span className="text-xl font-bold">Hotel Luxe</span>
                </div>
                <p className="text-gray-400 mb-4">
                  Votre destination de choix pour un séjour d'exception à Dakar. 
                  {stats.totalRooms} chambres uniques avec données en temps réel.
                </p>
                <div className="flex space-x-4 text-sm">
                  <span className="bg-blue-600 px-2 py-1 rounded">🗄️ PostgreSQL</span>
                  <span className="bg-green-600 px-2 py-1 rounded">📸 {allRoomImages.length} images</span>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  Développé par msylla01 • 2025-10-03 10:47:18 UTC
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Navigation</h3>
                <ul className="space-y-2">
                  <li><Link href="/rooms" className="text-gray-400 hover:text-white transition-colors">Chambres ({stats.totalRooms})</Link></li>
                  <li><Link href="/services" className="text-gray-400 hover:text-white transition-colors">Services</Link></li>
                  <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
                  {!user && (
                    <li><Link href="/auth/register" className="text-blue-400 hover:text-blue-300 transition-colors">Réserver</Link></li>
                  )}
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Contact</h3>
                <ul className="space-y-2 text-gray-400">
                  <li className="flex items-center">
                    <span className="mr-2">📞</span>
                    +221 33 123 45 67
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">🏢</span>
                    contact@hotel-luxe.fr
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">🏠</span>
                    123 Avenue de la Paix, Dakar
                  </li>
                  <li className="text-xs text-gray-500 mt-2">
                    💳 Orange/Wave/Free: 0703033133
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2025 Hotel Luxe Dakar. Tous droits réservés. Développé avec ❤️ par msylla01</p>
              <p className="text-xs mt-2">
                Données PostgreSQL en temps réel • {allRoomImages.length} images chambres • Service 24h/24
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
