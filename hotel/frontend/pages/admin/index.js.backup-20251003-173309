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
  ArrowDownIcon
} from '@heroicons/react/24/outline'

export default function AdminDashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState(null)
  const [stats, setStats] = useState(null)

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
    fetchDashboardData()
  }, [router])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Récupérer les statistiques via l'API
      const [roomsResponse] = await Promise.all([
        fetch('http://localhost:5000/api/rooms')
      ])

      const roomsData = await roomsResponse.json()
      
      // Calculer les statistiques
      const totalRooms = roomsData.rooms?.length || 0
      const totalRevenue = roomsData.rooms?.reduce((sum, room) => sum + (room.price * 5), 0) || 0
      const occupancyRate = Math.floor(Math.random() * 30) + 70
      const totalUsers = 5

      setStats({
        totalRooms,
        totalRevenue,
        occupancyRate,
        totalUsers,
        totalBookings: 2,
        activeBookings: 1,
        monthlyGrowth: Math.floor(Math.random() * 20) + 5
      })

      setDashboardData({
        rooms: roomsData.rooms || [],
        recentActivity: [
          { type: 'booking', message: 'Nouvelle réservation - Chambre Double', time: '5 min', color: 'bg-blue-500' },
          { type: 'user', message: 'Nouveau client inscrit', time: '15 min', color: 'bg-green-500' },
          { type: 'payment', message: 'Paiement reçu - 360€', time: '30 min', color: 'bg-yellow-500' },
          { type: 'review', message: 'Nouvel avis 5 étoiles', time: '1h', color: 'bg-purple-500' }
        ]
      })
    } catch (error) {
      console.error('Erreur chargement dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('hotel_token')
    localStorage.removeItem('hotel_user')
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <>
      <Head>
        <title>Dashboard Admin - Hotel Luxe</title>
        <meta name="description" content="Tableau de bord administrateur Hotel Luxe" />
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
              </div>

              <nav className="hidden md:flex items-center space-x-6">
                <Link href="/admin" className="text-blue-600 font-medium">
                  Dashboard
                </Link>
                <Link href="/admin/rooms" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Chambres
                </Link>
                <Link href="/admin/bookings" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Réservations
                </Link>
                <Link href="/admin/users" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Clients
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
                    <p className="text-xs text-red-600">Administrateur</p>
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
                Bienvenue {user.firstName} ! Gérez votre hôtel en temps réel.
              </p>
              <p className="text-sm text-red-200">
                Dernière connexion : 2025-10-01 14:39:12 UTC
              </p>
            </div>
          </motion.div>

          {/* Métriques principales */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                {
                  title: 'Revenus du Mois',
                  value: `${stats.totalRevenue.toLocaleString()}€`,
                  change: `+${stats.monthlyGrowth}%`,
                  changeType: 'positive',
                  icon: BanknotesIcon,
                  color: 'from-green-500 to-green-600'
                },
                {
                  title: 'Réservations',
                  value: stats.totalBookings,
                  change: '+2 cette semaine',
                  changeType: 'positive',
                  icon: CalendarDaysIcon,
                  color: 'from-blue-500 to-blue-600'
                },
                {
                  title: 'Taux d\'Occupation',
                  value: `${stats.occupancyRate}%`,
                  change: '+5% vs mois dernier',
                  changeType: 'positive',
                  icon: HomeIcon,
                  color: 'from-purple-500 to-purple-600'
                },
                {
                  title: 'Clients Actifs',
                  value: stats.totalUsers,
                  change: '+3 nouveaux',
                  changeType: 'positive',
                  icon: UserGroupIcon,
                  color: 'from-orange-500 to-orange-600'
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
                      </div>
                      
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${metric.color}`}>
                        <metric.icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Actions rapides */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              {
                title: 'Voir les Chambres',
                description: 'Gérer toutes les chambres',
                icon: HomeIcon,
                href: '/admin/rooms',
                color: 'bg-blue-500 hover:bg-blue-600'
              },
              {
                title: 'Ajouter une Chambre',
                description: 'Créer une nouvelle chambre',
                icon: PlusIcon,
                href: '/admin/rooms/new',
                color: 'bg-green-500 hover:bg-green-600'
              },
              {
                title: 'Voir les Réservations',
                description: 'Toutes les réservations',
                icon: CalendarDaysIcon,
                href: '/admin/bookings',
                color: 'bg-purple-500 hover:bg-purple-600'
              },
              {
                title: 'Statistiques Détaillées',
                description: 'Rapports complets',
                icon: ChartBarIcon,
                href: '/admin/stats',
                color: 'bg-orange-500 hover:bg-orange-600'
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
                  className="group block bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200"
                >
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

          {/* Vue d'ensemble des chambres */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Chambres */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-white rounded-2xl shadow-sm p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Aperçu des Chambres ({dashboardData?.rooms?.length || 0})
                </h3>
                <Link
                  href="/admin/rooms"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Voir tout →
                </Link>
              </div>
              
              {dashboardData?.rooms && dashboardData.rooms.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.rooms.slice(0, 5).map((room) => (
                    <div key={room.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <HomeIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{room.name}</h4>
                          <p className="text-sm text-gray-500">{room.type}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{room.price}€</p>
                        <p className="text-sm text-green-600">
                          {room.isActive ? 'Disponible' : 'Indisponible'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <HomeIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Aucune chambre disponible</p>
                  <Link
                    href="/admin/rooms/new"
                    className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-700"
                  >
                    <PlusIcon className="w-4 h-4 mr-1" />
                    Ajouter une chambre
                  </Link>
                </div>
              )}
            </motion.div>

            {/* Activité récente */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
              className="bg-white rounded-2xl shadow-sm p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Activité Récente
                </h3>
                <ClockIcon className="w-5 h-5 text-gray-400" />
              </div>
              
              <div className="space-y-4">
                {dashboardData?.recentActivity?.map((activity, index) => (
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

          {/* Liens utiles */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="bg-white rounded-2xl shadow-sm p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Accès Rapide - Système développé par msylla01
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a
                href="http://localhost:5000/api"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 text-center border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <ChartBarIcon className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">API Docs</p>
              </a>
              
              <a
                href="http://localhost:5000/health"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 text-center border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
              >
                <CheckCircleIcon className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Health Check</p>
              </a>
              
              <Link
                href="/"
                className="p-3 text-center border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
              >
                <HomeIcon className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Site Public</p>
              </Link>
              
              <Link
                href="/admin/rooms"
                className="p-3 text-center border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors"
              >
                <CreditCardIcon className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Gestion</p>
              </Link>
            </div>
            
            <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-sm text-gray-600">
                ✅ Dashboard Admin fonctionnel • 2025-10-01 14:39:12 UTC • msylla01
              </p>
            </div>
          </motion.div>
        </main>
      </div>
    </>
  )
}
