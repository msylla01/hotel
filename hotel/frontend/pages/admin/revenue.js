import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  ArrowLeftIcon,
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarDaysIcon,
  CreditCardIcon,
  ChartBarIcon,
  ArrowPathIcon,
  EyeIcon,
  BuildingOfficeIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'

export default function AdminRevenue() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [revenueData, setRevenueData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

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
      fetchRevenueData()
    } catch (err) {
      console.error('❌ Erreur parsing user data [msylla01]:', err)
      router.push('/auth/login')
    }
  }, [router, selectedPeriod, selectedYear])

  const fetchRevenueData = async () => {
    try {
      setLoading(true)
      setError('')

      console.log('💰 Récupération données revenus [msylla01] - 2025-10-03 19:51:56')

      const token = localStorage.getItem('hotel_token')
      const params = new URLSearchParams({
        period: selectedPeriod,
        year: selectedYear.toString()
      })

      const response = await fetch(`http://localhost:5000/api/admin/revenue?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setRevenueData(data.data)
        console.log('✅ Données revenus récupérées [msylla01]')
      } else {
        throw new Error(data.message || 'Erreur de récupération')
      }
    } catch (error) {
      console.error('❌ Erreur récupération revenus [msylla01]:', error)
      setError(error.message)
      
      // Fallback avec données simulées
      setRevenueData({
        period: {
          type: selectedPeriod,
          label: selectedPeriod === 'month' ? 'Ce mois' : 'Cette période'
        },
        summary: {
          totalRevenue: 25750,
          periodRevenue: 8500,
          revenueGrowth: 15,
          averageOrderValue: 220,
          conversionRate: 12,
          totalBookings: 45,
          periodBookings: 15,
          totalRooms: 5,
          totalUsers: 28
        },
        breakdown: {
          confirmed: 6800,
          completed: 1700,
          pending: 2400,
          byRoomType: {
            'DOUBLE': 12500,
            'SUITE': 8750,
            'SINGLE': 3200,
            'FAMILY': 1300
          },
          topRooms: [
            { name: 'Suite Présidentielle', revenue: 8750 },
            { name: 'Chambre Double Premium', revenue: 6200 },
            { name: 'Suite Junior', revenue: 4500 },
            { name: 'Chambre Familiale', revenue: 3800 },
            { name: 'Chambre Simple Deluxe', revenue: 2500 }
          ]
        },
        payments: {
          total: 45,
          completed: 38,
          pending: 5,
          failed: 2,
          byMethod: {
            'STRIPE': 15400,
            'PAYPAL': 7200,
            'ORANGE_MONEY': 2100,
            'WAVE': 1050
          }
        },
        trends: {
          monthly: [
            { month: '2024-05', monthName: 'Mai 2024', revenue: 6500, bookings: 12 },
            { month: '2024-06', monthName: 'Juin 2024', revenue: 7200, bookings: 15 },
            { month: '2024-07', monthName: 'Juil 2024', revenue: 8100, bookings: 18 },
            { month: '2024-08', monthName: 'Août 2024', revenue: 9200, bookings: 20 },
            { month: '2024-09', monthName: 'Sept 2024', revenue: 7800, bookings: 16 },
            { month: '2024-10', monthName: 'Oct 2024', revenue: 8500, bookings: 15 }
          ],
          growth: 15
        },
        recentTransactions: [
          {
            id: 'tx_001',
            amount: 320,
            method: 'STRIPE',
            date: new Date().toISOString(),
            booking: {
              id: 'book_001',
              room: 'Suite Présidentielle',
              user: 'Marie Dubois'
            }
          },
          {
            id: 'tx_002',
            amount: 180,
            method: 'PAYPAL',
            date: new Date(Date.now() - 86400000).toISOString(),
            booking: {
              id: 'book_002',
              room: 'Chambre Double',
              user: 'Jean Martin'
            }
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getGrowthColor = (growth) => {
    if (growth > 0) return 'text-green-600'
    if (growth < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const getGrowthIcon = (growth) => {
    if (growth > 0) return <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
    if (growth < 0) return <ArrowTrendingDownIcon className="w-4 h-4 text-red-500 mr-1" />
    return null
  }

  const getPaymentMethodIcon = (method) => {
    const icons = {
      'STRIPE': '💳',
      'PAYPAL': '🅿️',
      'ORANGE_MONEY': '🟠',
      'WAVE': '🌊',
      'CASH': '💵'
    }
    return icons[method] || '💳'
  }

  const getRoomTypeColor = (type) => {
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
          <p className="text-gray-600">Chargement des données de revenus...</p>
          <p className="text-xs text-gray-500 mt-2">Calcul en cours • msylla01 • 2025-10-03 19:51:56</p>
        </div>
      </div>
    )
  }

  if (error && !revenueData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">💰</div>
          <p className="text-gray-600 mb-4">Erreur de chargement des revenus</p>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <button
            onClick={fetchRevenueData}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  if (!revenueData) return null

  const { summary, breakdown, payments, trends } = revenueData

  return (
    <>
      <Head>
        <title>Revenus et Chiffres d'Affaires - Admin Hotel Luxe</title>
        <meta name="description" content="Analyse des revenus et chiffres d'affaires - Dashboard administrateur" />
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
                <h1 className="text-xl font-bold text-gray-900">Revenus & Chiffres d'Affaires</h1>
              </div>

              <div className="flex items-center space-x-4">
                {error && (
                  <div className="bg-red-100 text-red-800 px-3 py-1 rounded text-xs">
                    Mode Fallback
                  </div>
                )}
                
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                >
                  <option value="week">Cette semaine</option>
                  <option value="month">Ce mois</option>
                  <option value="year">Cette année</option>
                </select>

                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>

                <button
                  onClick={fetchRevenueData}
                  className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors"
                  title="Actualiser"
                >
                  <ArrowPathIcon className="w-5 h-5" />
                </button>

                <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">👑 Admin</span>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* En-tête avec résumé */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-green-600 to-green-800 rounded-2xl p-8 text-white mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2">
                  💰 {formatCurrency(summary.periodRevenue)}
                </h2>
                <p className="text-green-100 mb-4">
                  Revenus • {revenueData.period.label} • {summary.periodBookings} réservations
                </p>
                <div className="flex items-center space-x-6 text-sm text-green-200">
                  <div className="flex items-center">
                    {getGrowthIcon(summary.revenueGrowth)}
                    <span className={summary.revenueGrowth >= 0 ? 'text-white' : 'text-red-200'}>
                      {summary.revenueGrowth >= 0 ? '+' : ''}{summary.revenueGrowth}% vs période précédente
                    </span>
                  </div>
                  <span>• Panier moyen: {formatCurrency(summary.averageOrderValue)}</span>
                  <span>• Taux conversion: {summary.conversionRate}%</span>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-3xl font-bold">📈</div>
                <p className="text-green-200 text-sm mt-2">
                  {summary.totalBookings} réservations totales
                </p>
                <p className="text-green-200 text-sm">
                  {summary.totalUsers} clients • {summary.totalRooms} chambres
                </p>
              </div>
            </div>
          </motion.div>

          {/* Métriques principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Revenus Confirmés</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(breakdown.confirmed)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Réservations confirmées</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600">
                  <BanknotesIcon className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Revenus Terminés</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(breakdown.completed)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Séjours terminés</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600">
                  <CalendarDaysIcon className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">En Attente</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(breakdown.pending)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Réservations en attente</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-600">
                  <ChartBarIcon className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Historique</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(summary.totalRevenue)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Depuis le début</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600">
                  <ArrowTrendingUpIcon className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Graphiques et analyses */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Évolution mensuelle */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                📈 Évolution des Revenus (6 derniers mois)
              </h3>
              
              <div className="space-y-3">
                {trends.monthly.slice(-6).map((month, index) => (
                  <div key={month.month} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        index === 5 ? 'bg-green-500' : 'bg-blue-500'
                      }`}></div>
                      <span className="text-sm font-medium text-gray-900">
                        {month.monthName}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">
                        {formatCurrency(month.revenue)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {month.bookings} réservations
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>Tendance:</strong> {summary.revenueGrowth >= 0 ? '📈 Croissance' : '📉 Baisse'} de {Math.abs(summary.revenueGrowth)}% vs période précédente
                </p>
              </div>
            </motion.div>

            {/* Revenus par type de chambre */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                🏨 Revenus par Type de Chambre
              </h3>
              
              <div className="space-y-4">
                {Object.entries(breakdown.byRoomType)
                  .sort(([,a], [,b]) => b - a)
                  .map(([type, revenue]) => {
                    const percentage = Math.round((revenue / summary.totalRevenue) * 100)
                    return (
                      <div key={type} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoomTypeColor(type)}`}>
                            {type}
                          </span>
                          <span className="text-sm font-bold text-gray-900">
                            {formatCurrency(revenue)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500">{percentage}% du total</p>
                      </div>
                    )
                  })}
              </div>
            </motion.div>
          </div>

          {/* Top chambres et paiements */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Top chambres */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                🏆 Top Chambres (Revenus)
              </h3>
              
              <div className="space-y-3">
                {breakdown.topRooms.slice(0, 5).map((room, index) => (
                  <div key={room.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                        index === 0 ? 'bg-yellow-500' :
                        index === 1 ? 'bg-gray-400' :
                        index === 2 ? 'bg-orange-500' :
                        'bg-blue-500'
                      }`}>
                        {index + 1}
                      </div>
                      <span className="font-medium text-gray-900">{room.name}</span>
                    </div>
                    <span className="font-bold text-green-600">
                      {formatCurrency(room.revenue)}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Méthodes de paiement */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                💳 Paiements
              </h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{payments.completed}</p>
                  <p className="text-sm text-green-800">Réussis</p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">{payments.failed}</p>
                  <p className="text-sm text-red-800">Échoués</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Par méthode:</h4>
                {Object.entries(payments.byMethod).map(([method, amount]) => (
                  <div key={method} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getPaymentMethodIcon(method)}</span>
                      <span className="text-sm text-gray-700">{method}</span>
                    </div>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(amount)}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Transactions récentes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                🔄 Transactions Récentes
              </h3>
              <Link
                href="/admin/bookings"
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Voir toutes →
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Transaction</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Client</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Chambre</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Méthode</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Montant</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {revenueData.recentTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <span className="font-mono text-sm text-gray-600">
                          #{transaction.id.slice(-8)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {transaction.booking.user}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {transaction.booking.room}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <span>{getPaymentMethodIcon(transaction.method)}</span>
                          <span className="text-sm text-gray-700">{transaction.method}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-green-600">
                        {formatCurrency(transaction.amount)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {formatDate(transaction.date)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Actions rapides */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link
              href="/admin/bookings"
              className="bg-blue-600 text-white p-4 rounded-xl hover:bg-blue-700 transition-colors text-center"
            >
              <CalendarDaysIcon className="w-6 h-6 mx-auto mb-2" />
              <div className="font-semibold">Réservations</div>
              <div className="text-blue-200 text-sm">{summary.totalBookings} total</div>
            </Link>

            <Link
              href="/admin/rooms"
              className="bg-green-600 text-white p-4 rounded-xl hover:bg-green-700 transition-colors text-center"
            >
              <BuildingOfficeIcon className="w-6 h-6 mx-auto mb-2" />
              <div className="font-semibold">Chambres</div>
              <div className="text-green-200 text-sm">{summary.totalRooms} chambres</div>
            </Link>

            <Link
              href="/admin/users"
              className="bg-purple-600 text-white p-4 rounded-xl hover:bg-purple-700 transition-colors text-center"
            >
              <UserGroupIcon className="w-6 h-6 mx-auto mb-2" />
              <div className="font-semibold">Clients</div>
              <div className="text-purple-200 text-sm">{summary.totalUsers} utilisateurs</div>
            </Link>

            <button
              onClick={fetchRevenueData}
              className="bg-gray-600 text-white p-4 rounded-xl hover:bg-gray-700 transition-colors text-center"
            >
              <ArrowPathIcon className="w-6 h-6 mx-auto mb-2" />
              <div className="font-semibold">Actualiser</div>
              <div className="text-gray-200 text-sm">Données temps réel</div>
            </button>
          </div>

          {/* Footer info */}
          <div className="mt-8 text-center text-gray-500 text-sm">
            <p className="mb-2">
              💰 Revenus et Chiffres d'Affaires • Données Prisma PostgreSQL • msylla01 • 2025-10-03 19:51:56
            </p>
            <div className="flex justify-center space-x-4 text-xs">
              <span>📊 Analyses temps réel</span>
              <span>💳 Paiements sécurisés</span>
              <span>📈 Tendances automatiques</span>
              <span>🔒 Accès admin uniquement</span>
              {error && <span className="text-red-600">⚠️ Mode Fallback</span>}
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
