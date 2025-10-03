import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  HomeIcon,
  PlusIcon,
  PencilIcon,
  EyeIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon,
  StarIcon,
  CurrencyEuroIcon,
  UsersIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'

export default function AdminRooms() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({})

  useEffect(() => {
    // Vérifier l'authentification admin
    const token = localStorage.getItem('hotel_token')
    const userData = localStorage.getItem('hotel_user')
    
    if (!token || !userData) {
      router.push('/auth/login')
      return
    }

    const user = JSON.parse(userData)
    if (user.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }

    setUser(user)
    fetchRooms()
  }, [router])

  const fetchRooms = async () => {
    try {
      setLoading(true)
      
      const response = await fetch('http://localhost:5000/api/rooms')
      
      if (response.ok) {
        const data = await response.json()
        const rooms = data.rooms || []
        
        // Récupérer les stats reviews pour chaque chambre
        const roomsWithStats = await Promise.all(
          rooms.map(async (room) => {
            try {
              const reviewsResponse = await fetch(`http://localhost:5000/api/reviews/room/${room.id}/stats`)
              const reviewsData = await reviewsResponse.json()
              
              return {
                ...room,
                reviewStats: reviewsData.success ? reviewsData.stats : {
                  totalReviews: 0,
                  averageRating: '0.0',
                  verifiedReviews: 0
                }
              }
            } catch (error) {
              return {
                ...room,
                reviewStats: {
                  totalReviews: 0,
                  averageRating: '0.0',
                  verifiedReviews: 0
                }
              }
            }
          })
        )
        
        setRooms(roomsWithStats)
        
        // Calculer les stats
        const statsData = {
          total: rooms.length,
          active: rooms.filter(r => r.isActive !== false).length,
          inactive: rooms.filter(r => r.isActive === false).length,
          totalRevenue: rooms.reduce((sum, r) => sum + (r.price * 30), 0), // Estimation mensuelle
          averagePrice: rooms.length > 0 ? rooms.reduce((sum, r) => sum + r.price, 0) / rooms.length : 0,
          totalReviews: roomsWithStats.reduce((sum, r) => sum + (r.reviewStats.totalReviews || 0), 0)
        }
        setStats(statsData)
        
        console.log(`✅ ${rooms.length} chambres chargées [msylla01] - 2025-10-03 17:51:35`)
      }
    } catch (error) {
      console.error('❌ Erreur chargement chambres [msylla01]:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleRoomStatus = async (roomId, currentStatus) => {
    try {
      const token = localStorage.getItem('hotel_token')
      const response = await fetch(`http://localhost:5000/api/rooms/${roomId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !currentStatus })
      })

      if (response.ok) {
        setRooms(rooms.map(r => 
          r.id === roomId ? { ...r, isActive: !currentStatus } : r
        ))
        alert(`✅ Chambre ${!currentStatus ? 'activée' : 'désactivée'} avec succès`)
      } else {
        alert('❌ Erreur lors de la modification')
      }
    } catch (error) {
      console.error('❌ Erreur modification statut [msylla01]:', error)
      alert('❌ Erreur de connexion')
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const getTypeColor = (type) => {
    const colors = {
      'SINGLE': 'bg-green-100 text-green-800',
      'DOUBLE': 'bg-blue-100 text-blue-800',
      'SUITE': 'bg-purple-100 text-purple-800',
      'FAMILY': 'bg-orange-100 text-orange-800',
      'DELUXE': 'bg-red-100 text-red-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
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

  const renderStars = (rating) => {
    const numRating = parseFloat(rating) || 0
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`w-4 h-4 ${i < numRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des chambres...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Gestion Chambres - Admin Hotel Luxe</title>
        <meta name="description" content="Gestion des chambres - Dashboard administrateur" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <Link href="/admin" className="flex items-center text-gray-600 hover:text-red-600">
                  <ArrowLeftIcon className="w-5 h-5 mr-2" />
                  Dashboard Admin
                </Link>
                <div className="text-gray-300">•</div>
                <h1 className="text-xl font-bold text-gray-900">Gestion Chambres</h1>
              </div>

              <div className="flex items-center space-x-4">
                <Link
                  href="/admin/rooms/new"
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                >
                  <PlusIcon className="w-5 h-5" />
                  <span>Nouvelle Chambre</span>
                </Link>
                <span className="text-sm text-gray-600">
                  👤 {user?.firstName}
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <BuildingOfficeIcon className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats.total || 0}</p>
                  <p className="text-gray-600 text-sm">Total Chambres</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <CheckCircleIcon className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats.active || 0}</p>
                  <p className="text-gray-600 text-sm">Actives</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <CurrencyEuroIcon className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{Math.round(stats.averagePrice || 0)}€</p>
                  <p className="text-gray-600 text-sm">Prix Moyen</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <StarIcon className="w-8 h-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats.totalReviews || 0}</p>
                  <p className="text-gray-600 text-sm">Total Avis</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <CurrencyEuroIcon className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue || 0)}</p>
                  <p className="text-gray-600 text-sm">Revenus Est. /mois</p>
                </div>
              </div>
            </div>
          </div>

          {/* Liste des chambres */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Chambres ({rooms.length})
              </h3>
              <div className="text-sm text-gray-500">
                Données mises à jour • 2025-10-03 17:51:35
              </div>
            </div>

            {rooms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {rooms.map((room) => (
                  <motion.div
                    key={room.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {/* Image */}
                    <div className="relative h-48 bg-gray-200">
                      {room.images && room.images[0] ? (
                        <img
                          src={room.images[0]}
                          alt={room.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-300">
                          <HomeIcon className="w-16 h-16 text-gray-500" />
                        </div>
                      )}
                      
                      {/* Badges */}
                      <div className="absolute top-3 left-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(room.type)}`}>
                          {getTypeLabel(room.type)}
                        </span>
                      </div>

                      <div className="absolute top-3 right-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          room.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {room.isActive !== false ? '✅ Active' : '❌ Inactive'}
                        </span>
                      </div>
                    </div>

                    {/* Contenu */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">{room.name}</h4>
                        <div className="text-right">
                          <p className="text-xl font-bold text-red-600">{formatCurrency(room.price)}</p>
                          <p className="text-xs text-gray-500">par nuit</p>
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {room.description || 'Aucune description'}
                      </p>

                      {/* Stats */}
                      <div className="flex items-center justify-between mb-3 text-sm">
                        <div className="flex items-center space-x-1">
                          <UsersIcon className="w-4 h-4 text-gray-400" />
                          <span>{room.capacity} pers.</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <BuildingOfficeIcon className="w-4 h-4 text-gray-400" />
                          <span>{room.size || 25}m²</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <StarIcon className="w-4 h-4 text-yellow-400" />
                          <span>{room.reviewStats.totalReviews} avis</span>
                        </div>
                      </div>

                      {/* Reviews */}
                      {room.reviewStats.totalReviews > 0 && (
                        <div className="mb-3 p-2 bg-yellow-50 rounded">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1">
                              <div className="flex">
                                {renderStars(room.reviewStats.averageRating)}
                              </div>
                              <span className="text-sm font-medium">
                                {room.reviewStats.averageRating}/5
                              </span>
                            </div>
                            <span className="text-xs text-gray-600">
                              {room.reviewStats.verifiedReviews} vérifiés
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => router.push(`/rooms/${room.id}`)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Voir détails"
                          >
                            <EyeIcon className="w-5 h-5" />
                          </button>
                          
                          <button
                            onClick={() => router.push(`/admin/rooms/${room.id}/edit`)}
                            className="text-gray-600 hover:text-gray-800"
                            title="Modifier"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>

                          <button
                            onClick={() => toggleRoomStatus(room.id, room.isActive !== false)}
                            className={room.isActive !== false ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}
                            title={room.isActive !== false ? 'Désactiver' : 'Activer'}
                          >
                            {room.isActive !== false ? <XCircleIcon className="w-5 h-5" /> : <CheckCircleIcon className="w-5 h-5" />}
                          </button>
                        </div>

                        <div className="text-xs text-gray-500">
                          ID: {room.id.slice(-8)}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <HomeIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Aucune chambre trouvée</p>
                <Link
                  href="/admin/rooms/new"
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors inline-flex items-center space-x-2"
                >
                  <PlusIcon className="w-5 h-5" />
                  <span>Ajouter une chambre</span>
                </Link>
              </div>
            )}
          </div>

          {/* Footer info */}
          <div className="mt-8 text-center text-gray-500 text-sm">
            Gestion Chambres • Données Prisma PostgreSQL • msylla01 • 2025-10-03 17:51:35
          </div>
        </main>
      </div>
    </>
  )
}
