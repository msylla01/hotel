import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CalendarDaysIcon,
  UserIcon,
  CreditCardIcon,
  BellIcon,
  ArrowRightIcon,
  PlusIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  HomeIcon,
  CogIcon,
  HeartIcon,
  ChartBarIcon,
  EnvelopeIcon,
  PhoneIcon,
  XMarkIcon,
  EyeIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'
import { StarIcon } from '@heroicons/react/24/solid'
import DeactivatedAccountBanner from '../components/dashboard/DeactivatedAccountBanner'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [bookings, setBookings] = useState([])
  const [stats, setStats] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [favoriteRooms, setFavoriteRooms] = useState([])
  const [showWelcomeBack, setShowWelcomeBack] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)

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
    
    // Vérifier si c'est une réactivation
    if (router.query.reactivated === 'true' || router.query.welcome === 'true') {
      setShowWelcomeBack(true)
      router.replace('/dashboard', undefined, { shallow: true })
    }
    
    fetchRealDashboardData()
  }, [router])

  const fetchRealDashboardData = async () => {
    try {
      setDataLoading(true)
      const token = localStorage.getItem('hotel_token')
      
      if (!token) {
        router.push('/auth/login')
        return
      }

      console.log('📊 Récupération données dashboard DB RÉELLES [msylla01] - 2025-10-02 00:52:45')

      const [bookingsResponse, statsResponse] = await Promise.all([
        fetch('http://localhost:5000/api/bookings', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }),
        fetch('http://localhost:5000/api/bookings/stats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      ])

      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json()
        if (bookingsData.success) {
          setBookings(bookingsData.bookings)
          console.log(`✅ ${bookingsData.bookings.length} réservations DB récupérées [msylla01]`)
        } else {
          throw new Error(bookingsData.message)
        }
      } else {
        throw new Error(`Erreur bookings: ${bookingsResponse.status}`)
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        if (statsData.success) {
          setStats(statsData.stats)
          console.log('✅ Stats DB récupérées [msylla01]:', statsData.stats)
        } else {
          throw new Error(statsData.message)
        }
      } else {
        throw new Error(`Erreur stats: ${statsResponse.status}`)
      }

      const mockNotifications = user?.isActive ? [
        {
          id: 1,
          type: 'booking',
          title: 'Données synchronisées',
          message: 'Toutes vos données proviennent de la base PostgreSQL',
          date: new Date().toISOString(),
          read: false,
          icon: CheckCircleIcon,
          color: 'text-green-600'
        }
      ] : [
        {
          id: 1,
          type: 'account',
          title: 'Compte désactivé',
          message: 'Réactivez votre compte pour effectuer des réservations',
          date: new Date().toISOString(),
          read: false,
          icon: ExclamationTriangleIcon,
          color: 'text-orange-600'
        }
      ]

      setNotifications(mockNotifications)
      setFavoriteRooms([])

    } catch (error) {
      console.error('❌ Erreur chargement dashboard DB [msylla01]:', error)
      setBookings([])
      setStats({
        totalBookings: 0,
        totalSpent: 0,
        upcomingStays: 0,
        completedStays: 0,
        loyaltyPoints: 0,
        favoriteRooms: 0
      })
    } finally {
      setDataLoading(false)
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('hotel_token')
    localStorage.removeItem('hotel_user')
    router.push('/')
  }

  const handleReactivate = (reactivatedUser) => {
    setUser(reactivatedUser)
    setShowWelcomeBack(true)
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      'CONFIRMED': { bg: 'bg-green-100', text: 'text-green-800', label: '✅ Confirmée' },
      'PENDING': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: '⏳ En attente' },
      'CANCELLED': { bg: 'bg-red-100', text: 'text-red-800', label: '❌ Annulée' },
      'COMPLETED': { bg: 'bg-blue-100', text: 'text-blue-800', label: '✨ Terminée' }
    }
    
    const config = statusConfig[status] || statusConfig['PENDING']
    return (
      <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    )
  }

  const getPaymentBadge = (paymentStatus) => {
    const paymentConfig = {
      'PAID': { bg: 'bg-green-100', text: 'text-green-800', label: '💳 Payé' },
      'PENDING': { bg: 'bg-orange-100', text: 'text-orange-800', label: '💰 En attente' },
      'FAILED': { bg: 'bg-red-100', text: 'text-red-800', label: '❌ Échec' },
      'COMPLETED': { bg: 'bg-green-100', text: 'text-green-800', label: '💳 Payé' }
    }
    
    const config = paymentConfig[paymentStatus] || paymentConfig['PENDING']
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    )
  }

  const markNotificationRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de vos données...</p>
          <p className="text-xs text-gray-500 mt-2">msylla01 • 2025-10-01 18:58:35</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <>
      <Head>
        <title>Mon Espace - Hotel Luxe</title>
        <meta name="description" content="Votre espace personnel Hotel Luxe avec vraies données" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <Link href="/" className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">H</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">Hotel Luxe</h1>
                    <p className="text-xs text-gray-500">Dashboard RÉEL</p>
                  </div>
                </Link>
              </div>

              <nav className="hidden md:flex items-center space-x-6">
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
                <div className="relative">
                  <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                    <BellIcon className="h-6 w-6" />
                    {notifications.filter(n => !n.read).length > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {notifications.filter(n => !n.read).length}
                      </span>
                    )}
                  </button>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    user.isActive ? 'bg-blue-600' : 'bg-orange-500'
                  }`}>
                    <span className="text-white text-sm font-medium">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </span>
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-gray-900 flex items-center space-x-2">
                      <span>{user.firstName} {user.lastName}</span>
                      {!user.isActive && (
                        <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                          Désactivé
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="ml-4 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Déconnexion
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Message de bienvenue après réactivation */}
          <AnimatePresence>
            {showWelcomeBack && user.isActive && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6 relative"
              >
                <button
                  onClick={() => setShowWelcomeBack(false)}
                  className="absolute top-4 right-4 text-green-500 hover:text-green-700"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
                
                <div className="flex items-start space-x-3">
                  <CheckCircleIcon className="w-8 h-8 text-green-600 mt-1" />
                  <div>
                    <h3 className="text-green-900 font-bold text-lg mb-2">
                      🎉 Bon retour parmi nous, {user.firstName} !
                    </h3>
                    <p className="text-green-700 mb-3">
                      Votre compte a été réactivé avec succès ! Vous avez maintenant accès à toutes les fonctionnalités.
                    </p>
                    <div className="mt-4">
                      <Link
                        href="/rooms"
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center space-x-2"
                      >
                        <PlusIcon className="w-4 h-4" />
                        <span>Faire une réservation</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Banner de compte désactivé */}
          {!user.isActive && (
            <DeactivatedAccountBanner user={user} onReactivate={handleReactivate} />
          )}

          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl p-8 text-white mb-8 ${
              user.isActive 
                ? 'bg-gradient-to-r from-blue-600 to-blue-800' 
                : 'bg-gradient-to-r from-orange-600 to-orange-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Bienvenue, {user.firstName} ! 👋
                  {!user.isActive && ' (Compte désactivé)'}
                </h1>
                <p className={`${user.isActive ? 'text-blue-100' : 'text-orange-100'} mb-4`}>
                  {user.isActive 
                    ? 'Vos données de réservations sont mises à jour en temps réel'
                    : 'Votre compte est temporairement désactivé. Vous pouvez consulter vos informations et réactiver à tout moment.'
                  }
                </p>
                <div className="flex items-center space-x-6 text-sm text-blue-100">
                  <div>
                    <span className="block text-white font-semibold">{stats?.loyaltyPoints || 0}</span>
                    <span>Points fidélité</span>
                  </div>
                  <div>
                    <span className="block text-white font-semibold">
                      {stats?.memberSince ? new Date(stats.memberSince).getFullYear() : '2024'}
                    </span>
                    <span>Membre depuis</span>
                  </div>
                  <div>
                    <span className="block text-white font-semibold">RÉEL</span>
                    <span>Données live</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards - DONNÉES RÉELLES */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              {
                title: 'Mes Réservations',
                value: stats?.totalBookings || 0,
                change: 'Total réel',
                icon: CalendarDaysIcon,
                color: 'from-blue-500 to-blue-600'
              },
              {
                title: 'Total Dépensé',
                value: `${stats?.totalSpent || 0}€`,
                change: 'Montant réel',
                icon: CreditCardIcon,
                color: 'from-green-500 to-green-600'
              },
              {
                title: 'Séjours à Venir',
                value: stats?.upcomingStays || 0,
                change: 'Confirmés',
                icon: ClockIcon,
                color: 'from-purple-500 to-purple-600'
              },
              {
                title: 'Séjours Terminés',
                value: stats?.completedStays || 0,
                change: 'Historique',
                icon: CheckCircleIcon,
                color: 'from-indigo-500 to-indigo-600'
              }
            ].map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-sm overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {stat.change}
                      </p>
                    </div>
                    
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column - VRAIES RÉSERVATIONS */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Recent Bookings - DONNÉES RÉELLES */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl shadow-sm p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    📅 Mes Réservations RÉELLES ({bookings.length})
                  </h2>
                  {user.isActive ? (
                    <Link
                      href="/rooms"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <PlusIcon className="w-4 h-4" />
                      <span>Nouvelle réservation</span>
                    </Link>
                  ) : (
                    <div className="text-orange-600 text-sm">
                      Réactivez pour réserver
                    </div>
                  )}
                </div>

                {dataLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement des réservations...</p>
                  </div>
                ) : bookings.length > 0 ? (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow bg-gradient-to-r from-white to-gray-50">
                        <div className="flex items-start space-x-4">
                          {/* Image de la chambre RÉELLE */}
                          <div className="w-24 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={booking.roomImage}
                              alt={booking.room.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'
                              }}
                            />
                          </div>

                          {/* Détails RÉELS */}
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h3 className="font-semibold text-gray-900 text-lg">{booking.room.name}</h3>
                                <p className="text-sm text-gray-500">#{booking.id}</p>
                                <p className="text-xs text-blue-600">{booking.room.type} • {booking.room.size}m²</p>
                              </div>
                              <div className="flex flex-col items-end space-y-1">
                                {getStatusBadge(booking.status)}
                                {getPaymentBadge(booking.paymentStatus)}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                              <div className="bg-blue-50 p-2 rounded">
                                <span className="text-blue-600 font-medium block">Arrivée</span>
                                <p className="font-bold text-gray-900">{new Date(booking.checkIn).toLocaleDateString('fr-FR')}</p>
                              </div>
                              <div className="bg-green-50 p-2 rounded">
                                <span className="text-green-600 font-medium block">Départ</span>
                                <p className="font-bold text-gray-900">{new Date(booking.checkOut).toLocaleDateString('fr-FR')}</p>
                              </div>
                              <div className="bg-purple-50 p-2 rounded">
                                <span className="text-purple-600 font-medium block">Personnes</span>
                                <p className="font-bold text-gray-900">{booking.guests}</p>
                              </div>
                              <div className="bg-orange-50 p-2 rounded">
                                <span className="text-orange-600 font-medium block">Total</span>
                                <p className="font-bold text-blue-600">{booking.totalAmount}€</p>
                                <p className="text-xs text-gray-500">{booking.nights} nuit(s)</p>
                              </div>
                            </div>

                            {/* Demandes spéciales */}
                            {booking.specialRequests && (
                              <div className="bg-gray-50 p-2 rounded mb-3">
                                <p className="text-xs text-gray-600">
                                  <strong>Demandes spéciales:</strong> {booking.specialRequests}
                                </p>
                              </div>
                            )}

                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                              <div className="flex space-x-3">
                                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1 hover:bg-blue-50 px-2 py-1 rounded">
                                  <EyeIcon className="w-4 h-4" />
                                  <span>Détails</span>
                                </button>
                                {booking.paymentStatus === 'PENDING' && user.isActive && (
                                  <Link
                                    href={`/payment/${booking.id}`}
                                    className="text-green-600 hover:text-green-700 text-sm font-medium hover:bg-green-50 px-2 py-1 rounded"
                                  >
                                    💳 Payer maintenant
                                  </Link>
                                )}
                                {booking.canCancel && user.isActive && (
                                  <button className="text-red-600 hover:text-red-700 text-sm font-medium hover:bg-red-50 px-2 py-1 rounded">
                                    ❌ Annuler
                                  </button>
                                )}
                              </div>
                              
                              <div className="text-xs text-gray-500">
                                <div>Réservée le {new Date(booking.createdAt).toLocaleDateString('fr-FR')}</div>
                                {booking.canCancel && (
                                  <div className="text-green-600">✅ Annulation gratuite</div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gradient-to-b from-gray-50 to-white rounded-lg">
                    <CalendarDaysIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">
                      Aucune réservation trouvée
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Vous n'avez pas encore de réservation. Découvrez nos chambres exceptionnelles !
                    </p>
                    {user.isActive ? (
                      <Link
                        href="/rooms"
                        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                      >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Faire ma première réservation
                      </Link>
                    ) : (
                      <p className="text-orange-600 text-sm">
                        Réactivez votre compte pour pouvoir réserver
                      </p>
                    )}
                  </div>
                )}
              </motion.div>

              {/* Notifications */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-2xl shadow-sm p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  �� Notifications ({notifications.filter(n => !n.read).length} non lues)
                </h2>

                {notifications.length > 0 ? (
                  <div className="space-y-4">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                          notification.read 
                            ? 'border-gray-200 bg-gray-50' 
                            : 'border-blue-200 bg-blue-50 shadow-sm'
                        }`}
                        onClick={() => markNotificationRead(notification.id)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-full bg-white shadow-sm`}>
                            <notification.icon className={`w-4 h-4 ${notification.color}`} />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{notification.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-2">
                              {new Date(notification.date).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Aucune notification</p>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Right Column - Profile & Favorites */}
            <div className="space-y-8">
              
              {/* Profile Summary */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-2xl shadow-sm p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">👤 Mon Profil</h3>
                
                <div className="text-center mb-6">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-3 ${
                    user.isActive ? 'bg-blue-600' : 'bg-orange-500'
                  }`}>
                    <span className="text-white text-2xl font-bold">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </span>
                  </div>
                  <h4 className="font-semibold text-gray-900">{user.firstName} {user.lastName}</h4>
                  <p className="text-gray-600 text-sm">{user.email}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Membre depuis {stats?.memberSince ? new Date(stats.memberSince).getFullYear() : '2024'}
                  </p>
                  {stats?.loyaltyPoints > 0 && (
                    <div className="mt-2 inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                      ⭐ {stats.loyaltyPoints} points fidélité
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <Link
                    href="/profile"
                    className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <UserIcon className="w-5 h-5 text-gray-400" />
                      <span className="text-sm font-medium">Modifier mon profil</span>
                    </div>
                    <ArrowRightIcon className="w-4 h-4 text-gray-400" />
                  </Link>

                  <Link
                    href="/dashboard/bookings"
                    className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <CalendarDaysIcon className="w-5 h-5 text-gray-400" />
                      <span className="text-sm font-medium">Toutes mes réservations</span>
                    </div>
                    <ArrowRightIcon className="w-4 h-4 text-gray-400" />
                  </Link>

                  <Link
                    href="/profile/loyalty"
                    className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <StarIcon className="w-5 h-5 text-yellow-400" />
                      <span className="text-sm font-medium">Programme fidélité</span>
                    </div>
                    <ArrowRightIcon className="w-4 h-4 text-gray-400" />
                  </Link>
                </div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-white rounded-2xl shadow-sm p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">⚡ Actions Rapides</h3>
                
                <div className="space-y-3">
                  {user.isActive ? (
                    <Link
                      href="/rooms"
                      className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors text-center block"
                    >
                      🏨 Réserver une chambre
                    </Link>
                  ) : (
                    <div className="w-full bg-orange-100 text-orange-800 py-3 rounded-lg font-medium text-center">
                      🚫 Réactivez votre compte pour réserver
                    </div>
                  )}
                  
                  <Link
                    href="/services"
                    className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors text-center block"
                  >
                    💆‍♀️ Services & Spa
                  </Link>

                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/contact"
                      className="flex items-center justify-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <PhoneIcon className="w-4 h-4 text-gray-600 mr-2" />
                      <span className="text-sm">Contact</span>
                    </Link>
                    <Link
                      href="/support"
                      className="flex items-center justify-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <EnvelopeIcon className="w-4 h-4 text-gray-600 mr-2" />
                      <span className="text-sm">Support</span>
                    </Link>
                  </div>

                  {/* Statistiques rapides */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg mt-4">
                    <h4 className="font-semibold text-gray-900 mb-3 text-center">📊 Mes Stats</h4>
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div>
                        <div className="text-lg font-bold text-blue-600">{stats?.totalBookings || 0}</div>
                        <div className="text-xs text-gray-600">Réservations</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-green-600">{stats?.totalSpent || 0}€</div>
                        <div className="text-xs text-gray-600">Dépensé</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-purple-600">{stats?.upcomingStays || 0}</div>
                        <div className="text-xs text-gray-600">À venir</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-yellow-600">{stats?.loyaltyPoints || 0}</div>
                        <div className="text-xs text-gray-600">Points</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Favorite Rooms */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 }}
                className="bg-white rounded-2xl shadow-sm p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    ❤️ Mes Favoris ({favoriteRooms.length})
                  </h3>
                  <Link
                    href="/rooms"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Voir tout →
                  </Link>
                </div>

                {favoriteRooms.length > 0 ? (
                  <div className="space-y-4">
                    {favoriteRooms.map((room) => (
                      <div key={room.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                        <div className="h-24 bg-gradient-to-br from-blue-100 to-purple-100 relative overflow-hidden">
                          <img
                            src={room.image}
                            alt={room.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none'
                              e.target.parentElement.classList.add('flex', 'items-center', 'justify-center')
                              e.target.parentElement.innerHTML = '<div class="flex items-center justify-center"><HomeIcon class="w-8 h-8 text-blue-600" /></div>'
                            }}
                          />
                          <div className="absolute top-2 right-2">
                            <HeartIcon className="w-5 h-5 text-red-500 fill-current" />
                          </div>
                        </div>
                        <div className="p-3">
                          <h4 className="font-medium text-gray-900 text-sm mb-1">{room.name}</h4>
                          <p className="text-xs text-gray-500 mb-2">{room.type}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-blue-600 font-bold text-sm">{room.price}€/nuit</span>
                            <div className="flex items-center">
                              <StarIcon className="w-4 h-4 text-yellow-400" />
                              <span className="text-xs text-gray-600 ml-1">{room.rating}</span>
                            </div>
                          </div>
                          {user.isActive ? (
                            <Link
                              href={`/rooms/${room.id}`}
                              className="mt-2 w-full bg-blue-600 text-white py-2 px-3 rounded text-xs hover:bg-blue-700 transition-colors text-center block"
                            >
                              💳 Réserver
                            </Link>
                          ) : (
                            <div className="mt-2 w-full bg-gray-100 text-gray-500 py-2 px-3 rounded text-xs text-center">
                              🔒 Réactivez pour réserver
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <HeartIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-sm mb-2">Aucune chambre favorite</p>
                    <Link
                      href="/rooms"
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Découvrir nos chambres →
                    </Link>
                  </div>
                )}
              </motion.div>

              {/* Conseils et Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.0 }}
                className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl shadow-sm p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Le saviez-vous ?</h3>
                
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Annulation gratuite</p>
                      <p className="text-xs text-gray-600">Jusqu'à 24h avant votre arrivée</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">⭐</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Points fidélité</p>
                      <p className="text-xs text-gray-600">1 point = 1€ dépensé, échangeable contre des nuits gratuites</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">🎁</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Offres exclusives</p>
                      <p className="text-xs text-gray-600">Profitez de réductions jusqu'à 30% en tant que membre</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-700">
                    <strong>Astuce :</strong> Réservez à l'avance pour bénéficier des meilleurs tarifs ! 
                    Les prix augmentent généralement 2 semaines avant la date d'arrivée.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Bottom Section - Liens rapides et Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="mt-12 bg-white rounded-2xl shadow-sm p-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Liens utiles */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">🔗 Liens Utiles</h3>
                <div className="space-y-2">
                  <Link href="/rooms" className="block text-blue-600 hover:text-blue-700 text-sm">
                    → Toutes nos chambres
                  </Link>
                  <Link href="/services" className="block text-blue-600 hover:text-blue-700 text-sm">
                    → Services et équipements
                  </Link>
                  <Link href="/restaurant" className="block text-blue-600 hover:text-blue-700 text-sm">
                    → Restaurant gastronomique
                  </Link>
                  <Link href="/spa" className="block text-blue-600 hover:text-blue-700 text-sm">
                    → Centre wellness & spa
                  </Link>
                  <Link href="/events" className="block text-blue-600 hover:text-blue-700 text-sm">
                    → Événements et séminaires
                  </Link>
                </div>
              </div>

              {/* Support */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">📞 Besoin d'aide ?</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <PhoneIcon className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-700">+33 1 23 45 67 89</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <EnvelopeIcon className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-700">contact@hotel-luxe.fr</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="w-4 h-4 text-purple-600" />
                    <span className="text-sm text-gray-700">Support 24h/24</span>
                  </div>
                  <Link
                    href="/contact"
                    className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Nous contacter
                  </Link>
                </div>
              </div>

              {/* Promotions */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">🎉 Offres Spéciales</h3>
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
                  <h4 className="font-bold text-orange-900 mb-2">Automne Doré 🍂</h4>
                  <p className="text-sm text-orange-800 mb-3">
                    -25% sur tous les séjours de 3 nuits minimum jusqu'au 30 novembre !
                  </p>
                  {user.isActive ? (
                    <Link
                      href="/rooms?promo=automne"
                      className="bg-orange-600 text-white px-3 py-2 rounded text-xs hover:bg-orange-700 transition-colors inline-block"
                    >
                      Profiter de l'offre
                    </Link>
                  ) : (
                    <div className="text-orange-600 text-xs">
                      Réactivez votre compte pour profiter de cette offre
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Footer avec informations développeur */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="mt-12 text-center text-gray-500"
          >
            <div className="bg-gray-800 text-white rounded-2xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2 text-blue-300">🏨 Hotel Luxe</h4>
                  <p className="text-gray-300">Dashboard utilisateur avec données réelles</p>
                  <p className="text-gray-400 text-xs mt-1">Version 1.0.0</p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2 text-green-300">⚡ Fonctionnalités</h4>
                  <ul className="text-gray-300 text-xs space-y-1">
                    <li>✅ Réservations en temps réel</li>
                    <li>✅ Paiements sécurisés</li>
                    <li>✅ Gestion de profil</li>
                    <li>✅ Programme fidélité</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2 text-purple-300">👨‍�� Développement</h4>
                  <p className="text-gray-300 text-xs">Développé par <strong>msylla01</strong></p>
                  <p className="text-gray-400 text-xs">2025-10-01 18:58:35 UTC</p>
                  <p className="text-gray-400 text-xs mt-1">Next.js + PostgreSQL + Prisma</p>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-700 text-center">
                <p className="text-gray-400 text-xs">
                  🚀 Système de réservation hôtelière complet avec authentification, paiements et gestion avancée
                </p>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </>
  )
}
