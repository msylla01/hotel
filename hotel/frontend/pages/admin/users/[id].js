import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  ArrowLeftIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarDaysIcon,
  CurrencyEuroIcon,
  StarIcon,
  ChatBubbleBottomCenterTextIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CakeIcon
} from '@heroicons/react/24/outline'

export default function UserDetails() {
  const router = useRouter()
  const { id } = router.query
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('details')

  useEffect(() => {
    if (id) {
      fetchUserDetails()
    }
  }, [id])

  const fetchUserDetails = async () => {
    try {
      setLoading(true)
      setError('')

      console.log('👤 Récupération détails utilisateur [msylla01] - 2025-10-03 19:13:54:', id)

      const token = localStorage.getItem('hotel_token')
      const response = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setUser(data.user)
        console.log('✅ Détails utilisateur récupérés [msylla01]')
      } else {
        throw new Error(data.message || 'Erreur de récupération')
      }
    } catch (error) {
      console.error('❌ Erreur récupération détails utilisateur [msylla01]:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleUserStatus = async () => {
    if (!user) return

    try {
      const token = localStorage.getItem('hotel_token')
      const response = await fetch(`http://localhost:5000/api/admin/users/${user.id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !user.isActive })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setUser({ ...user, isActive: !user.isActive })
        alert(`✅ Utilisateur ${!user.isActive ? 'activé' : 'désactivé'} avec succès`)
      } else {
        alert(`❌ Erreur: ${data.message}`)
      }
    } catch (error) {
      console.error('❌ Erreur modification statut utilisateur [msylla01]:', error)
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

  const getStatusColor = (status) => {
    const colors = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'CONFIRMED': 'bg-blue-100 text-blue-800',
      'CANCELLED': 'bg-red-100 text-red-800',
      'CHECKED_IN': 'bg-green-100 text-green-800',
      'CHECKED_OUT': 'bg-gray-100 text-gray-800',
      'COMPLETED': 'bg-green-100 text-green-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const renderStars = (rating) => {
    const numRating = parseInt(rating) || 0
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
          <p className="text-gray-600">Chargement des détails utilisateur...</p>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-gray-600 mb-4">Erreur de chargement de l'utilisateur</p>
          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
          <div className="space-x-4">
            <button
              onClick={fetchUserDetails}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Réessayer
            </button>
            <Link
              href="/admin/users"
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
        <title>{user.firstName} {user.lastName} - Admin Hotel Luxe</title>
        <meta name="description" content={`Détails et gestion de l'utilisateur ${user.firstName} ${user.lastName}`} />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <Link href="/admin/users" className="flex items-center text-gray-600 hover:text-red-600 transition-colors">
                  <ArrowLeftIcon className="w-5 h-5 mr-2" />
                  Gestion Utilisateurs
                </Link>
                <div className="text-gray-300">•</div>
                <h1 className="text-xl font-bold text-gray-900">{user.firstName} {user.lastName}</h1>
              </div>

              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user.isActive ? '✅ Actif' : '❌ Inactif'}
                </span>
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">👑 Admin</span>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* En-tête utilisateur */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm p-8 mb-8"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-6">
                {/* Avatar */}
                <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </span>
                </div>

                {/* Infos principales */}
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {user.firstName} {user.lastName}
                    </h2>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      user.role === 'ADMIN' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role === 'ADMIN' ? '👑 Administrateur' : '👤 Client'}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <EnvelopeIcon className="w-4 h-4" />
                      <span>{user.email}</span>
                      {user.emailVerified && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">✅ Vérifié</span>
                      )}
                    </div>
                    
                    {user.phone && (
                      <div className="flex items-center space-x-2 text-gray-600">
                        <PhoneIcon className="w-4 h-4" />
                        <span>{user.phone}</span>
                      </div>
                    )}
                    
                    {user.address && (
                      <div className="flex items-center space-x-2 text-gray-600">
                        <MapPinIcon className="w-4 h-4" />
                        <span>{user.address}</span>
                      </div>
                    )}
                    
                    {user.birthDate && (
                      <div className="flex items-center space-x-2 text-gray-600">
                        <CakeIcon className="w-4 h-4" />
                        <span>{formatDate(user.birthDate)}</span>
                      </div>
                    )}
                  </div>

                  <div className="text-sm text-gray-500">
                    <p>Inscrit le {formatDate(user.createdAt)}</p>
                    <p>Dernière modification le {formatDate(user.updatedAt)}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={toggleUserStatus}
                  className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                    user.isActive 
                      ? 'bg-red-600 text-white hover:bg-red-700' 
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {user.isActive ? (
                    <>
                      <XCircleIcon className="w-5 h-5 inline mr-2" />
                      Désactiver
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="w-5 h-5 inline mr-2" />
                      Activer
                    </>
                  )}
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
                  <p className="text-2xl font-bold text-gray-900">{user.stats.totalBookings}</p>
                  <p className="text-gray-600 text-sm">Réservations</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <CurrencyEuroIcon className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(user.stats.totalSpent)}</p>
                  <p className="text-gray-600 text-sm">Total dépensé</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <ChatBubbleBottomCenterTextIcon className="w-8 h-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{user.stats.totalReviews}</p>
                  <p className="text-gray-600 text-sm">Avis donnés</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <StarIcon className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{user.stats.averageRating}/5</p>
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
                  { id: 'bookings', label: '📅 Réservations', count: user.stats.totalBookings },
                  { id: 'reviews', label: '⭐ Avis', count: user.stats.totalReviews }
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
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Informations personnelles</h3>
                      <dl className="space-y-2">
                        <div className="flex justify-between">
                          <dt className="text-gray-600">ID:</dt>
                          <dd className="font-mono text-sm">{user.id}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Prénom:</dt>
                          <dd className="font-medium">{user.firstName || 'Non renseigné'}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Nom:</dt>
                          <dd className="font-medium">{user.lastName || 'Non renseigné'}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Email:</dt>
                          <dd className="font-medium">{user.email}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Téléphone:</dt>
                          <dd>{user.phone || 'Non renseigné'}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Adresse:</dt>
                          <dd>{user.address || 'Non renseignée'}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Date de naissance:</dt>
                          <dd>{user.birthDate ? formatDate(user.birthDate) : 'Non renseignée'}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Rôle:</dt>
                          <dd>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              user.role === 'ADMIN' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {user.role}
                            </span>
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Statut:</dt>
                          <dd>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {user.isActive ? 'Actif' : 'Inactif'}
                            </span>
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Email vérifié:</dt>
                          <dd>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              user.emailVerified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {user.emailVerified ? '✅ Vérifié' : '⏳ En attente'}
                            </span>
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Statistiques d'activité</h3>
                      <dl className="space-y-2">
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Total réservations:</dt>
                          <dd className="font-bold text-blue-600">{user.stats.totalBookings}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Réservations terminées:</dt>
                          <dd className="font-bold text-green-600">{user.stats.completedBookings}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Réservations annulées:</dt>
                          <dd className="font-bold text-red-600">{user.stats.cancelledBookings}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Total dépensé:</dt>
                          <dd className="font-bold text-green-600">{formatCurrency(user.stats.totalSpent)}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Total avis:</dt>
                          <dd className="font-bold text-yellow-600">{user.stats.totalReviews}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Avis vérifiés:</dt>
                          <dd className="font-bold text-green-600">{user.stats.verifiedReviews}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Note moyenne donnée:</dt>
                          <dd className="font-bold text-purple-600">{user.stats.averageRating}/5</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Dernière réservation:</dt>
                          <dd>{user.stats.lastBooking ? formatDate(user.stats.lastBooking) : 'Aucune'}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Dernier avis:</dt>
                          <dd>{user.stats.lastReview ? formatDate(user.stats.lastReview) : 'Aucun'}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Inscription:</dt>
                          <dd>{formatDate(user.createdAt)}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>

                  {user.preferences && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Préférences</h3>
                      <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto">
                        {JSON.stringify(user.preferences, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {/* Onglet Réservations */}
              {activeTab === 'bookings' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Réservations ({user.bookings?.length || 0})
                  </h3>
                  {user.bookings && user.bookings.length > 0 ? (
                    <div className="space-y-4">
                      {user.bookings.map(booking => (
                        <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium text-gray-900">{booking.room.name}</h4>
                              <p className="text-sm text-gray-600">{booking.room.type}</p>
                              <p className="text-sm text-gray-500">
                                Du {formatDate(booking.checkIn)} au {formatDate(booking.checkOut)}
                              </p>
                              <p className="text-sm text-gray-500">
                                {booking.guests} personne(s) • Réservé le {formatDate(booking.createdAt)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-green-600 mb-2">
                                {formatCurrency(booking.totalAmount)}
                              </p>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(booking.status)}`}>
                                {booking.status}
                              </span>
                              {booking.payment && booking.payment.length > 0 && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Paiement: {booking.payment[0].status} ({booking.payment[0].method})
                                </p>
                              )}
                            </div>
                          </div>
                          {booking.specialRequests && (
                            <div className="mt-2 p-2 bg-blue-50 rounded">
                              <p className="text-sm text-blue-800">
                                <strong>Demandes spéciales:</strong> {booking.specialRequests}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">Aucune réservation pour cet utilisateur</p>
                  )}
                </div>
              )}

              {/* Onglet Avis */}
              {activeTab === 'reviews' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Avis donnés ({user.reviews?.length || 0})
                  </h3>
                  {user.reviews && user.reviews.length > 0 ? (
                    <div className="space-y-4">
                      {user.reviews.map(review => (
                        <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium text-gray-900">{review.room.name}</h4>
                              <p className="text-sm text-gray-600">{review.room.type}</p>
                              <div className="flex items-center space-x-2 mt-1">
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
                            <div className="text-right">
                              <span className="text-lg font-bold text-yellow-600">{review.rating}/5</span>
                            </div>
                          </div>
                          
                          {review.title && (
                            <h5 className="font-medium text-gray-900 mb-1">{review.title}</h5>
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
                    <p className="text-gray-500">Aucun avis donné par cet utilisateur</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Actions rapides */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={toggleUserStatus}
              className={`p-4 rounded-xl transition-colors text-center ${
                user.isActive 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {user.isActive ? (
                <XCircleIcon className="w-6 h-6 mx-auto mb-2" />
              ) : (
                <CheckCircleIcon className="w-6 h-6 mx-auto mb-2" />
              )}
              <div className="font-semibold">
                {user.isActive ? 'Désactiver' : 'Activer'}
              </div>
              <div className={`text-sm ${
                user.isActive ? 'text-red-200' : 'text-green-200'
              }`}>
                {user.isActive ? 'Suspendre le compte' : 'Réactiver le compte'}
              </div>
            </button>

            <Link
              href={`mailto:${user.email}`}
              className="bg-blue-600 text-white p-4 rounded-xl hover:bg-blue-700 transition-colors text-center"
            >
              <EnvelopeIcon className="w-6 h-6 mx-auto mb-2" />
              <div className="font-semibold">Contacter</div>
              <div className="text-blue-200 text-sm">Envoyer un email</div>
            </Link>

            <Link
              href="/admin/bookings?userId=${user.id}"
              className="bg-purple-600 text-white p-4 rounded-xl hover:bg-purple-700 transition-colors text-center"
            >
              <CalendarDaysIcon className="w-6 h-6 mx-auto mb-2" />
              <div className="font-semibold">Voir Réservations</div>
              <div className="text-purple-200 text-sm">{user.stats.totalBookings} réservations</div>
            </Link>
          </div>

          {/* Footer info */}
          <div className="mt-8 text-center text-gray-500 text-sm">
            Gestion Utilisateur • Données Prisma PostgreSQL • msylla01 • 2025-10-03 19:13:54
          </div>
        </main>
      </div>
    </>
  )
}
