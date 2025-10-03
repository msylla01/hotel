import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  ArrowLeftIcon,
  PencilIcon,
  EyeIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  StarIcon,
  CurrencyEuroIcon,
  UsersIcon,
  HomeIcon,
  CalendarDaysIcon,
  ChatBubbleBottomCenterTextIcon
} from '@heroicons/react/24/outline'

export default function RoomDetails() {
  const router = useRouter()
  const { id } = router.query
  const [room, setRoom] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('details')

  useEffect(() => {
    if (id) {
      fetchRoomDetails()
    }
  }, [id])

  const fetchRoomDetails = async () => {
    try {
      setLoading(true)
      setError('')

      console.log('🏨 Récupération détails chambre [msylla01] - 2025-10-03 18:25:04:', id)

      const response = await fetch(`http://localhost:5000/api/rooms/${id}`)
      const data = await response.json()

      if (response.ok && data.success) {
        setRoom(data.room)
        console.log('✅ Détails chambre récupérés [msylla01]')
      } else {
        throw new Error(data.message || 'Erreur de récupération')
      }
    } catch (error) {
      console.error('❌ Erreur récupération détails chambre [msylla01]:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleRoomStatus = async () => {
    if (!room) return

    try {
      const token = localStorage.getItem('hotel_token')
      const response = await fetch(`http://localhost:5000/api/rooms/${room.id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !room.isActive })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setRoom({ ...room, isActive: !room.isActive })
        alert(`✅ Chambre ${!room.isActive ? 'activée' : 'désactivée'} avec succès`)
      } else {
        alert(`❌ Erreur: ${data.message}`)
      }
    } catch (error) {
      console.error('❌ Erreur modification statut [msylla01]:', error)
      alert('❌ Erreur de connexion')
    }
  }

  const deleteRoom = async () => {
    if (!room) return

    const confirmDelete = window.confirm(
      `⚠️ Êtes-vous sûr de vouloir supprimer définitivement la chambre "${room.name}" ?\n\nCette action est irréversible et supprimera également :\n- Toutes les réservations liées\n- Tous les avis clients\n- Tous les paiements associés\n\nTapez "SUPPRIMER" pour confirmer.`
    )

    if (confirmDelete !== 'SUPPRIMER') {
      return
    }

    try {
      const token = localStorage.getItem('hotel_token')
      const response = await fetch(`http://localhost:5000/api/rooms/${room.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (response.ok && data.success) {
        alert('✅ Chambre supprimée avec succès')
        router.push('/admin/rooms')
      } else {
        alert(`❌ Erreur: ${data.message}`)
      }
    } catch (error) {
      console.error('❌ Erreur suppression chambre [msylla01]:', error)
      alert('❌ Erreur de connexion')
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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

  const getTypeLabel = (type) => {
    const labels = {
      'SINGLE': 'Chambre Simple',
      'DOUBLE': 'Chambre Double',
      'SUITE': 'Suite',
      'FAMILY': 'Chambre Familiale',
      'DELUXE': 'Chambre Deluxe'
    }
    return labels[type] || type
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des détails...</p>
        </div>
      </div>
    )
  }

  if (error || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-gray-600 mb-4">Erreur de chargement de la chambre</p>
          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
          <div className="space-x-4">
            <button
              onClick={fetchRoomDetails}
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
        <title>{room.name} - Admin Hotel Luxe</title>
        <meta name="description" content={`Détails et gestion de la chambre ${room.name}`} />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <Link href="/admin/rooms" className="flex items-center text-gray-600 hover:text-red-600 transition-colors">
                  <ArrowLeftIcon className="w-5 h-5 mr-2" />
                  Gestion Chambres
                </Link>
                <div className="text-gray-300">•</div>
                <h1 className="text-xl font-bold text-gray-900">{room.name}</h1>
              </div>

              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  room.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {room.isActive ? '✅ Active' : '❌ Inactive'}
                </span>
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">👑 Admin</span>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* En-tête chambre */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm p-8 mb-8"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-6">
                {/* Image principale */}
                <div className="w-32 h-32 bg-gray-200 rounded-xl overflow-hidden">
                  {room.images && room.images[0] ? (
                    <img
                      src={room.images[0]}
                      alt={room.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300'
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <HomeIcon className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Infos principales */}
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h2 className="text-2xl font-bold text-gray-900">{room.name}</h2>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {getTypeLabel(room.type)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <CurrencyEuroIcon className="w-5 h-5 text-gray-400" />
                      <span className="text-lg font-bold text-green-600">{formatCurrency(room.price)}</span>
                      <span className="text-gray-500">/nuit</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <UsersIcon className="w-5 h-5 text-gray-400" />
                      <span>{room.capacity} pers.</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <HomeIcon className="w-5 h-5 text-gray-400" />
                      <span>{room.size || 25}m²</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <StarIcon className="w-5 h-5 text-yellow-400" />
                      <span>{room.averageRating}/5</span>
                      <span className="text-gray-500">({room.totalReviews})</span>
                    </div>
                  </div>

                  {room.description && (
                    <p className="text-gray-600 max-w-2xl">{room.description}</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-3">
                <Link
                  href={`/rooms/${room.id}`}
                  target="_blank"
                  className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors"
                  title="Voir côté client"
                >
                  <EyeIcon className="w-5 h-5" />
                </Link>

                <Link
                  href={`/admin/rooms/${room.id}/edit`}
                  className="bg-gray-600 text-white p-3 rounded-lg hover:bg-gray-700 transition-colors"
                  title="Modifier"
                >
                  <PencilIcon className="w-5 h-5" />
                </Link>

                <button
                  onClick={toggleRoomStatus}
                  className={`p-3 rounded-lg transition-colors ${
                    room.isActive 
                      ? 'bg-red-600 text-white hover:bg-red-700' 
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                  title={room.isActive ? 'Désactiver' : 'Activer'}
                >
                  {room.isActive ? <XCircleIcon className="w-5 h-5" /> : <CheckCircleIcon className="w-5 h-5" />}
                </button>

                <button
                  onClick={deleteRoom}
                  className="bg-red-600 text-white p-3 rounded-lg hover:bg-red-700 transition-colors"
                  title="Supprimer"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <CalendarDaysIcon className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{room.totalBookings}</p>
                  <p className="text-gray-600 text-sm">Réservations</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <CurrencyEuroIcon className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(room.totalRevenue)}</p>
                  <p className="text-gray-600 text-sm">Revenus totaux</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <ChatBubbleBottomCenterTextIcon className="w-8 h-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{room.totalReviews}</p>
                  <p className="text-gray-600 text-sm">Avis clients</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <StarIcon className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{room.averageRating}/5</p>
                  <p className="text-gray-600 text-sm">Note moyenne</p>
                </div>
              </div>
            </div>
          </div>

          {/* Onglets */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'details', label: '📋 Détails', count: null },
                  { id: 'bookings', label: '📅 Réservations', count: room.totalBookings },
                  { id: 'reviews', label: '⭐ Avis', count: room.totalReviews },
                  { id: 'images', label: '📸 Images', count: room.images?.length || 0 }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-red-500 text-red-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.label}
                    {tab.count !== null && (
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                        activeTab === tab.id ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {/* Onglet Détails */}
              {activeTab === 'details' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Informations générales</h3>
                      <dl className="space-y-2">
                        <div className="flex justify-between">
                          <dt className="text-gray-600">ID:</dt>
                          <dd className="font-mono text-sm">{room.id}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Type:</dt>
                          <dd className="font-medium">{getTypeLabel(room.type)}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Prix:</dt>
                          <dd className="font-bold text-green-600">{formatCurrency(room.price)}/nuit</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Capacité:</dt>
                          <dd>{room.capacity} personne(s)</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Surface:</dt>
                          <dd>{room.size || 'Non spécifiée'}m²</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Statut:</dt>
                          <dd>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              room.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {room.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Créée le:</dt>
                          <dd>{formatDate(room.createdAt)}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Modifiée le:</dt>
                          <dd>{formatDate(room.updatedAt)}</dd>
                        </div>
                      </dl>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Équipements</h3>
                      <div className="flex flex-wrap gap-2">
                        {room.amenities && room.amenities.length > 0 ? (
                          room.amenities.map((amenity, index) => (
                            <span
                              key={index}
                              className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                            >
                              {amenity}
                            </span>
                          ))
                        ) : (
                          <p className="text-gray-500">Aucun équipement spécifié</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {room.description && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                      <p className="text-gray-700 leading-relaxed">{room.description}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Onglet Réservations */}
              {activeTab === 'bookings' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Réservations récentes ({room.bookings?.length || 0})
                  </h3>
                  {room.bookings && room.bookings.length > 0 ? (
                    <div className="space-y-4">
                      {room.bookings.map(booking => (
                        <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-900">
                                {booking.user.firstName} {booking.user.lastName}
                              </p>
                              <p className="text-sm text-gray-600">{booking.user.email}</p>
                              <p className="text-sm text-gray-500">
                                Du {formatDate(booking.checkIn)} au {formatDate(booking.checkOut)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-green-600">
                                {formatCurrency(booking.totalAmount)}
                              </p>
                              <p className={`text-sm px-2 py-1 rounded ${
                                booking.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                                booking.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                booking.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {booking.status}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">Aucune réservation pour cette chambre</p>
                  )}
                </div>
              )}

              {/* Onglet Avis */}
              {activeTab === 'reviews' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Avis clients ({room.reviews?.length || 0})
                  </h3>
                  {room.reviews && room.reviews.length > 0 ? (
                    <div className="space-y-4">
                      {room.reviews.map(review => (
                        <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium text-gray-900">
                                {review.user.firstName} {review.user.lastName}
                              </p>
                              <div className="flex items-center space-x-2">
                                <div className="flex">
                                  {renderStars(review.rating)}
                                </div>
                                <span className="text-sm text-gray-600">
                                  {formatDate(review.createdAt)}
                                </span>
                                {review.verified && (
                                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                    ✅ Vérifié
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          {review.title && (
                            <h4 className="font-medium text-gray-900 mb-1">{review.title}</h4>
                          )}
                          {review.comment && (
                            <p className="text-gray-700 mb-2">{review.comment}</p>
                          )}
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <span>👍 {review.helpful || 0} personnes trouvent cet avis utile</span>
                            <Link
                              href={`/admin/reviews?reviewId=${review.id}`}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              Gérer →
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">Aucun avis pour cette chambre</p>
                  )}
                </div>
              )}

              {/* Onglet Images */}
              {activeTab === 'images' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Images de la chambre ({room.images?.length || 0})
                  </h3>
                  {room.images && room.images.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {room.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`${room.name} - Image ${index + 1}`}
                            className="w-full h-48 object-cover rounded-lg"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'
                            }}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity rounded-lg flex items-center justify-center">
                            <a
                              href={image}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <EyeIcon className="w-8 h-8" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-6xl mb-4">📸</div>
                      <p className="text-gray-500">Aucune image pour cette chambre</p>
                      <Link
                        href={`/admin/rooms/${room.id}/edit`}
                        className="mt-4 inline-block bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                      >
                        Ajouter des images
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Actions rapides */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link
              href={`/admin/rooms/${room.id}/edit`}
              className="bg-blue-600 text-white p-4 rounded-xl hover:bg-blue-700 transition-colors text-center"
            >
              <PencilIcon className="w-6 h-6 mx-auto mb-2" />
              <div className="font-semibold">Modifier</div>
              <div className="text-blue-200 text-sm">Éditer les détails</div>
            </Link>

            <Link
              href={`/rooms/${room.id}`}
              target="_blank"
              className="bg-green-600 text-white p-4 rounded-xl hover:bg-green-700 transition-colors text-center"
            >
              <EyeIcon className="w-6 h-6 mx-auto mb-2" />
              <div className="font-semibold">Aperçu Client</div>
              <div className="text-green-200 text-sm">Vue publique</div>
            </Link>

            <button
              onClick={toggleRoomStatus}
              className={`p-4 rounded-xl transition-colors text-center ${
                room.isActive 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {room.isActive ? (
                <XCircleIcon className="w-6 h-6 mx-auto mb-2" />
              ) : (
                <CheckCircleIcon className="w-6 h-6 mx-auto mb-2" />
              )}
              <div className="font-semibold">
                {room.isActive ? 'Désactiver' : 'Activer'}
              </div>
              <div className={`text-sm ${
                room.isActive ? 'text-red-200' : 'text-green-200'
              }`}>
                {room.isActive ? 'Masquer aux clients' : 'Rendre visible'}
              </div>
            </button>

            <button
              onClick={deleteRoom}
              className="bg-gray-600 text-white p-4 rounded-xl hover:bg-gray-700 transition-colors text-center"
            >
              <TrashIcon className="w-6 h-6 mx-auto mb-2" />
              <div className="font-semibold">Supprimer</div>
              <div className="text-gray-200 text-sm">Action définitive</div>
            </button>
          </div>

          {/* Footer info */}
          <div className="mt-8 text-center text-gray-500 text-sm">
            Gestion Chambre • Données Prisma PostgreSQL • msylla01 • 2025-10-03 18:34:05
          </div>
        </main>
      </div>
    </>
  )
}
