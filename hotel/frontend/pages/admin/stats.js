import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  ChartBarIcon,
  ArrowLeftIcon,
  CalendarDaysIcon,
  CurrencyEuroIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  StarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline'

export default function AdminStats() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
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
      fetchStats()
    } catch (err) {
      console.error('❌ Erreur parsing user data [msylla01]:', err)
      router.push('/auth/login')
    }
  }, [router])

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('📊 Récupération statistiques admin [msylla01] - 2025-10-03 18:10:57')
      
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
        setStats(data.data)
        console.log('✅ Statistiques admin chargées [msylla01]')
      } else {
        throw new Error(data.message || 'Erreur de récupération des données')
      }
    } catch (error) {
      console.error('❌ Erreur chargement stats admin [msylla01]:', error)
      setError(error.message)
      
      // Fallback avec données simulées pour éviter l'erreur
      setStats({
        metrics: {
          totalRevenue: 15750,
          revenueGrowth: 12,
          totalUsers: 28,
          activeUsers: 24,
          usersGrowth: 8,
          totalBookings: 23,
          activeBookings: 7,
          pendingBookings: 3,
          totalRooms: 5,
          activeRooms: 5,
          occupancyRate: 78,
          totalReviews: 52,
          averageRating: '4.6',
          verifiedReviews: 38
        },
        recentActivity: [
          { 
            type: 'error', 
            message: 'Utilisation données fallback - Vérifiez la connexion API', 
            time: 'maintenant', 
            color: 'bg-red-500' 
          },
          { 
            type: 'info', 
            message: 'Page statistiques chargée avec données simulées', 
            time: '1 min', 
            color: 'bg-blue-500' 
          }
        ]
      })
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const renderTrendIcon = (growth) => {
    if (growth >= 0) {
      return <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
    } else {
      return <ArrowTrendingDownIcon className="w-4 h-4 text-red-500 mr-1" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des statistiques...</p>
          <p className="text-xs text-gray-500 mt-2">msylla01 • 2025-10-03 18:10:57</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-gray-600 mb-4">Erreur de chargement des statistiques</p>
          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
          <button
            onClick={fetchStats}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            🔄 Réessayer
          </button>
        </div>
      </div>
    )
  }

  const { metrics } = stats

  return (
    <>
      <Head>
        <title>Statistiques - Admin Hotel Luxe</title>
        <meta name="description" content="Statistiques détaillées - Dashboard administrateur Hotel Luxe" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <Link href="/admin" className="flex items-center text-gray-600 hover:text-red-600 transition-colors">
                  <ArrowLeftIcon className="w-5 h-5 mr-2" />
                  Dashboard Admin
                </Link>
                <div className="text-gray-300">•</div>
                <h1 className="text-xl font-bold text-gray-900">Statistiques Détaillées</h1>
              </div>

              <div className="flex items-center space-x-4">
                {error && (
                  <div className="bg-red-100 text-red-800 px-3 py-1 rounded text-xs">
                    Mode Fallback
                  </div>
                )}
                <span className="text-sm text-gray-600">
                  👤 {user?.firstName} {user?.lastName}
                </span>
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">👑 Admin</span>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Vue d'ensemble */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-red-600 to-red-800 rounded-2xl p-8 text-white mb-8"
          >
            <h2 className="text-2xl font-bold mb-4">📊 Vue d'ensemble Hotel Luxe</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold">{metrics.totalRooms}</div>
                <div className="text-red-200">Chambres</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{metrics.totalUsers}</div>
                <div className="text-red-200">Clients</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{metrics.totalBookings}</div>
                <div className="text-red-200">Réservations</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{metrics.totalReviews}</div>
                <div className="text-red-200">Avis</div>
              </div>
            </div>
            
            <div className="mt-6 text-center text-red-200 text-sm">
              📈 Croissance: +{metrics.revenueGrowth}% • 💰 Revenus: {formatCurrency(metrics.totalRevenue)} • ⭐ Note: {metrics.averageRating}/5
            </div>
          </motion.div>

          {/* Métriques détaillées */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {/* Revenus */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">💰 Revenus</h3>
                <CurrencyEuroIcon className="w-6 h-6 text-green-600" />
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Ce mois</span>
                    <span className="font-bold text-2xl text-green-600">
                      {formatCurrency(metrics.totalRevenue)}
                    </span>
                  </div>
                  <div className="flex items-center mt-1">
                    {renderTrendIcon(metrics.revenueGrowth)}
                    <span className={`text-sm ${metrics.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {metrics.revenueGrowth >= 0 ? '+' : ''}{metrics.revenueGrowth}% vs mois dernier
                    </span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500">Taux occupation</div>
                      <div className="font-semibold text-purple-600">{metrics.occupancyRate}%</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Prix moyen</div>
                      <div className="font-semibold text-blue-600">
                        {Math.round(metrics.totalRevenue / (metrics.totalBookings || 1))}€
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Utilisateurs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">👥 Utilisateurs</h3>
                <UserGroupIcon className="w-6 h-6 text-blue-600" />
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total</span>
                    <span className="font-bold text-2xl text-blue-600">{metrics.totalUsers}</span>
                  </div>
                  <div className="flex items-center mt-1">
                    <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">
                      +{metrics.usersGrowth}% ce mois
                    </span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500">Actifs</div>
                      <div className="font-semibold text-green-600">{metrics.activeUsers}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Taux activité</div>
                      <div className="font-semibold text-purple-600">
                        {Math.round((metrics.activeUsers / metrics.totalUsers) * 100)}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Réservations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">📅 Réservations</h3>
                <CalendarDaysIcon className="w-6 h-6 text-purple-600" />
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total</span>
                    <span className="font-bold text-2xl text-purple-600">{metrics.totalBookings}</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500">Actives</div>
                      <div className="font-semibold text-green-600">{metrics.activeBookings}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">En attente</div>
                      <div className="font-semibold text-yellow-600">{metrics.pendingBookings}</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Avis */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">⭐ Avis Clients</h3>
                <StarIcon className="w-6 h-6 text-yellow-600" />
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Note moyenne</span>
                    <span className="font-bold text-2xl text-yellow-600">{metrics.averageRating}/5</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500">Total avis</div>
                      <div className="font-semibold text-blue-600">{metrics.totalReviews}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Vérifiés</div>
                      <div className="font-semibold text-green-600">{metrics.verifiedReviews}</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Chambres */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">🏨 Chambres</h3>
                <BuildingOfficeIcon className="w-6 h-6 text-indigo-600" />
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total</span>
                    <span className="font-bold text-2xl text-indigo-600">{metrics.totalRooms}</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500">Actives</div>
                      <div className="font-semibold text-green-600">{metrics.activeRooms}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Disponibilité</div>
                      <div className="font-semibold text-purple-600">
                        {Math.round((metrics.activeRooms / metrics.totalRooms) * 100)}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Performance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">📈 Performance</h3>
                <ChartBarIcon className="w-6 h-6 text-red-600" />
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Croissance</span>
                    <span className="font-bold text-2xl text-red-600">+{metrics.revenueGrowth}%</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-100">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Revenus/Chambre</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(metrics.totalRevenue / metrics.totalRooms)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Avis/Réservation</span>
                      <span className="font-semibold text-yellow-600">
                        {(metrics.totalReviews / metrics.totalBookings).toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Activité récente */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-6">🕐 Activité Récente</h3>
            
            {stats.recentActivity && stats.recentActivity.length > 0 ? (
              <div className="space-y-4">
                {stats.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className={`w-3 h-3 rounded-full ${activity.color}`}></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500">Il y a {activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📊</div>
                <p className="text-gray-500">Aucune activité récente</p>
              </div>
            )}
          </motion.div>

          {/* Actions rapides */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6"
          >
            <Link
              href="/admin/users"
              className="bg-blue-600 text-white p-6 rounded-xl hover:bg-blue-700 transition-colors text-center"
            >
              <UserGroupIcon className="w-8 h-8 mx-auto mb-2" />
              <div className="font-semibold">Gérer Utilisateurs</div>
              <div className="text-blue-200 text-sm">{metrics.totalUsers} clients</div>
            </Link>

            <Link
              href="/admin/rooms"
              className="bg-green-600 text-white p-6 rounded-xl hover:bg-green-700 transition-colors text-center"
            >
              <BuildingOfficeIcon className="w-8 h-8 mx-auto mb-2" />
              <div className="font-semibold">Gérer Chambres</div>
              <div className="text-green-200 text-sm">{metrics.totalRooms} chambres</div>
            </Link>

            <Link
              href="/admin/bookings"
              className="bg-purple-600 text-white p-6 rounded-xl hover:bg-purple-700 transition-colors text-center"
            >
              <CalendarDaysIcon className="w-8 h-8 mx-auto mb-2" />
              <div className="font-semibold">Gérer Réservations</div>
              <div className="text-purple-200 text-sm">{metrics.totalBookings} réservations</div>
            </Link>

            <Link
              href="/admin/reviews"
              className="bg-yellow-600 text-white p-6 rounded-xl hover:bg-yellow-700 transition-colors text-center"
            >
              <StarIcon className="w-8 h-8 mx-auto mb-2" />
              <div className="font-semibold">Gérer Avis</div>
              <div className="text-yellow-200 text-sm">{metrics.totalReviews} avis</div>
            </Link>
          </motion.div>

          {/* Footer info */}
          <div className="mt-8 text-center text-gray-500 text-sm">
            <p className="mb-2">
              📊 Statistiques en temps réel • Données Prisma PostgreSQL • msylla01 • 2025-10-03 18:10:57
            </p>
            <div className="flex justify-center space-x-4 text-xs">
              <span>🗄️ Backend Prisma</span>
              <span>📡 API REST</span>
              <span>⚡ Temps réel</span>
              <span>🔒 Sécurisé Admin</span>
              {error && <span className="text-red-600">⚠️ Mode Fallback</span>}
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
