import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  CalendarDaysIcon,
  UserIcon,
  HomeIcon,
  CurrencyEuroIcon,
  FunnelIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'

export default function AdminBookings() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({})
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
    fetchBookings()
  }, [router, currentPage, statusFilter])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      
      const token = localStorage.getItem('hotel_token')
      const params = new URLSearchParams({
        page: currentPage,
        limit: 15
      })
      
      if (statusFilter) params.append('status', statusFilter)

      const response = await fetch(`http://localhost:5000/api/admin/bookings?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setBookings(data.bookings)
        setPagination(data.pagination)
        
        // Calculer les stats
        const statsData = {
          total: data.pagination.total,
          pending: data.bookings.filter(b => b.status === 'PENDING').length,
          confirmed: data.bookings.filter(b => b.status === 'CONFIRMED').length,
          cancelled: data.bookings.filter(b => b.status === 'CANCELLED').length,
          completed: data.bookings.filter(b => b.status === 'COMPLETED').length,
          totalRevenue: data.bookings
            .filter(b => ['CONFIRMED', 'COMPLETED', 'CHECKED_OUT'].includes(b.status))
            .reduce((sum, b) => sum + Number(b.totalAmount), 0)
        }
        setStats(statsData)
        
        console.log(`✅ ${data.bookings.length} réservations chargées [msylla01] - 2025-10-03 17:51:35`)
      }
    } catch (error) {
      console.error('❌ Erreur chargement réservations [msylla01]:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      const token = localStorage.getItem('hotel_token')
      const response = await fetch(`http://localhost:5000/api/admin/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        const data = await response.json()
        // Mettre à jour la liste
        setBookings(bookings.map(b => 
          b.id === bookingId ? { ...b, status: newStatus } : b
        ))
        alert(`✅ Réservation mise à jour: ${newStatus}`)
      } else {
        const error = await response.json()
        alert(`❌ Erreur: ${error.message}`)
      }
    } catch (error) {
      console.error('❌ Erreur modification statut [msylla01]:', error)
      alert('❌ Erreur de connexion')
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
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

  const getStatusLabel = (status) => {
    const labels = {
      'PENDING': '⏳ En attente',
      'CONFIRMED': '✅ Confirmée',
      'CANCELLED': '❌ Annulée',
      'CHECKED_IN': '🏨 Arrivé',
      'CHECKED_OUT': '🚪 Parti',
      'COMPLETED': '✅ Terminée'
    }
    return labels[status] || status
  }

  const getAvailableStatuses = (currentStatus) => {
    const statusFlow = {
      'PENDING': ['CONFIRMED', 'CANCELLED'],
      'CONFIRMED': ['CHECKED_IN', 'CANCELLED'],
      'CHECKED_IN': ['CHECKED_OUT'],
      'CHECKED_OUT': ['COMPLETED'],
      'CANCELLED': [],
      'COMPLETED': []
    }
    return statusFlow[currentStatus] || []
  }

  if (loading && bookings.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des réservations...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Gestion Réservations - Admin Hotel Luxe</title>
        <meta name="description" content="Gestion des réservations - Dashboard administrateur" />
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
                <h1 className="text-xl font-bold text-gray-900">Gestion Réservations</h1>
              </div>

              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  👤 {user?.firstName} {user?.lastName}
                </span>
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">Admin</span>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <CalendarDaysIcon className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats.total || 0}</p>
                  <p className="text-gray-600 text-sm">Total</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <ClockIcon className="w-8 h-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats.pending || 0}</p>
                  <p className="text-gray-600 text-sm">En attente</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <CheckCircleIcon className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats.confirmed || 0}</p>
                  <p className="text-gray-600 text-sm">Confirmées</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <CheckCircleIcon className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats.completed || 0}</p>
                  <p className="text-gray-600 text-sm">Terminées</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <XCircleIcon className="w-8 h-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats.cancelled || 0}</p>
                  <p className="text-gray-600 text-sm">Annulées</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <CurrencyEuroIcon className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue || 0)}</p>
                  <p className="text-gray-600 text-sm">Revenus</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filtres */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center space-x-4">
              <FunnelIcon className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              >
                <option value="">Tous les statuts</option>
                <option value="PENDING">En attente</option>
                <option value="CONFIRMED">Confirmées</option>
                <option value="CHECKED_IN">Arrivées</option>
                <option value="CHECKED_OUT">Parties</option>
                <option value="COMPLETED">Terminées</option>
                <option value="CANCELLED">Annulées</option>
              </select>

              <button
                onClick={() => setStatusFilter('')}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Réinitialiser
              </button>
            </div>
          </div>

          {/* Liste des réservations */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Réservations ({pagination.total || 0})
              </h3>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Chargement...</p>
              </div>
            ) : bookings.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Réservation
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Client
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Chambre
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Dates
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Montant
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Statut
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {bookings.map((booking) => (
                        <motion.tr
                          key={booking.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                #{booking.id.slice(-8)}
                              </div>
                              <div className="text-sm text-gray-500">
                                {formatDateTime(booking.createdAt)}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                <UserIcon className="w-4 h-4 text-gray-600" />
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">
                                  {booking.user?.firstName} {booking.user?.lastName}
                                </div>
                                <div className="text-sm text-gray-500">{booking.user?.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{booking.room?.name}</div>
                            <div className="text-sm text-gray-500">{booking.room?.type}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div>Arrivée: {formatDate(booking.checkIn)}</div>
                            <div>Départ: {formatDate(booking.checkOut)}</div>
                            <div className="text-gray-500">{booking.guests} personne(s)</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {formatCurrency(booking.totalAmount)}
                            </div>
                            {booking.payment && booking.payment.length > 0 && (
                              <div className="text-sm text-gray-500">
                                Paiement: {booking.payment[0].status}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                              {getStatusLabel(booking.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              {getAvailableStatuses(booking.status).map((status) => (
                                <button
                                  key={status}
                                  onClick={() => updateBookingStatus(booking.id, status)}
                                  className="text-blue-600 hover:text-blue-900 text-xs px-2 py-1 border border-blue-300 rounded"
                                  title={`Changer vers ${getStatusLabel(status)}`}
                                >
                                  {status}
                                </button>
                              ))}                       
                              <button
                                onClick={() => alert(`Détails réservation: ${booking.id}`)}
                                className="text-gray-600 hover:text-gray-900"
                                title="Voir détails"
                              >
                                <EyeIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="px-6 py-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-700">
                        Page {pagination.page} sur {pagination.pages} 
                        ({pagination.total} réservations au total)
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronLeftIcon className="w-4 h-4" />
                        </button>
                        <span className="px-3 py-1 bg-red-600 text-white rounded">
                          {currentPage}
                        </span>
                        <button
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === pagination.pages}
                          className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronRightIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="p-8 text-center">
                <CalendarDaysIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Aucune réservation trouvée</p>
              </div>
            )}
          </div>

          {/* Footer info */}
          <div className="mt-8 text-center text-gray-500 text-sm">
            Gestion Réservations • Données Prisma PostgreSQL • msylla01 • 2025-10-03 17:58:31
          </div>
        </main>
      </div>
    </>
  )
}
