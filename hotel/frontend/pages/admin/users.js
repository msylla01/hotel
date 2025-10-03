import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  UserGroupIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon,
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'

export default function AdminUsers() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
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
    fetchUsers()
  }, [router, currentPage, searchTerm, roleFilter, statusFilter])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      
      const token = localStorage.getItem('hotel_token')
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10
      })
      
      if (searchTerm) params.append('search', searchTerm)
      if (roleFilter) params.append('role', roleFilter)
      if (statusFilter) params.append('isActive', statusFilter)

      const response = await fetch(`http://localhost:5000/api/admin/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
        setPagination(data.pagination)
        
        // Calculer les stats
        const statsData = {
          total: data.pagination.total,
          active: data.users.filter(u => u.isActive).length,
          inactive: data.users.filter(u => !u.isActive).length,
          admins: data.users.filter(u => u.role === 'ADMIN').length,
          clients: data.users.filter(u => u.role === 'CLIENT').length
        }
        setStats(statsData)
        
        console.log(`✅ ${data.users.length} utilisateurs chargés [msylla01] - 2025-10-03 19:13:54`)
      }
    } catch (error) {
      console.error('❌ Erreur chargement utilisateurs [msylla01]:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem('hotel_token')
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !currentStatus })
      })

      if (response.ok) {
        const data = await response.json()
        // Mettre à jour la liste
        setUsers(users.map(u => 
          u.id === userId ? { ...u, isActive: !currentStatus } : u
        ))
        alert(`✅ Utilisateur ${!currentStatus ? 'activé' : 'désactivé'} avec succès`)
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
      year: 'numeric',
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

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des utilisateurs...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Gestion Utilisateurs - Admin Hotel Luxe</title>
        <meta name="description" content="Gestion des utilisateurs - Dashboard administrateur" />
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
                <h1 className="text-xl font-bold text-gray-900">Gestion Utilisateurs</h1>
              </div>

              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  👤 {user?.firstName} {user?.lastName}
                </span>
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">👑 Admin</span>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <UserGroupIcon className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats.total || 0}</p>
                  <p className="text-gray-600 text-sm">Total Utilisateurs</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <CheckCircleIcon className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats.active || 0}</p>
                  <p className="text-gray-600 text-sm">Actifs</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <XCircleIcon className="w-8 h-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats.inactive || 0}</p>
                  <p className="text-gray-600 text-sm">Inactifs</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
                  <span className="text-white text-sm font-bold">A</span>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats.admins || 0}</p>
                  <p className="text-gray-600 text-sm">Admins</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                  <span className="text-white text-sm font-bold">C</span>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats.clients || 0}</p>
                  <p className="text-gray-600 text-sm">Clients</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filtres et recherche */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher utilisateur..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Tous les rôles</option>
                  <option value="CLIENT">Clients</option>
                  <option value="ADMIN">Administrateurs</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Tous les statuts</option>
                  <option value="true">Actifs</option>
                  <option value="false">Inactifs</option>
                </select>
              </div>

              <button
                onClick={() => {
                  setSearchTerm('')
                  setRoleFilter('')
                  setStatusFilter('')
                }}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Réinitialiser
              </button>
            </div>
          </div>

          {/* Liste des utilisateurs */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Utilisateurs ({pagination.total || 0})
              </h3>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Chargement...</p>
              </div>
            ) : users.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Utilisateur
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Rôle
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Statut
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Activité
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Inscription
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <motion.tr
                          key={user.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                                <span className="text-gray-600 font-medium">
                                  {user.firstName?.[0]}{user.lastName?.[0]}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.firstName} {user.lastName}
                                </div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.role === 'ADMIN' 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {user.role === 'ADMIN' ? '👑 Admin' : '👤 Client'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {user.isActive ? '✅ Actif' : '❌ Inactif'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div>
                              <span>{user.totalBookings || 0} réservations</span>
                              {user.totalReviews > 0 && (
                                <div className="text-xs text-gray-500">
                                  {user.totalReviews} avis • ⭐ {user.averageRating || '0.0'}
                                </div>
                              )}
                            </div>
                            {user.totalSpent > 0 && (
                              <div className="text-xs text-green-600 font-medium">
                                {formatCurrency(user.totalSpent)}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(user.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <Link
                                href={`/admin/users/${user.id}`}
                                className="text-blue-600 hover:text-blue-900"
                                title="Voir détails"
                              >
                                <EyeIcon className="w-5 h-5" />
                              </Link>
                              
                              <button
                                onClick={() => toggleUserStatus(user.id, user.isActive)}
                                className={`${
                                  user.isActive 
                                    ? 'text-red-600 hover:text-red-900' 
                                    : 'text-green-600 hover:text-green-900'
                                }`}
                                title={user.isActive ? 'Désactiver' : 'Activer'}
                              >
                                {user.isActive ? <XCircleIcon className="w-5 h-5" /> : <CheckCircleIcon className="w-5 h-5" />}
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
                        ({pagination.total} utilisateurs au total)
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
                <UserGroupIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Aucun utilisateur trouvé</p>
              </div>
            )}
          </div>

          {/* Footer info */}
          <div className="mt-8 text-center text-gray-500 text-sm">
            Gestion Utilisateurs avec détails • Données Prisma PostgreSQL • msylla01 • 2025-10-03 19:13:54
          </div>
        </main>
      </div>
    </>
  )
}
