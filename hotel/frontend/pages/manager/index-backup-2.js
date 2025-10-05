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
  ChartBarIcon,
  FireIcon,
  CloudIcon
} from '@heroicons/react/24/outline'

export default function ManagerDashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshInterval, setRefreshInterval] = useState(null)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    // Vérifier l'authentification gérant
    const token = localStorage.getItem('hotel_token')
    const userData = localStorage.getItem('hotel_user')
    
    console.log('�� Vérification auth gérant [msylla01] - 2025-10-04 02:57:35')
    
    if (!token || !userData) {
      router.push('/auth/login')
      return
    }

    try {
      const user = JSON.parse(userData)
      
      if (user.role !== 'MANAGER' && user.role !== 'ADMIN') {
        alert('❌ Accès réservé aux gérants et administrateurs')
        router.push('/dashboard')
        return
      }

      setUser(user)
      fetchDashboardData()

      // Actualisation automatique toutes les 30 secondes pour la marge de 10min
      const interval = setInterval(() => {
        setCurrentTime(new Date())
        fetchDashboardData()
      }, 30000)
      setRefreshInterval(interval)

      // Horloge temps réel chaque seconde
      const clockInterval = setInterval(() => {
        setCurrentTime(new Date())
      }, 1000)

      return () => {
        if (interval) clearInterval(interval)
        if (clockInterval) clearInterval(clockInterval)
      }
    } catch (err) {
      console.error('❌ Erreur auth gérant [msylla01]:', err)
      router.push('/auth/login')
    }
  }, [router])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError('')

      const token = localStorage.getItem('hotel_token')
      const response = await fetch('http://localhost:5000/api/manager/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setDashboardData(data.data)
      } else {
        throw new Error(data.message || 'Erreur de récupération')
      }
    } catch (error) {
      console.error('❌ Erreur récupération dashboard gérant [msylla01]:', error)
      setError(error.message)
      
      // Fallback data avec climatisation
      setDashboardData({
        stats: {
          totalRooms: 5,
          occupiedRooms: 2,
          availableRooms: 2,
          roomsInCleaningBuffer: 1,
          activeBookings: 2,
          expiredBookings: 0,
          todayBookings: 3,
          todayRevenue: 175,
          occupancyRate: 40
        },
        rooms: [
          { 
            id: '1', 
            name: 'CH1 - Chambre 101', 
            type: 'DOUBLE', 
            climateType: 'VENTILE',
            isOccupied: true, 
            currentBooking: { type: 'HOURLY', checkOut: new Date(Date.now() + 2*60*60*1000) },
            timeUntilAvailable: null
          },
          { 
            id: '2', 
            name: 'CH2 - Suite 201', 
            type: 'SUITE', 
            climateType: 'CLIMATISE',
            isOccupied: false,
            timeUntilAvailable: null
          },
          { 
            id: '3', 
            name: 'CH3 - Chambre 102', 
            type: 'SINGLE', 
            climateType: 'VENTILE',
            isOccupied: false,
            timeUntilAvailable: 8 // 8 minutes restantes avant disponibilité
          },
          { 
            id: '4', 
            name: 'CH4 - Chambre 103', 
            type: 'DOUBLE', 
            climateType: 'CLIMATISE',
            isOccupied: true, 
            currentBooking: { type: 'NIGHTLY', checkOut: new Date(Date.now() + 8*60*60*1000) },
            timeUntilAvailable: null
          },
          { 
            id: '5', 
            name: 'CH5 - Suite 202', 
            type: 'SUITE', 
            climateType: 'CLIMATISE',
            isOccupied: false,
            timeUntilAvailable: null
          }
        ],
        alerts: [],
        hourlyRates: {
          'SINGLE_VENTILE': 15,
          'SINGLE_CLIMATISE': 18,
          'DOUBLE_VENTILE': 20,
          'DOUBLE_CLIMATISE': 25,
          'SUITE_VENTILE': 35,
          'SUITE_CLIMATISE': 40,
          'FAMILY_VENTILE': 25,
          'FAMILY_CLIMATISE': 30,
          'DELUXE_VENTILE': 45,
          'DELUXE_CLIMATISE': 50
        },
        cleaningMargin: 10
      })
    } finally {
      setLoading(false)
    }
  }

  const getClimateIcon = (climateType) => {
    return climateType === 'CLIMATISE' ? (
      <CloudIcon className="w-4 h-4 text-blue-500" title="Climatisé" />
    ) : (
      <FireIcon className="w-4 h-4 text-orange-500" title="Ventilé" />
    )
  }

  const getClimateText = (climateType) => {
    return climateType === 'CLIMATISE' ? 'Climatisé' : 'Ventilé'
  }

  const getRoomStatusColor = (room) => {
    if (room.timeUntilAvailable !== null && room.timeUntilAvailable > 0) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-300' // En période de nettoyage
    }
    
    if (!room.isOccupied) {
      return 'bg-green-100 text-green-800 border-green-300' // Disponible
    }
    
    if (room.currentBooking) {
      const checkOut = new Date(room.currentBooking.checkOut)
      const now = new Date()
      const minutesLeft = Math.round((checkOut - now) / (1000 * 60))
      
      if (minutesLeft < 0) return 'bg-red-100 text-red-800 border-red-300' // Expiré
      if (minutesLeft < 30) return 'bg-orange-100 text-orange-800 border-orange-300' // Bientôt fini
    }
    
    return 'bg-blue-100 text-blue-800 border-blue-300' // Occupé normal
  }

  const getRoomStatusText = (room) => {
    if (room.timeUntilAvailable !== null && room.timeUntilAvailable > 0) {
      return `Nettoyage (${room.timeUntilAvailable}min)`
    }
    
    if (!room.isOccupied) {
      return 'Disponible'
    }
    
    if (room.currentBooking) {
      const checkOut = new Date(room.currentBooking.checkOut)
      const now = new Date()
      const minutesLeft = Math.round((checkOut - now) / (1000 * 60))
      
      if (minutesLeft < 0) return `Expiré (+${Math.abs(minutesLeft)}min)`
      if (minutesLeft < 60) return `${minutesLeft}min restantes`
      
      const hoursLeft = Math.round(minutesLeft / 60)
      return `${hoursLeft}h restantes`
    }
    
    return 'Occupé'
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const handleLogout = () => {
    if (refreshInterval) clearInterval(refreshInterval)
    localStorage.removeItem('hotel_token')
    localStorage.removeItem('hotel_user')
    router.push('/auth/login')
  }

  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification accès gérant...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement espace gérant...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Espace Gérant - Hotel Luxe</title>
        <meta name="description" content="Espace gérant avec gestion climatisation et marge 10min" />
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
                
                {/* Horloge temps réel */}
                <div className="bg-blue-50 px-3 py-1 rounded text-sm">
                  🕐 {currentTime.toLocaleTimeString('fr-FR')}
                </div>
                
                {error && (
                  <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded text-xs">
                    Mode Fallback
                  </div>
                )}
              </div>

              <nav className="hidden md:flex items-center space-x-6">
                <Link href="/manager" className="text-blue-600 font-medium">Dashboard</Link>
                <Link href="/manager/booking/hourly" className="text-gray-600 hover:text-blue-600 transition-colors">Horaire</Link>
                <Link href="/manager/booking/nightly" className="text-gray-600 hover:text-blue-600 transition-colors">Nuitée</Link>
                <Link href="/manager/booking/extended" className="text-gray-600 hover:text-blue-600 transition-colors">Prolongé</Link>
                <Link href="/manager/reports" className="text-gray-600 hover:text-blue-600 transition-colors">Rapports</Link>
              </nav>

              <div className="flex items-center space-x-4">
                <button
                  onClick={fetchDashboardData}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Actualiser"
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
                    <p className="text-xs text-blue-600">🏨 Gérant</p>
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
          {/* Vue d'ensemble avec marge de nettoyage */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white">
              <h1 className="text-3xl font-bold mb-2">Espace Gérant 🏨</h1>
              <p className="text-blue-100 mb-4">
                Bienvenue {user?.firstName} ! Gestion temps réel avec marge nettoyage 10min.
              </p>
              <div className="text-xs text-blue-200 mb-4">
                ✅ {user?.email} • 🕐 {currentTime.toLocaleString('fr-FR')} • Marge: {dashboardData?.cleaningMargin || 10}min
              </div>
              
              {dashboardData?.stats && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm text-blue-200">
                  <div className="flex items-center space-x-1">
                    <BuildingOfficeIcon className="w-4 h-4" />
                    <span>{dashboardData.stats.occupiedRooms}/{dashboardData.stats.totalRooms} occupées</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <CheckCircleIcon className="w-4 h-4" />
                    <span>{dashboardData.stats.availableRooms} disponibles</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <ClockIcon className="w-4 h-4" />
                    <span>{dashboardData.stats.roomsInCleaningBuffer || 0} nettoyage</span>
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

          {/* Actions rapides avec tarifs climatisation */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              {
                title: 'Séjour Horaire',
                description: '1h à 5h',
                icon: ClockIcon,
                href: '/manager/booking/hourly',
                color: 'bg-green-500 hover:bg-green-600',
                rate: 'Ventilé: 15-25€/h • Climatisé: 18-30€/h'
              },
              {
                title: 'Nuitée',
                description: '22h00 - 12h00',
                icon: CalendarDaysIcon,
                href: '/manager/booking/nightly',
                color: 'bg-blue-500 hover:bg-blue-600',
                rate: 'Selon type + climatisation'
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
                rate: 'Export CSV disponible'
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

          {/* État des chambres avec climatisation et marge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-2xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                🏨 Chambres Temps Réel (Marge 10min)
              </h3>
              <div className="text-sm text-gray-500">
                🕐 {currentTime.toLocaleTimeString('fr-FR')} • Auto-refresh 30s
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
                        {getClimateIcon(room.climateType)}
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-medium px-2 py-1 rounded bg-white bg-opacity-50">
                          {room.type}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {getClimateText(room.climateType)}
                        </div>
                      </div>
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
                        </>
                      )}
                      
                      {!room.isOccupied && (room.timeUntilAvailable === null || room.timeUntilAvailable <= 0) && (
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
                      
                      {room.timeUntilAvailable !== null && room.timeUntilAvailable > 0 && (
                        <div className="mt-3 text-center">
                          <div className="bg-yellow-500 text-white py-2 rounded text-sm">
                            🧹 Nettoyage {room.timeUntilAvailable}min
                          </div>
                        </div>
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

          {/* Info tarifs climatisation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-6 bg-white rounded-lg shadow-sm p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🌡️ Tarifs selon Climatisation</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {['SINGLE', 'DOUBLE', 'SUITE', 'FAMILY', 'DELUXE'].map(type => (
                <div key={type} className="space-y-2">
                  <div className="font-semibold text-gray-900 text-center">{type}</div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <FireIcon className="w-4 h-4 text-orange-500 mx-auto mb-1" />
                    <div className="text-sm font-bold text-orange-600">
                      {dashboardData?.hourlyRates?.[`${type}_VENTILE`] || 15}€/h
                    </div>
                    <div className="text-xs text-gray-600">Ventilé</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <CloudIcon className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                    <div className="text-sm font-bold text-blue-600">
                      {dashboardData?.hourlyRates?.[`${type}_CLIMATISE`] || 18}€/h
                    </div>
                    <div className="text-xs text-gray-600">Climatisé</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Footer info avec marge */}
          <div className="mt-8 text-center text-gray-500 text-sm">
            <p className="mb-2">
              🏨 Espace Gérant • Marge 10min • Climatisation • msylla01 • 2025-10-04 02:57:35
            </p>
            <div className="flex justify-center space-x-4 text-xs">
              <span>⏰ Auto-refresh: 30s</span>
              <span>🧹 Marge nettoyage: 10min</span>
              <span>🌡️ Ventilé/Climatisé</span>
              <span>🏷️ Codes: CH1, CH2...</span>
              {error && <span className="text-orange-600">⚠️ Mode Fallback</span>}
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
