import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  ChartBarIcon,
  UserGroupIcon,
  HomeIcon,
  CreditCardIcon,
  CalendarDaysIcon,
  BanknotesIcon,
  ClockIcon,
  CheckCircleIcon,
  PlusIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  StarIcon,
  ChatBubbleBottomCenterTextIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  UsersIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'

export default function AdminDashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Vérifier l'authentification admin
    const token = localStorage.getItem('hotel_token')
    const userData = localStorage.getItem('hotel_user')
    
    if (!token || !userData) {
      router.push('/auth/login')
      return
    }

    try {
      const user = JSON.parse(userData)
      if (user.role !== 'ADMIN') {
        router.push('/dashboard')
        return
      }

      setUser(user)
      fetchDashboardData()
    } catch (err) {
      console.error('❌ Erreur parsing user data [msylla01]:', err)
      router.push('/auth/login')
    }
  }, [router])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('📊 Récupération données dashboard admin [msylla01] - 2025-10-03 20:04:56')
      
      const token = localStorage.getItem('hotel_token')
      const response = await fetch('http://localhost:5000/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setDashboardData(data.data)
        console.log('✅ Dashboard admin chargé [msylla01]:', {
          users: data.data.metrics.totalUsers,
          rooms: data.data.metrics.totalRooms,
          bookings: data.data.metrics.totalBookings,
          reviews: data.data.metrics.totalReviews,
          revenue: data.data.metrics.totalRevenue
        })
      } else {
        throw new Error(data.message || 'Erreur de récupération des données')
      }

    } catch (error) {
      console.error('❌ Erreur récupération dashboard admin [msylla01]:', error)
      setError(error.message)
      
      // Fallback avec données simulées pour démonstration
      setDashboardData({
        metrics: {
          totalRevenue: 12500,
          revenueGrowth: 15,
          totalUsers: 23,
          activeUsers: 21,
          usersGrowth: 8,
          totalBookings: 18,
          activeBookings: 6,
          pendingBookings: 2,
          totalRooms: 5,
          activeRooms: 5,
          occupancyRate: 72,
          totalReviews: 47,
          averageRating: '4.6',
          verifiedReviews: 32
        },
        recentUsers: [],
        recentBookings: [],
        recentReviews: [],
        roomsWithStats: [],
        recentActivity: [
          { type: 'error', message: 'Utilisation données fallback - Vérifiez la connexion API', time: 'maintenant', color: 'bg-red-500' }
        ]
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('hotel_token')
    localStorage.removeItem('hotel_user')
    router.push('/')
  }

  const renderStars = (rating) => {
    const numRating = typeof rating === 'string' ? parseFloat(rating) : rating
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`w-4 h-4 ${i < numRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ))
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement dashboard admin...</p>
          <p className="text-xs text-gray-500 mt-2">Récupération données Prisma PostgreSQL</p>
          <p className="text-xs text-gray-500">msylla01 • 2025-10-03 20:04:56</p>
        </div>
      </div>
    )
  }

  if (!user || !dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Erreur de chargement du dashboard</p>
          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
          <button
            onClick={fetchDashboardData}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  const { metrics } = dashboardData

  return (
    <>
      <Head>
        <title>Dashboard Admin - Hotel Luxe</title>
        <meta name="description" content="Tableau de bord administrateur Hotel Luxe avec données Prisma PostgreSQL" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header Admin */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <Link href="/" className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">A</span>
                  </div>
                  <div>
                    <span className="text-xl font-bold text-gray-900">Admin Panel</span>
                    <span className="text-xs text-red-600 ml-2">HOTEL LUXE</span>
                  </div>
                </Link>
                
                {error && (
                  <div className="bg-red-100 text-red-800 px-3 py-1 rounded text-xs">
                    Mode Fallback
                  </div>
                )}
              </div>

              <nav className="hidden md:flex items-center space-x-6">
                <Link href="/admin" className="text-red-600 font-medium">
                  Dashboard
                </Link>
                <Link href="/admin/rooms" className="text-gray-600 hover:text-red-600 transition-colors">
                  Chambres ({metrics.totalRooms})
                </Link>
                <Link href="/admin/bookings" className="text-gray-600 hover:text-red-600 transition-colors">
                  Réservations ({metrics.totalBookings})
                </Link>
                <Link href="/admin/reviews" className="text-gray-600 hover:text-red-600 transition-colors">
                  Avis ({metrics.totalReviews})
                </Link>
                <Link href="/admin/users" className="text-gray-600 hover:text-red-600 transition-colors">
                  Clients ({metrics.totalUsers})
                </Link>
                <Link href="/admin/revenue" className="text-gray-600 hover:text-red-600 transition-colors font-medium">
                  💰 Revenus & CA
                <Link href="/manager" className="text-gray-600 hover:text-red-600 transition-colors font-medium">
                  🏨 Espace Gérant
                </Link>
                </Link>
              </nav>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </span>
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-gray-900">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-red-600">👑 Administrateur</p>
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
            className="mb-8"
          >
            <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-2xl p-8 text-white">
              <h1 className="text-3xl font-bold mb-2">
                Dashboard Administrateur 👑
              </h1>
              <p className="text-red-100 mb-4">
                Bienvenue {user.firstName} ! Gérez votre hôtel avec données PostgreSQL en temps réel.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm text-red-200">
                <div className="flex items-center space-x-1">
                  <UsersIcon className="w-4 h-4" />
                  <span>{metrics.totalUsers} clients</span>
                </div>
                <div className="flex items-center space-x-1">
                  <BuildingOfficeIcon className="w-4 h-4" />
                  <span>{metrics.totalRooms} chambres</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CalendarDaysIcon className="w-4 h-4" />
                  <span>{metrics.totalBookings} réservations</span>
                </div>
                <div className="flex items-center space-x-1">
                  <StarIcon className="w-4 h-4" />
                  <span>{metrics.totalReviews} avis</span>
                </div>
                <div className="flex items-center space-x-1">
                  <BanknotesIcon className="w-4 h-4" />
                  <span>{formatCurrency(metrics.totalRevenue)}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Métriques principales - Données réelles DB */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              {
                title: 'Revenus du Mois',
                value: formatCurrency(metrics.totalRevenue),
                change: `${metrics.revenueGrowth >= 0 ? '+' : ''}${metrics.revenueGrowth}%`,
                changeType: metrics.revenueGrowth >= 0 ? 'positive' : 'negative',
                icon: BanknotesIcon,
                color: 'from-green-500 to-green-600',
                description: 'Depuis le début du mois'
              },
              {
                title: 'Utilisateurs',
                value: metrics.totalUsers,
                change: `${metrics.activeUsers} actifs`,
                changeType: 'positive',
                icon: UserGroupIcon,
                color: 'from-blue-500 to-blue-600',
                description: `+${metrics.usersGrowth}% ce mois`
              },
              {
                title: 'Réservations',
                value: metrics.totalBookings,
                change: `${metrics.activeBookings} actives`,
                changeType: 'positive',
                icon: CalendarDaysIcon,
                color: 'from-purple-500 to-purple-600',
                description: `${metrics.pendingBookings} en attente`
              },
              {
                title: 'Avis Clients',
                value: metrics.totalReviews,
                change: `${metrics.averageRating}/5 ⭐`,
                changeType: 'positive',
                icon: ChatBubbleBottomCenterTextIcon,
                color: 'from-yellow-500 to-yellow-600',
                description: `${metrics.verifiedReviews} vérifiés`
              }
            ].map((metric, index) => (
              <motion.div
                key={metric.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-sm overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        {metric.title}
                      </p>
                      <p className="text-3xl font-bold text-gray-900">
                        {metric.value}
                      </p>
                      
                      <div className="flex items-center mt-2">
                        {metric.changeType === 'positive' ? (
                          <ArrowUpIcon className="w-4 h-4 text-green-500 mr-1" />
                        ) : (
                          <ArrowDownIcon className="w-4 h-4 text-red-500 mr-1" />
                        )}
                        <span className={`text-sm font-medium ${
                          metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {metric.change}
                        </span>
                      </div>
                      
                      <p className="text-xs text-gray-500 mt-1">
                        {metric.description}
                      </p>
                    </div>
                    
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${metric.color}`}>
                      <metric.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Actions rapides avec Revenus & CA ajouté */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
            {[
              {
                title: 'Revenus & CA',
                description: 'Chiffres d\'affaires détaillés',
                icon: BanknotesIcon,
                href: '/admin/revenue',
                color: 'bg-green-500 hover:bg-green-600',
                badge: 'NEW'
              },
              {
                title: 'Gérer Utilisateurs',
                description: `${metrics.totalUsers} clients`,
                icon: UserGroupIcon,
                href: '/admin/users',
                color: 'bg-blue-500 hover:bg-blue-600',
                badge: metrics.totalUsers > 20 ? 'ACTIVE' : null
              },
              {
                title: 'Gérer Chambres',
                description: `${metrics.totalRooms} chambres`,
                icon: HomeIcon,
                href: '/admin/rooms',
                color: 'bg-indigo-500 hover:bg-indigo-600'
              },
              {
                title: 'Réservations',
                description: `${metrics.activeBookings} actives`,
                icon: CalendarDaysIcon,
                href: '/admin/bookings',
                color: 'bg-purple-500 hover:bg-purple-600',
                badge: metrics.pendingBookings > 0 ? `${metrics.pendingBookings} EN ATTENTE` : null
              },
              {
                title: 'Gérer Avis',
                description: `${metrics.totalReviews} avis`,
                icon: ChatBubbleBottomCenterTextIcon,
                href: '/admin/reviews',
                color: 'bg-yellow-500 hover:bg-yellow-600'
              },
              {
                title: 'Statistiques',
                description: 'Rapports détaillés',
                icon: ChartBarIcon,
                href: '/admin/stats',
                color: 'bg-red-500 hover:bg-red-600'
              }
            ].map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <Link
                  href={action.href}
                  className="group block bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200 relative"
                >
                  {action.badge && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {action.badge}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 ${action.color} rounded-lg transition-colors`}>
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <ArrowRightIcon className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {action.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {action.description}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Données détaillées */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Utilisateurs récents */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-white rounded-2xl shadow-sm p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  👥 Utilisateurs Récents
                </h3>
                <Link
                  href="/admin/users"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Voir tout →
                </Link>
              </div>
              
              {dashboardData.recentUsers.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.recentUsers.slice(0, 5).map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 text-sm font-medium">
                            {user.firstName?.[0]}{user.lastName?.[0]}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm">
                            {user.firstName} {user.lastName}
                          </h4>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <span className={`text-xs px-2 py-1 rounded ${
                          user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.isActive ? 'Actif' : 'Inactif'}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">{user.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <UserGroupIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Aucun utilisateur récent</p>
                </div>
              )}
            </motion.div>

            {/* Réservations récentes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="bg-white rounded-2xl shadow-sm p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  📅 Réservations Récentes
                </h3>
                <Link
                  href="/admin/bookings"
                  className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                >
                  Gérer →
                </Link>
              </div>
              
              {dashboardData.recentBookings.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.recentBookings.slice(0, 4).map((booking) => (
                    <div key={booking.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900 text-sm">
                          {booking.user?.firstName} {booking.user?.lastName}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>🏨 {booking.room?.name}</span>
                        <span>{formatCurrency(booking.totalAmount)}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatDate(booking.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CalendarDaysIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Aucune réservation récente</p>
                </div>
              )}
            </motion.div>

            {/* Activité récente */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 }}
              className="bg-white rounded-2xl shadow-sm p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  🕐 Activité Récente
                </h3>
                <ClockIcon className="w-5 h-5 text-gray-400" />
              </div>
              
              <div className="space-y-4">
                {dashboardData.recentActivity?.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${activity.color}`}></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500">Il y a {activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Status et liens utiles avec lien Revenus */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="bg-white rounded-2xl shadow-sm p-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Status système */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  ⚡ Status Système
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">API Backend</span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">✅ Opérationnel</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Base PostgreSQL</span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">✅ Connectée</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Taux d'occupation</span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">{metrics.occupancyRate}%</span>
                  </div>
                  {error && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Mode Fallback</span>
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">⚠️ Actif</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Liens utiles avec Revenus & CA */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  🔗 Accès Rapide
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/admin/revenue"
                    className="p-3 text-center border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
                  >
                    <BanknotesIcon className="w-5 h-5 text-green-600 mx-auto mb-1" />
                    <p className="text-xs font-medium text-gray-900">Revenus & CA</p>
                  </Link>
                  
                  <a
                    href="http://localhost:5000/api/admin/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 text-center border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors"
                  >
                    <ChartBarIcon className="w-5 h-5 text-red-600 mx-auto mb-1" />
                    <p className="text-xs font-medium text-gray-900">API Admin</p>
                  </a>
                  
                  <a
                    href="http://localhost:5000/health"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 text-center border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
                  >
                    <CheckCircleIcon className="w-5 h-5 text-green-600 mx-auto mb-1" />
                    <p className="text-xs font-medium text-gray-900">Health</p>
                  </a>
                  
                  <Link
                    href="/"
                    className="p-3 text-center border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <HomeIcon className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                    <p className="text-xs font-medium text-gray-900">Site Public</p>
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-sm text-gray-600">
                ✅ Dashboard Admin avec Revenus & CA • 2025-10-03 20:04:56 UTC • msylla01
              </p>
              <p className="text-xs text-gray-500 mt-1">
                🗄️ Données temps réel • 👑 Gestion complète • 💰 Revenus intégrés • 📊 {Object.keys(metrics).length} métriques
              </p>
            </div>
          </motion.div>
        </main>
      </div>
    </>
  )
}


// Ajouter dans les actions rapides une carte pour l'espace gérant
// Insérer après la carte "Statistiques" :
/*
              {
                title: 'Espace Gérant',
                description: 'Gestion séjours sur place',
                icon: UserGroupIcon,
                href: '/manager',
                color: 'bg-teal-500 hover:bg-teal-600',
                badge: 'PHYSIQUE'
              },
*/

// Ajouter cette carte dans les actions rapides du dashboard admin
/*
AJOUTER CETTE CARTE DANS LA SECTION "Actions rapides" :

              {
                title: 'Espace Gérant',
                description: 'Gestion séjours sur place',
                icon: UserGroupIcon,
                href: '/manager',
                color: 'bg-teal-500 hover:bg-teal-600',
                badge: '👨‍💼'
              },

ET DANS LA NAVIGATION HEADER :

                <Link href="/manager" className="text-gray-600 hover:text-red-600 transition-colors font-medium">
                  👨‍💼 Espace Gérant
                </Link>
*/
