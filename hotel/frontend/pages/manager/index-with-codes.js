import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  HomeIcon,
  ClockIcon,
  CalendarDaysIcon,
  BanknotesIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  BuildingOfficeIcon,
  PrinterIcon,
  PlusIcon,
  ArrowPathIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

export default function ManagerDashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshInterval, setRefreshInterval] = useState(null)

  useEffect(() => {
    // Vérifier l'authentification gérant
    const token = localStorage.getItem('hotel_token')
    const userData = localStorage.getItem('hotel_user')
    
    console.log('🔐 Vérification auth gérant [msylla01] - 2025-10-04 00:34:01')
    console.log('Token présent:', !!token)
    console.log('UserData présent:', !!userData)
    
    if (!token || !userData) {
      console.log('❌ Pas de token ou userData, redirection login')
      router.push('/auth/login')
      return
    }

    try {
      const user = JSON.parse(userData)
      console.log('👤 Utilisateur:', {
        email: user.email,
        role: user.role,
        firstName: user.firstName
      })
      
      // CORRECTION: Vérifier que l'utilisateur est MANAGER ou ADMIN
      if (user.role !== 'MANAGER' && user.role !== 'ADMIN') {
        console.log('❌ Rôle non autorisé:', user.role, '- redirection dashboard')
        alert('❌ Accès réservé aux gérants et administrateurs')
        router.push('/dashboard')
        return
      }

      console.log('✅ Accès autorisé pour rôle:', user.role)
      setUser(user)
      fetchDashboardData()

      // Actualisation automatique toutes les 30 secondes
      const interval = setInterval(fetchDashboardData, 30000)
      setRefreshInterval(interval)

      return () => {
        if (interval) clearInterval(interval)
      }
    } catch (err) {
      console.error('❌ Erreur parsing user data [msylla01]:', err)
      router.push('/manager/login')
    }
  }, [router])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError('')

      console.log('🏨 Récupération dashboard gérant [msylla01] - 2025-10-04 00:34:01')

      const token = localStorage.getItem('hotel_token')
      const response = await fetch('http://localhost:5000/api/manager/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      console.log('📡 Réponse API dashboard:', response.status)

      const data = await response.json()

      if (response.ok && data.success) {
        setDashboardData(data.data)
        console.log('✅ Dashboard gérant récupéré [msylla01]')
      } else {
        console.log('⚠️ Erreur API, utilisation fallback:', data.message)
        throw new Error(data.message || 'Erreur de récupération')
      }
    } catch (error) {
      console.error('❌ Erreur récupération dashboard gérant [msylla01]:', error)
      setError(error.message)
      
      // Fallback data pour démonstration
      console.log('📋 Utilisation données fallback')
      setDashboardData({
        stats: {
          totalRooms: 5,
          occupiedRooms: 2,
          availableRooms: 3,
          activeBookings: 2,
          expiredBookings: 0,
          todayBookings: 3,
          todayRevenue: 175,
          occupancyRate: 40
        },
        rooms: [
          { id: '1', name: 'Chambre 101', type: 'DOUBLE', isOccupied: true, currentBooking: { type: 'HOURLY', checkOut: new Date(Date.now() + 2*60*60*1000) } },
          { id: '2', name: 'Suite 201', type: 'SUITE', isOccupied: false },
          { id: '3', name: 'Chambre 102', type: 'SINGLE', isOccupied: true, currentBooking: { type: 'NIGHTLY', checkOut: new Date(Date.now() + 8*60*60*1000) } },
          { id: '4', name: 'Chambre 103', type: 'DOUBLE', isOccupied: false },
          { id: '5', name: 'Suite 202', type: 'SUITE', isOccupied: false }
        ],
        alerts: [],
        hourlyRates: {
          'SINGLE': 15,
          'DOUBLE': 20,
          'SUITE': 35,
          'FAMILY': 25,
          'DELUXE': 45
        }
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    if (refreshInterval) clearInterval(refreshInterval)
    localStorage.removeItem('hotel_token')
    localStorage.removeItem('hotel_user')
    console.log('🚪 Déconnexion gérant [msylla01]')
    router.push('/manager/login')
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRoomStatusColor = (room) => {
    if (!room.isOccupied) return 'bg-green-100 text-green-800 border-green-300'
    
    const checkOut = new Date(room.currentBooking?.checkOut)
    const now = new Date()
    const minutesLeft = Math.round((checkOut - now) / (1000 * 60))
    
    if (minutesLeft < 0) return 'bg-red-100 text-red-800 border-red-300' // Expiré
    if (minutesLeft < 30) return 'bg-yellow-100 text-yellow-800 border-yellow-300' // Bientôt expiré
    return 'bg-blue-100 text-blue-800 border-blue-300' // Occupé normal
  }

  const getRoomStatusText = (room) => {
    if (!room.isOccupied) return 'Disponible'
    
    const checkOut = new Date(room.currentBooking?.checkOut)
    const now = new Date()
    const minutesLeft = Math.round((checkOut - now) / (1000 * 60))
    
    if (minutesLeft < 0) return `Expiré (-${Math.abs(minutesLeft)}min)`
    if (minutesLeft < 60) return `${minutesLeft}min restantes`
    
    const hoursLeft = Math.round(minutesLeft / 60)
    return `${hoursLeft}h restantes`
  }

  const getRoomTypeIcon = (type) => {
    const icons = {
      'SINGLE': '🛏️',
      'DOUBLE': '🛏️🛏️',
      'SUITE': '🏨',
      'FAMILY': '👨‍👩‍👧‍👦',
      'DELUXE': '✨'
    }
    return icons[type] || '🏨'
  }

  // Affichage loading pendant vérification auth
  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification accès gérant...</p>
          <p className="text-xs text-gray-500 mt-2">msylla01 • 2025-10-04 00:34:01</p>
        </div>
      </div>
    )
  }

  // Si pas d'utilisateur après vérification, ne rien afficher (redirection en cours)
  if (!user) {
    return null
  }

  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement espace gérant...</p>
          <p className="text-xs text-gray-500 mt-2">msylla01 • 2025-10-04 00:34:01</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Espace Gérant - Hotel Luxe</title>
        <meta name="description" content="Espace gérant pour gestion des séjours sur place - Hotel Luxe" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">G</span>
                </div>
                <div>
                  <span className="text-xl font-bold text-gray-900">Espace Gérant</span>
                  <span className="text-xs text-blue-600 ml-2">HOTEL LUXE</span>
                </div>
                
                {error && (
                  <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded text-xs">
                    Mode Fallback
                  </div>
                )}
              </div>

              <nav className="hidden md:flex items-center space-x-6">
                <Link href="/manager" className="text-blue-600 font-medium">
                  Dashboard
                </Link>
                <Link href="/manager/booking/hourly" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Horaire (1h-5h)
                </Link>
                <Link href="/manager/booking/nightly" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Nuitée (22h-12h)
                </Link>
                <Link href="/manager/booking/extended" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Séjour prolongé
                </Link>
                <Link href="/manager/reports" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Rapports
                </Link>
              </nav>

              <div className="flex items-center space-x-4">
                <button
                  onClick={fetchDashboardData}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Actualiser (auto: 30s)"
                >
                  <ArrowPathIcon className="w-5 h-5" />
                </button>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </span>
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-blue-600">
                      🏨 {user?.role === 'ADMIN' ? 'Admin' : 'Gérant'}
                    </p>
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

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Vue d'ensemble */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white">
              <h1 className="text-3xl font-bold mb-2">
                Espace Gérant 🏨
              </h1>
              <p className="text-blue-100 mb-4">
                Bienvenue {user?.firstName} ! Gérez les séjours sur place en temps réel.
              </p>
              <div className="text-xs text-blue-200 mb-4">
                Connecté en tant que : {user?.role} • {user?.email}
              </div>
              
              {dashboardData?.stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-blue-200">
                  <div className="flex items-center space-x-1">
                    <BuildingOfficeIcon className="w-4 h-4" />
                    <span>{dashboardData.stats.occupiedRooms}/{dashboardData.stats.totalRooms} occupées</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <ClockIcon className="w-4 h-4" />
                    <span>{dashboardData.stats.activeBookings} actives</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <BanknotesIcon className="w-4 h-4" />
                    <span>{formatCurrency(dashboardData.stats.todayRevenue)} aujourd'hui</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <ChartBarIcon className="w-4 h-4" />
                    <span>{dashboardData.stats.occupancyRate}% occupation</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Alertes expiration */}
          {dashboardData?.alerts && dashboardData.alerts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8"
            >
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="w-6 h-6 text-red-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-red-800">Alertes - Dépassements</h3>
                    <div className="mt-2 space-y-1">
                      {dashboardData.alerts.map((alert, index) => (
                        <p key={index} className="text-red-700 text-sm">
                          🚨 {alert.message}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Actions rapides */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              {
                title: 'Séjour Horaire',
                description: '1h à 5h',
                icon: ClockIcon,
                href: '/manager/booking/hourly',
                color: 'bg-green-500 hover:bg-green-600',
                rate: dashboardData?.hourlyRates ? `À partir de ${dashboardData.hourlyRates.SINGLE}€/h` : '15-45€/h'
              },
              {
                title: 'Nuitée',
                description: '22h00 - 12h00',
                icon: CalendarDaysIcon,
                href: '/manager/booking/nightly',
                color: 'bg-blue-500 hover:bg-blue-600',
                rate: 'Tarif chambre standard'
              },
              {
                title: 'Séjour Prolongé',
                description: 'Plusieurs jours',
                icon: UserGroupIcon,
                href: '/manager/booking/extended',
                color: 'bg-purple-500 hover:bg-purple-600',
                rate: 'Avec pièce d\'identité'
              },
              {
                title: 'Rapports',
                description: 'Journal & encaissements',
                icon: ChartBarIcon,
                href: '/manager/reports',
                color: 'bg-orange-500 hover:bg-orange-600',
                rate: 'Export disponible'
              }
            ].map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                <Link
                  href={action.href}
                  className="group block bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 ${action.color} rounded-lg transition-colors`}>
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <PlusIcon className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {action.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">
                    {action.description}
                  </p>
                  <p className="text-xs text-gray-500">
                    {action.rate}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* État des chambres en temps réel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-2xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                🏨 État des Chambres en Temps Réel
              </h3>
              <div className="text-sm text-gray-500">
                Mise à jour: {new Date().toLocaleTimeString('fr-FR')}
              </div>
            </div>
            
            {dashboardData?.rooms && dashboardData.rooms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dashboardData.rooms.map((room) => (
                  <motion.div
                    key={room.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${getRoomStatusColor(room)}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getRoomTypeIcon(room.type)}</span>
                        <h4 className="font-semibold">{room.name}</h4>
                      </div>
                      <span className="text-xs font-medium px-2 py-1 rounded bg-white bg-opacity-50">
                        {room.type}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Statut:</span>
                        <span className="text-sm font-bold">
                          {getRoomStatusText(room)}
                        </span>
                      </div>
                      
                      {room.isOccupied && room.currentBooking && (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Type séjour:</span>
                            <span className="text-sm font-medium">
                              {room.currentBooking.type === 'HOURLY' ? 'Horaire' :
                               room.currentBooking.type === 'NIGHTLY' ? 'Nuitée' : 'Prolongé'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Fin prévue:</span>
                            <span className="text-sm font-medium">
                              {formatTime(room.currentBooking.checkOut)}
                            </span>
                          </div>
                        </>
                      )}
                      
                      {!room.isOccupied && (
                        <div className="mt-3 space-y-2">
                          <Link
                            href={`/manager/booking/hourly?roomId=${room.id}`}
                            className="block w-full text-center bg-green-500 text-white py-2 rounded text-sm hover:bg-green-600 transition-colors"
                          >
                            Réserver (Horaire)
                          </Link>
                          <Link
                            href={`/manager/booking/nightly?roomId=${room.id}`}
                            className="block w-full text-center bg-blue-500 text-white py-1 rounded text-xs hover:bg-blue-600 transition-colors"
                          >
                            Nuitée
                          </Link>
                        </div>
                      )}
                      
                      {room.isOccupied && (
                        <Link
                          href={`/manager/checkout/${room.currentBooking?.id || room.id}`}
                          className="block w-full text-center bg-orange-500 text-white py-2 rounded text-sm hover:bg-orange-600 transition-colors mt-3"
                        >
                          Check-out
                        </Link>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BuildingOfficeIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Aucune chambre disponible</p>
              </div>
            )}
          </motion.div>

          {/* Footer info */}
          <div className="mt-8 text-center text-gray-500 text-sm">
            <p className="mb-2">
              🏨 Espace Gérant • Gestion séjours sur place • msylla01 • 2025-10-04 00:34:01
            </p>
            <div className="flex justify-center space-x-4 text-xs">
              <span>⏰ Actualisation auto: 30s</span>
              <span>🕐 Horaire: 1h-5h</span>
              <span>🌙 Nuitée: 22h-12h</span>
              <span>📅 Prolongé: +1 jour</span>
              <span>👤 Connecté: {user?.role}</span>
              {error && <span className="text-orange-600">⚠️ Mode Fallback</span>}
            </div>
          </div>
        </main>
      </div>
    </>
  )
}

// Fonction pour tracer les clics sur les liens
const handleNavClick = (pageName, href) => {
  console.log(`🖱️ Clic navigation [msylla01] - ${new Date().toISOString()}`)
  console.log(`   Page destination: ${pageName}`)
  console.log(`   URL: ${href}`)
  console.log(`   Token présent: ${!!localStorage.getItem('hotel_token')}`)
  console.log(`   User présent: ${!!localStorage.getItem('hotel_user')}`)
  console.log(`   Rôle actuel: ${user?.role}`)
}

// Ajoutez cet appel dans chaque Link des actions rapides :
// onClick={() => handleNavClick('Séjour Horaire', '/manager/booking/hourly')}
