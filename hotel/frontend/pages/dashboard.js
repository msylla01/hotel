import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { motion } from 'framer-motion'
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
  PhoneIcon
} from '@heroicons/react/24/outline'
import { StarIcon } from '@heroicons/react/24/solid'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [bookings, setBookings] = useState([])
  const [stats, setStats] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [favoriteRooms, setFavoriteRooms] = useState([])

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
    fetchDashboardData()
  }, [router])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Simuler des données utilisateur complètes
      const mockBookings = [
        {
          id: 'BOOK_001',
          roomName: 'Suite Junior',
          roomType: 'SUITE',
          checkIn: '2025-12-15',
          checkOut: '2025-12-18',
          guests: 2,
          totalAmount: 1050,
          status: 'CONFIRMED',
          paymentStatus: 'PAID',
          createdAt: '2025-10-01',
          canCancel: true
        },
        {
          id: 'BOOK_002',
          roomName: 'Chambre Double Classique',
          roomType: 'DOUBLE',
          checkIn: '2025-11-20',
          checkOut: '2025-11-23',
          guests: 2,
          totalAmount: 540,
          status: 'PENDING',
          paymentStatus: 'PENDING',
          createdAt: '2025-09-25',
          canCancel: true
        }
      ]

      const mockStats = {
        totalBookings: mockBookings.length,
        totalSpent: mockBookings.reduce((sum, b) => sum + b.totalAmount, 0),
        upcomingStays: mockBookings.filter(b => new Date(b.checkIn) > new Date()).length,
        favoriteRooms: 3,
        loyaltyPoints: 1250,
        memberSince: '2024-05-15'
      }

      const mockNotifications = [
        {
          id: 1,
          type: 'booking',
          title: 'Réservation confirmée',
          message: 'Votre réservation Suite Junior est confirmée pour le 15 décembre',
          date: '2025-10-01',
          read: false,
          icon: CheckCircleIcon,
          color: 'text-green-600'
        },
        {
          id: 2,
          type: 'payment',
          title: 'Paiement en attente',
          message: 'Finalisez le paiement de votre réservation Chambre Double',
          date: '2025-09-30',
          read: false,
          icon: ExclamationTriangleIcon,
          color: 'text-yellow-600'
        },
        {
          id: 3,
          type: 'info',
          title: 'Nouveau service spa',
          message: 'Découvrez notre nouveau centre wellness avec 20% de réduction',
          date: '2025-09-28',
          read: true,
          icon: HeartIcon,
          color: 'text-purple-600'
        }
      ]

      const mockFavorites = [
        {
          id: 'room_1',
          name: 'Suite Présidentielle',
          type: 'SUITE',
          price: 800,
          image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
          rating: 4.9
        },
        {
          id: 'room_2',
          name: 'Chambre Deluxe Vue Mer',
          type: 'DELUXE',
          price: 450,
          image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400',
          rating: 4.8
        }
      ]

      setBookings(mockBookings)
      setStats(mockStats)
      setNotifications(mockNotifications)
      setFavoriteRooms(mockFavorites)

    } catch (error) {
      console.error('❌ Erreur chargement dashboard [msylla01]:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('hotel_token')
    localStorage.removeItem('hotel_user')
    router.push('/')
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      'CONFIRMED': { bg: 'bg-green-100', text: 'text-green-800', label: 'Confirmée' },
      'PENDING': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'En attente' },
      'CANCELLED': { bg: 'bg-red-100', text: 'text-red-800', label: 'Annulée' },
      'COMPLETED': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Terminée' }
    }
    
    const config = statusConfig[status] || statusConfig['PENDING']
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
          <p className="text-gray-600">Chargement de votre espace...</p>
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
        <meta name="description" content="Votre espace personnel Hotel Luxe" />
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
                    <p className="text-xs text-gray-500">Mon Espace</p>
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
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </span>
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-gray-900">
                      {user.firstName} {user.lastName}
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
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Bienvenue, {user.firstName} ! 👋
                </h1>
                <p className="text-blue-100 mb-4">
                  Gérez vos réservations et découvrez nos services exclusifs
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
                </div>
              </div>
              
              <div className="hidden lg:block">
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Accès rapide</h3>
                  <div className="space-y-2">
                    <Link
                      href="/rooms"
                      className="block text-blue-100 hover:text-white transition-colors"
                    >
                      → Nouvelle réservation
                    </Link>
                    <Link
                      href="/profile"
                      className="block text-blue-100 hover:text-white transition-colors"
                    >
                      → Mon profil
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              {
                title: 'Mes Réservations',
                value: stats?.totalBookings || 0,
                change: 'Total',
                icon: CalendarDaysIcon,
                color: 'from-blue-500 to-blue-600'
              },
              {
                title: 'Total Dépensé',
                value: `${stats?.totalSpent || 0}€`,
                change: 'Toutes réservations',
                icon: CreditCardIcon,
                color: 'from-green-500 to-green-600'
              },
              {
                title: 'Séjours à Venir',
                value: stats?.upcomingStays || 0,
                change: 'Prochainement',
                icon: ClockIcon,
                color: 'from-purple-500 to-purple-600'
              },
              {
                title: 'Chambres Favorites',
                value: stats?.favoriteRooms || 0,
                change: 'Sauvegardées',
                icon: HeartIcon,
                color: 'from-red-500 to-red-600'
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
            
            {/* Left Column - Bookings & Notifications */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Recent Bookings */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl shadow-sm p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Mes Réservations ({bookings.length})
                  </h2>
                  <Link
                    href="/rooms"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <PlusIcon className="w-4 h-4" />
                    <span>Nouvelle réservation</span>
                  </Link>
                </div>

                {bookings.length > 0 ? (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900">{booking.roomName}</h3>
                            <p className="text-sm text-gray-500">Réservation #{booking.id}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(booking.status)}
                            {booking.paymentStatus === 'PENDING' && (
                              <Link
                                href={`/payment/${booking.id}`}
                                className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full hover:bg-yellow-200 transition-colors"
                              >
                                Payer maintenant
                              </Link>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Arrivée</span>
                            <p className="font-medium">{new Date(booking.checkIn).toLocaleDateString('fr-FR')}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Départ</span>
                            <p className="font-medium">{new Date(booking.checkOut).toLocaleDateString('fr-FR')}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Personnes</span>
                            <p className="font-medium">{booking.guests}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Total</span>
                            <p className="font-medium text-blue-600">{booking.totalAmount}€</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                          <div className="flex space-x-2">
                            <Link
                              href={`/booking/${booking.id}`}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                              Voir détails
                            </Link>
                            {booking.canCancel && (
                              <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                                Annuler
                              </button>
                            )}
                          </div>
                          
                          <div className="text-xs text-gray-500">
                            Réservée le {new Date(booking.createdAt).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CalendarDaysIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Aucune réservation
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Commencez par réserver votre première chambre !
                    </p>
                    <Link
                      href="/rooms"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Faire une réservation
                    </Link>
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
                  Notifications ({notifications.filter(n => !n.read).length} non lues)
                </h2>

                {notifications.length > 0 ? (
                  <div className="space-y-4">
                    {notifications.slice(0, 5).map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                          notification.read 
                            ? 'border-gray-200 bg-gray-50' 
                            : 'border-blue-200 bg-blue-50'
                        }`}
                        onClick={() => markNotificationRead(notification.id)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-full bg-white`}>
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
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
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
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Mon Profil</h3>
                
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-white text-2xl font-bold">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </span>
                  </div>
                  <h4 className="font-semibold text-gray-900">{user.firstName} {user.lastName}</h4>
                  <p className="text-gray-600 text-sm">{user.email}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Membre depuis {stats?.memberSince ? new Date(stats.memberSince).getFullYear() : '2024'}
                  </p>
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
                    href="/profile/settings"
                    className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <CogIcon className="w-5 h-5 text-gray-400" />
                      <span className="text-sm font-medium">Paramètres</span>
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

              {/* Favorite Rooms */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-white rounded-2xl shadow-sm p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Mes Favoris ({favoriteRooms.length})
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
                        <div className="h-32 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                          <HomeIcon className="w-12 h-12 text-blue-600" />
                        </div>
                        <div className="p-3">
                          <h4 className="font-medium text-gray-900 text-sm">{room.name}</h4>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-blue-600 font-semibold">{room.price}€/nuit</span>
                            <div className="flex items-center">
                              <StarIcon className="w-4 h-4 text-yellow-400" />
                              <span className="text-xs text-gray-600 ml-1">{room.rating}</span>
                            </div>
                          </div>
                          <Link
                            href={`/rooms/${room.id}`}
                            className="mt-2 w-full bg-blue-600 text-white py-2 px-3 rounded text-xs hover:bg-blue-700 transition-colors text-center block"
                          >
                            Voir détails
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <HeartIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-sm">Aucune chambre favorite</p>
                    <Link
                      href="/rooms"
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      Découvrir nos chambres →
                    </Link>
                  </div>
                )}
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-white rounded-2xl shadow-sm p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions Rapides</h3>
                
                <div className="space-y-3">
                  <Link
                    href="/rooms"
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors text-center block"
                  >
                    Réserver une chambre
                  </Link>
                  
                  <Link
                    href="/services"
                    className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors text-center block"
                  >
                    Services & Spa
                  </Link>

                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/contact"
                      className="flex items-center justify-center p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <PhoneIcon className="w-4 h-4 text-gray-600 mr-1" />
                      <span className="text-xs">Contact</span>
                    </Link>
                    <Link
                      href="/support"
                      className="flex items-center justify-center p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <EnvelopeIcon className="w-4 h-4 text-gray-600 mr-1" />
                      <span className="text-xs">Support</span>
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Footer Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="mt-12 text-center text-gray-500"
          >
            <p className="text-sm">
              Hotel Luxe • Votre espace personnel • Développé par msylla01
            </p>
            <p className="text-xs mt-1">
              2025-10-01 16:30:22 UTC • Version 1.0.0
            </p>
          </motion.div>
        </main>
      </div>
    </>
  )
}
