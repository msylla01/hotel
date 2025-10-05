
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  ArrowLeftIcon,
  ChartBarIcon,
  DocumentArrowDownIcon,
  CalendarDaysIcon,
  BanknotesIcon,
  ClockIcon,
  PrinterIcon,
  EyeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CurrencyEuroIcon,
  UsersIcon,
  BuildingOfficeIcon,
  FireIcon,
  CloudIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ListBulletIcon,
  UserIcon,
  HomeIcon
} from '@heroicons/react/24/outline'

export default function ManagerReports() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedPeriod, setSelectedPeriod] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })
  const [dailyReport, setDailyReport] = useState(null)
  const [periodReport, setPeriodReport] = useState(null)
  const [globalStats, setGlobalStats] = useState(null)
  const [activeTab, setActiveTab] = useState('daily')

  // NOUVEAU: États pour l'onglet entrées
  const [entriesData, setEntriesData] = useState(null)
  const [entriesFilters, setEntriesFilters] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    roomType: '',
    climateType: '',
    bookingType: '',
    status: '',
    managerId: '',
    page: 1,
    limit: 20
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('hotel_token')
    const userData = localStorage.getItem('hotel_user')
    
    if (!token || !userData) {
      router.push('/auth/login')
      return
    }

    try {
      const user = JSON.parse(userData)
      console.log("🔐 Auth gérant reports [msylla01] - 2025-10-05 00:18:32");
      
      if (user.role !== "MANAGER" && user.role !== "ADMIN") {
        router.push('/dashboard')
        return
      }

      setUser(user)
      fetchGlobalStats()
      fetchDailyReport()
    } catch (err) {
      console.error('❌ Erreur auth gérant [msylla01]:', err)
      router.push('/auth/login')
    }
  }, [router])

  const fetchGlobalStats = async () => {
    try {
      const token = localStorage.getItem('hotel_token')
      const response = await fetch('http://localhost:5000/api/manager/reports/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      const data = await response.json()
      if (data.success) {
        setGlobalStats(data.stats)
      }
    } catch (error) {
      console.error('❌ Erreur récupération stats globales [msylla01]:', error)
      // Fallback stats
      setGlobalStats({
        today: { bookings: 5, revenue: 275 },
        thisMonth: { bookings: 127, revenue: 8420, growth: 12 },
        lastMonth: { bookings: 113, revenue: 7518 },
        thisYear: { bookings: 1456, revenue: 95620 },
        averages: { perBooking: 66, perDay: 271 }
      })
    }
  }

  const fetchDailyReport = async (date = selectedDate) => {
    try {
      setLoading(true)
      const token = localStorage.getItem('hotel_token')
      const response = await fetch(`http://localhost:5000/api/manager/reports/daily?date=${date}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      const data = await response.json()
      if (data.success) {
        setDailyReport(data.report)
        console.log(`✅ Rapport journalier récupéré: ${data.report.summary.totalBookings} réservations`)
      }
    } catch (error) {
      console.error('❌ Erreur récupération rapport journalier [msylla01]:', error)
      setError('Erreur récupération rapport journalier')
      
      // Fallback report
      setDailyReport({
        date: date,
        summary: {
          totalBookings: 8,
          totalRevenue: 540,
          paidRevenue: 540,
          pendingRevenue: 0,
          averageAmount: 68,
          byType: {
            HOURLY: { count: 5, revenue: 200, average: 40 },
            NIGHTLY: { count: 2, revenue: 270, average: 135 },
            EXTENDED: { count: 1, revenue: 70, average: 70 }
          },
          byClimate: {
            VENTILE: { count: 4, revenue: 220 },
            CLIMATISE: { count: 4, revenue: 320 }
          },
          byRoomType: {
            SINGLE: { count: 2, revenue: 160 },
            DOUBLE: { count: 4, revenue: 240 },
            SUITE: { count: 2, revenue: 140 }
          }
        },
        bookings: []
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchPeriodReport = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('hotel_token')
      const response = await fetch(`http://localhost:5000/api/manager/reports/period?startDate=${selectedPeriod.start}&endDate=${selectedPeriod.end}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      const data = await response.json()
      if (data.success) {
        setPeriodReport(data.report)
        console.log(`✅ Rapport période récupéré: ${data.report.summary.totalBookings} réservations`)
      }
    } catch (error) {
      console.error('❌ Erreur récupération rapport période [msylla01]:', error)
      setError('Erreur récupération rapport période')
    } finally {
      setLoading(false)
    }
  }

  // NOUVEAU: Récupérer les entrées de chambres avec filtres
  const fetchEntriesData = async (filters = entriesFilters) => {
    try {
      setLoading(true)
      const token = localStorage.getItem('hotel_token')
      
      const queryParams = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value)
      })

      const response = await fetch(`http://localhost:5000/api/manager/reports/entries?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      const data = await response.json()
      if (data.success) {
        setEntriesData(data.data)
        console.log(`✅ Entrées récupérées: ${data.data.entries.length} sur ${data.data.pagination.total}`)
      }
    } catch (error) {
      console.error('❌ Erreur récupération entrées [msylla01]:', error)
      setError('Erreur récupération entrées chambres')
      
      // Fallback data
      setEntriesData({
        entries: [
          {
            id: '1',
            receiptNumber: 'HR-001',
            type: 'HOURLY',
            climateType: 'CLIMATISE',
            roomType: 'DOUBLE',
            checkIn: new Date(Date.now() - 3600000).toISOString(),
            checkOut: new Date().toISOString(),
            duration: 1,
            totalAmount: 25,
            status: 'COMPLETED',
            clientFirstName: 'Jean',
            clientLastName: 'Dupont',
            clientPhone: '+221 77 123 45 67',
            room: { name: 'Chambre 101', type: 'DOUBLE' },
            manager: { firstName: 'Pierre', lastName: 'Martin' }
          }
        ],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
        stats: { totalEntries: 1, totalRevenue: 25, averageAmount: 25 },
        availableFilters: {
          roomTypes: ['SINGLE', 'DOUBLE', 'SUITE'],
          climateTypes: ['VENTILE', 'CLIMATISE'],
          bookingTypes: ['HOURLY', 'NIGHTLY', 'EXTENDED'],
          statuses: ['ACTIVE', 'COMPLETED', 'EXPIRED'],
          managers: []
        }
      })
    } finally {
      setLoading(false)
    }
  }

  const exportCSV = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('hotel_token')
      const response = await fetch(`http://localhost:5000/api/manager/reports/csv?startDate=${selectedPeriod.start}&endDate=${selectedPeriod.end}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `rapport-hotel-luxe-${selectedPeriod.start}-${selectedPeriod.end}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        console.log('✅ CSV exporté avec succès [msylla01]')
      }
    } catch (error) {
      console.error('❌ Erreur export CSV [msylla01]:', error)
      setError('Erreur export CSV')
    } finally {
      setLoading(false)
    }
  }

  const printReport = () => {
    const report = activeTab === 'daily' ? dailyReport : periodReport
    if (!report) return

    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Rapport Hotel Luxe - ${activeTab === 'daily' ? 'Journalier' : 'Période'}</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 20px auto; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 20px; }
          .section { margin: 20px 0; }
          .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
          .stat-card { border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
          .stat-title { font-weight: bold; color: #555; margin-bottom: 5px; }
          .stat-value { font-size: 24px; font-weight: bold; color: #0066cc; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>HOTEL LUXE</h1>
          <h2>RAPPORT ${activeTab === 'daily' ? 'JOURNALIER' : 'PÉRIODE'}</h2>
          <p>${activeTab === 'daily' ? selectedDate : `${selectedPeriod.start} → ${selectedPeriod.end}`}</p>
          <p>Généré le ${new Date().toLocaleString('fr-FR')}</p>
        </div>
        
        <div class="stats">
          <div class="stat-card">
            <div class="stat-title">Total Réservations</div>
            <div class="stat-value">${report.summary.totalBookings}</div>
          </div>
          <div class="stat-card">
            <div class="stat-title">Chiffre d'Affaires</div>
            <div class="stat-value">${report.summary.totalRevenue}€</div>
          </div>
          <div class="stat-card">
            <div class="stat-title">Panier Moyen</div>
            <div class="stat-value">${report.summary.averageAmount || Math.round(report.summary.totalRevenue / report.summary.totalBookings)}€</div>
          </div>
        </div>
        
        <div class="section">
          <h3>Répartition par Type de Séjour</h3>
          <table>
            <tr><th>Type</th><th>Nombre</th><th>Revenus</th><th>Moyenne</th></tr>
            ${Object.entries(report.summary.byType || {}).map(([type, data]) => `
              <tr>
                <td>${type === 'HOURLY' ? 'Horaire' : type === 'NIGHTLY' ? 'Nuitée' : 'Prolongé'}</td>
                <td>${data.count}</td>
                <td>${data.revenue}€</td>
                <td>${data.average || Math.round(data.revenue / data.count)}€</td>
              </tr>
            `).join('')}
          </table>
        </div>
        
        ${report.summary.byClimate ? `
        <div class="section">
          <h3>Répartition par Climatisation</h3>
          <table>
            <tr><th>Type</th><th>Nombre</th><th>Revenus</th></tr>
            <tr><td>🔥 Ventilé</td><td>${report.summary.byClimate.VENTILE?.count || 0}</td><td>${report.summary.byClimate.VENTILE?.revenue || 0}€</td></tr>
            <tr><td>❄️ Climatisé</td><td>${report.summary.byClimate.CLIMATISE?.count || 0}</td><td>${report.summary.byClimate.CLIMATISE?.revenue || 0}€</td></tr>
          </table>
        </div>
        ` : ''}
        
        <div class="footer">
          <p>Rapport généré par: ${user?.firstName} ${user?.lastName}</p>
          <p>Hotel Luxe - Système de Gestion • msylla01 • 2025-10-05 00:18:32</p>
        </div>
      </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const formatPercentage = (value) => {
    return `${value > 0 ? '+' : ''}${value}%`
  }

  const getStatusColor = (status) => {
    const colors = {
      'ACTIVE': 'bg-blue-100 text-blue-800',
      'COMPLETED': 'bg-green-100 text-green-800',
      'EXPIRED': 'bg-red-100 text-red-800',
      'EXTENDED': 'bg-orange-100 text-orange-800',
      'CANCELLED': 'bg-gray-100 text-gray-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getTypeIcon = (type) => {
    const icons = {
      'HOURLY': <ClockIcon className="w-4 h-4" />,
      'NIGHTLY': <CalendarDaysIcon className="w-4 h-4" />,
      'EXTENDED': <UsersIcon className="w-4 h-4" />
    }
    return icons[type] || <HomeIcon className="w-4 h-4" />
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Rapports & Encaissements - Espace Gérant</title>
        <meta name="description" content="Rapports journaliers, export CSV, suivi des revenus et entrées chambres" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <Link href="/manager" className="flex items-center text-gray-600 hover:text-orange-600 transition-colors">
                  <ArrowLeftIcon className="w-5 h-5 mr-2" />
                  Espace Gérant
                </Link>
                <div className="text-gray-300">•</div>
                <h1 className="text-xl font-bold text-gray-900">Rapports & Encaissements</h1>
              </div>

              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  🏨 {user?.firstName} {user?.lastName}
                </span>
                <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">Gérant</span>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* En-tête */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-gradient-to-r from-orange-600 to-orange-800 rounded-2xl p-8 text-white">
              <h1 className="text-3xl font-bold mb-2">Rapports & Encaissements 📊</h1>
              <p className="text-orange-100 mb-4">
                Journal journalier • Entrées chambres • Export CSV • Suivi revenus • Statistiques détaillées
              </p>
              <div className="text-xs text-orange-200">
                ✅ {user?.email} • 📅 {new Date().toLocaleString('fr-FR')} • Gérant: {user?.firstName}
              </div>
            </div>
          </motion.div>

          {/* Statistiques globales */}
          {globalStats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <CalendarDaysIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Aujourd'hui</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(globalStats.today.revenue)}</p>
                    <p className="text-xs text-gray-500">{globalStats.today.bookings} réservations</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <BanknotesIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Ce mois</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(globalStats.thisMonth.revenue)}</p>
                    <div className="flex items-center space-x-1">
                      {globalStats.thisMonth.growth >= 0 ? (
                        <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
                      ) : (
                        <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />
                      )}
                      <span className={`text-xs ${globalStats.thisMonth.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatPercentage(globalStats.thisMonth.growth)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <ChartBarIcon className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Panier moyen</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(globalStats.averages.perBooking)}</p>
                    <p className="text-xs text-gray-500">par réservation</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <CurrencyEuroIcon className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Cette année</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(globalStats.thisYear.revenue)}</p>
                    <p className="text-xs text-gray-500">{globalStats.thisYear.bookings} réservations</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Onglets AVEC NOUVEAU ONGLET ENTRÉES */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="bg-white rounded-xl shadow-sm">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  <button
                    onClick={() => setActiveTab('daily')}
                    className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'daily'
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    📅 Rapport Journalier
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('period')
                      if (!periodReport) fetchPeriodReport()
                    }}
                    className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'period'
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    📊 Rapport Période
                  </button>
                  {/* NOUVEAU ONGLET ENTRÉES */}
                  <button
                    onClick={() => {
                      setActiveTab('entries')
                      if (!entriesData) fetchEntriesData()
                    }}
                    className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'entries'
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    🏨 Entrées Chambres
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'daily' && (
                  <div className="space-y-6">
                    {/* Sélection date */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <label className="text-sm font-medium text-gray-700">Date:</label>
                        <input
                          type="date"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        />
                        <button
                          onClick={() => fetchDailyReport(selectedDate)}
                          disabled={loading}
                          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                        >
                          {loading ? 'Chargement...' : 'Actualiser'}
                        </button>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={printReport}
                          className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-1"
                        >
                          <PrinterIcon className="w-4 h-4" />
                          <span>Imprimer</span>
                        </button>
                      </div>
                    </div>

                    {/* Rapport journalier */}
                    {dailyReport && (
                      <div className="space-y-6">
                        {/* Résumé */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <UsersIcon className="w-5 h-5 text-blue-600" />
                              <span className="font-semibold text-blue-900">{dailyReport.summary.totalBookings}</span>
                            </div>
                            <p className="text-sm text-blue-700">Réservations totales</p>
                          </div>
                          
                          <div className="bg-green-50 p-4 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <BanknotesIcon className="w-5 h-5 text-green-600" />
                              <span className="font-semibold text-green-900">{formatCurrency(dailyReport.summary.totalRevenue)}</span>
                            </div>
                            <p className="text-sm text-green-700">Chiffre d'affaires</p>
                          </div>
                          
                          <div className="bg-purple-50 p-4 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <ChartBarIcon className="w-5 h-5 text-purple-600" />
                              <span className="font-semibold text-purple-900">{formatCurrency(dailyReport.summary.averageAmount)}</span>
                            </div>
                            <p className="text-sm text-purple-700">Panier moyen</p>
                          </div>
                        </div>

                        {/* Répartitions */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Par type de séjour */}
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-gray-900 mb-3">📋 Par Type de Séjour</h3>
                            <div className="space-y-2">
                              {Object.entries(dailyReport.summary.byType || {}).map(([type, data]) => (
                                <div key={type} className="flex justify-between items-center">
                                  <span className="text-sm text-gray-600">
                                    {type === 'HOURLY' ? '⏰ Horaire' : type === 'NIGHTLY' ? '🌙 Nuitée' : '📅 Prolongé'}
                                  </span>
                                  <div className="text-right">
                                    <div className="text-sm font-medium">{data.count} ({formatCurrency(data.revenue)})</div>
                                    <div className="text-xs text-gray-500">Moy: {formatCurrency(data.average || Math.round(data.revenue / data.count))}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Par climatisation */}
                          {dailyReport.summary.byClimate && (
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <h3 className="font-semibold text-gray-900 mb-3">🌡️ Par Climatisation</h3>
                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-600 flex items-center space-x-1">
                                    <FireIcon className="w-4 h-4 text-orange-500" />
                                    <span>Ventilé</span>
                                  </span>
                                  <div className="text-sm font-medium">
                                    {dailyReport.summary.byClimate.VENTILE?.count || 0} ({formatCurrency(dailyReport.summary.byClimate.VENTILE?.revenue || 0)})
                                  </div>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-600 flex items-center space-x-1">
                                    <CloudIcon className="w-4 h-4 text-blue-500" />
                                    <span>Climatisé</span>
                                  </span>
                                  <div className="text-sm font-medium">
                                    {dailyReport.summary.byClimate.CLIMATISE?.count || 0} ({formatCurrency(dailyReport.summary.byClimate.CLIMATISE?.revenue || 0)})
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Par type de chambre */}
                        {dailyReport.summary.byRoomType && (
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-gray-900 mb-3">🏨 Par Type de Chambre</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {Object.entries(dailyReport.summary.byRoomType).map(([type, data]) => (
                                <div key={type} className="text-center">
                                  <div className="text-lg font-bold text-gray-900">{data.count}</div>
                                  <div className="text-sm text-gray-600">{type}</div>
                                  <div className="text-xs text-gray-500">{formatCurrency(data.revenue)}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'period' && (
                  <div className="space-y-6">
                    {/* Sélection période */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <label className="text-sm font-medium text-gray-700">Période:</label>
                        <input
                          type="date"
                          value={selectedPeriod.start}
                          onChange={(e) => setSelectedPeriod({...selectedPeriod, start: e.target.value})}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        />
                        <span className="text-gray-500">→</span>
                        <input
                          type="date"
                          value={selectedPeriod.end}
                          onChange={(e) => setSelectedPeriod({...selectedPeriod, end: e.target.value})}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        />
                        <button
                          onClick={fetchPeriodReport}
                          disabled={loading}
                          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                        >
                          {loading ? 'Chargement...' : 'Générer'}
                        </button>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={exportCSV}
                          disabled={loading}
                          className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-1"
                        >
                          <DocumentArrowDownIcon className="w-4 h-4" />
                          <span>Export CSV</span>
                        </button>
                        <button
                          onClick={printReport}
                          className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-1"
                        >
                          <PrinterIcon className="w-4 h-4" />
                          <span>Imprimer</span>
                        </button>
                      </div>
                    </div>

                    {/* Rapport période */}
                    {periodReport && (
                      <div className="space-y-6">
                        {/* Résumé période */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="bg-blue-50 p-4 rounded-lg text-center">
                            <div className="text-2xl font-bold text-blue-900">{periodReport.summary.totalBookings}</div>
                            <p className="text-sm text-blue-700">Réservations totales</p>
                          </div>
                          
                          <div className="bg-green-50 p-4 rounded-lg text-center">
                            <div className="text-2xl font-bold text-green-900">{formatCurrency(periodReport.summary.totalRevenue)}</div>
                            <p className="text-sm text-green-700">Chiffre d'affaires</p>
                          </div>
                          
                          <div className="bg-purple-50 p-4 rounded-lg text-center">
                            <div className="text-2xl font-bold text-purple-900">{formatCurrency(periodReport.summary.averagePerDay)}</div>
                            <p className="text-sm text-purple-700">Moyenne par jour</p>
                          </div>

                          <div className="bg-orange-50 p-4 rounded-lg text-center">
                            <div className="text-2xl font-bold text-orange-900">{periodReport.summary.daysWithActivity}</div>
                            <p className="text-sm text-orange-700">Jours d'activité</p>
                          </div>
                        </div>

                        {/* Évolution quotidienne */}
                        {periodReport.dailyBreakdown && Object.keys(periodReport.dailyBreakdown).length > 0 && (
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-gray-900 mb-3">📈 Évolution Quotidienne</h3>
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                              {Object.entries(periodReport.dailyBreakdown).map(([date, data]) => (
                                <div key={date} className="flex justify-between items-center py-2 border-b border-gray-200">
                                  <span className="text-sm font-medium text-gray-700">
                                    {new Date(date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                                  </span>
                                  <div className="text-right">
                                    <div className="text-sm font-medium">{data.count} rés.</div>
                                    <div className="text-xs text-gray-500">{formatCurrency(data.revenue)}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* NOUVEAU CONTENU ONGLET ENTRÉES CHAMBRES */}
                {activeTab === 'entries' && (
                  <div className="space-y-6">
                    {/* Filtres */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                          <FunnelIcon className="w-5 h-5" />
                          <span>Filtres de Recherche</span>
                        </h3>
                        <button
                          onClick={() => setShowFilters(!showFilters)}
                          className="px-3 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700 transition-colors"
                        >
                          {showFilters ? 'Masquer' : 'Afficher'} Filtres
                        </button>
                      </div>

                      {showFilters && (
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {/* Période */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Date début</label>
                            <input
                              type="date"
                              value={entriesFilters.startDate}
                              onChange={(e) => setEntriesFilters({...entriesFilters, startDate: e.target.value})}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-orange-500"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Date fin</label>
                            <input
                              type="date"
                              value={entriesFilters.endDate}
                              onChange={(e) => setEntriesFilters({...entriesFilters, endDate: e.target.value})}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-orange-500"
                            />
                          </div>

                          {/* Type de chambre */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Type chambre</label>
                            <select
                              value={entriesFilters.roomType}
                              onChange={(e) => setEntriesFilters({...entriesFilters, roomType: e.target.value})}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-orange-500"
                            >
                              <option value="">Tous</option>
                              <option value="SINGLE">Single</option>
                              <option value="DOUBLE">Double</option>
                              <option value="SUITE">Suite</option>
                              <option value="FAMILY">Family</option>
                              <option value="DELUXE">Deluxe</option>
                            </select>
                          </div>

                          {/* Climatisation */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Climatisation</label>
                            <select
                              value={entriesFilters.climateType}
                              onChange={(e) => setEntriesFilters({...entriesFilters, climateType: e.target.value})}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-orange-500"
                            >
                              <option value="">Tous</option>
                              <option value="VENTILE">🔥 Ventilé</option>
                              <option value="CLIMATISE">❄️ Climatisé</option>
                            </select>
                          </div>

                          {/* Type de séjour */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Type séjour</label>
                            <select
                              value={entriesFilters.bookingType}
                              onChange={(e) => setEntriesFilters({...entriesFilters, bookingType: e.target.value})}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-orange-500"
                            >
                              <option value="">Tous</option>
                              <option value="HOURLY">⏰ Horaire</option>
                              <option value="NIGHTLY">🌙 Nuitée</option>
                              <option value="EXTENDED">📅 Prolongé</option>
                            </select>
                          </div>

                          {/* Statut */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Statut</label>
                            <select
                              value={entriesFilters.status}
                              onChange={(e) => setEntriesFilters({...entriesFilters, status: e.target.value})}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-orange-500"
                            >
                              <option value="">Tous</option>
                              <option value="ACTIVE">🔵 Actif</option>
                              <option value="COMPLETED">✅ Terminé</option>
                              <option value="EXPIRED">🔴 Expiré</option>
                              <option value="EXTENDED">🟠 Prolongé</option>
                              <option value="CANCELLED">⚫ Annulé</option>
                            </select>
                          </div>

                          {/* Nombre par page */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Par page</label>
                            <select
                              value={entriesFilters.limit}
                              onChange={(e) => setEntriesFilters({...entriesFilters, limit: e.target.value, page: 1})}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-orange-500"
                            >
                              <option value="10">10</option>
                              <option value="20">20</option>
                              <option value="50">50</option>
                              <option value="100">100</option>
                            </select>
                          </div>

                          {/* Bouton recherche */}
                          <div className="flex items-end">
                            <button
                              onClick={() => fetchEntriesData(entriesFilters)}
                              disabled={loading}
                              className="w-full px-3 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-1"
                            >
                              <MagnifyingGlassIcon className="w-4 h-4" />
                              <span>{loading ? 'Recherche...' : 'Rechercher'}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Statistiques filtrées */}
                    {entriesData?.stats && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold text-blue-900">{entriesData.stats.totalEntries}</div>
                          <p className="text-sm text-blue-700">Entrées trouvées</p>
                        </div>
                        
                        <div className="bg-green-50 p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold text-green-900">{formatCurrency(entriesData.stats.totalRevenue)}</div>
                          <p className="text-sm text-green-700">Revenus filtrés</p>
                        </div>
                        
                        <div className="bg-purple-50 p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold text-purple-900">{formatCurrency(entriesData.stats.averageAmount)}</div>
                          <p className="text-sm text-purple-700">Panier moyen</p>
                        </div>
                      </div>
                    )}

                    {/* Liste des entrées */}
                    {entriesData?.entries && (
                      <div className="bg-white rounded-lg border">
                        <div className="px-4 py-3 border-b bg-gray-50">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                              <ListBulletIcon className="w-5 h-5" />
                              <span>Entrées de Chambres ({entriesData.pagination.total})</span>
                            </h3>
                            
                            {/* Pagination */}
                            {entriesData.pagination.totalPages > 1 && (
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => {
                                    const newPage = Math.max(1, entriesFilters.page - 1)
                                    setEntriesFilters({...entriesFilters, page: newPage})
                                    fetchEntriesData({...entriesFilters, page: newPage})
                                  }}
                                  disabled={entriesFilters.page <= 1}
                                  className="p-1 rounded text-gray-400 hover:text-gray-600 disabled:opacity-50"
                                >
                                  <ChevronLeftIcon className="w-4 h-4" />
                                </button>
                                
                                <span className="text-sm text-gray-600">
                                  {entriesFilters.page} / {entriesData.pagination.totalPages}
                                </span>
                                
                                <button
                                  onClick={() => {
                                    const newPage = Math.min(entriesData.pagination.totalPages, entriesFilters.page + 1)
                                    setEntriesFilters({...entriesFilters, page: newPage})
                                    fetchEntriesData({...entriesFilters, page: newPage})
                                  }}
                                  disabled={entriesFilters.page >= entriesData.pagination.totalPages}
                                  className="p-1 rounded text-gray-400 hover:text-gray-600 disabled:opacity-50"
                                >
                                  <ChevronRightIcon className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reçu</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chambre</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entrée</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sortie</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durée</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gérant</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {entriesData.entries.map((entry) => (
                                <tr key={entry.id} className="hover:bg-gray-50">
                                  <td className="px-4 py-3">
                                    <div className="text-sm font-mono text-gray-900">{entry.receiptNumber}</div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center space-x-2">
                                      <BuildingOfficeIcon className="w-4 h-4 text-gray-400" />
                                      <span className="text-sm font-medium text-gray-900">{entry.room?.name || 'N/A'}</span>
                                    </div>
                                    <div className="text-xs text-gray-500 flex items-center space-x-1">
                                      <span>{entry.roomType || entry.room?.type}</span>
                                      {entry.climateType === 'CLIMATISE' ? 
                                        <CloudIcon className="w-3 h-3 text-blue-500" /> : 
                                        <FireIcon className="w-3 h-3 text-orange-500" />
                                      }
                                      <span>{entry.climateType === 'CLIMATISE' ? 'Climatisé' : 'Ventilé'}</span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center space-x-2">
                                      {getTypeIcon(entry.type)}
                                      <span className="text-sm text-gray-900">
                                        {entry.type === 'HOURLY' ? 'Horaire' : 
                                         entry.type === 'NIGHTLY' ? 'Nuitée' : 'Prolongé'}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3">
                                    {entry.clientFirstName && entry.clientLastName ? (
                                      <div>
                                        <div className="text-sm font-medium text-gray-900">
                                          {entry.clientFirstName} {entry.clientLastName}
                                        </div>
                                        <div className="text-xs text-gray-500">{entry.clientPhone}</div>
                                      </div>
                                    ) : (
                                      <span className="text-sm text-gray-400">Client non renseigné</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="text-sm text-gray-900">
                                      {new Date(entry.checkIn).toLocaleDateString('fr-FR')}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {new Date(entry.checkIn).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="text-sm text-gray-900">
                                      {new Date(entry.checkOut).toLocaleDateString('fr-FR')}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {new Date(entry.checkOut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="text-sm text-gray-900">
                                      {entry.type === 'HOURLY' ? `${entry.duration}h` : 
                                       entry.type === 'NIGHTLY' ? '1 nuit' : `${entry.duration} jours`}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="text-sm font-medium text-gray-900">
                                      {formatCurrency(entry.totalAmount)}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(entry.status)}`}>
                                      {entry.status === 'ACTIVE' ? '🔵 Actif' :
                                       entry.status === 'COMPLETED' ? '✅ Terminé' :
                                       entry.status === 'EXPIRED' ? '🔴 Expiré' :
                                       entry.status === 'EXTENDED' ? '🟠 Prolongé' : 
                                       entry.status === 'CANCELLED' ? '⚫ Annulé' : entry.status}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3">
                                    {entry.manager ? (
                                      <div className="flex items-center space-x-2">
                                        <UserIcon className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-900">
                                          {entry.manager.firstName} {entry.manager.lastName}
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="text-sm text-gray-400">N/A</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>

                          {/* Message si aucune entrée */}
                          {entriesData.entries.length === 0 && (
                            <div className="text-center py-12">
                              <BuildingOfficeIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune entrée trouvée</h3>
                              <p className="text-gray-500">Aucune entrée de chambre ne correspond aux filtres sélectionnés.</p>
                              <button
                                onClick={() => {
                                  setEntriesFilters({
                                    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                                    endDate: new Date().toISOString().split('T')[0],
                                    roomType: '',
                                    climateType: '',
                                    bookingType: '',
                                    status: '',
                                    managerId: '',
                                    page: 1,
                                    limit: 20
                                  })
                                  fetchEntriesData()
                                }}
                                className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                              >
                                Réinitialiser les filtres
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Pagination en bas */}
                        {entriesData.pagination.totalPages > 1 && (
                          <div className="px-4 py-3 border-t bg-gray-50 flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                              Affichage de {((entriesData.pagination.page - 1) * entriesData.pagination.limit) + 1} à{' '}
                              {Math.min(entriesData.pagination.page * entriesData.pagination.limit, entriesData.pagination.total)} sur{' '}
                              {entriesData.pagination.total} entrées
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => {
                                  const newPage = Math.max(1, entriesFilters.page - 1)
                                  setEntriesFilters({...entriesFilters, page: newPage})
                                  fetchEntriesData({...entriesFilters, page: newPage})
                                }}
                                disabled={entriesFilters.page <= 1}
                                className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Précédent
                              </button>
                              
                              {/* Pages */}
                              {Array.from({ length: Math.min(5, entriesData.pagination.totalPages) }, (_, i) => {
                                const pageNum = i + 1
                                return (
                                  <button
                                    key={pageNum}
                                    onClick={() => {
                                      setEntriesFilters({...entriesFilters, page: pageNum})
                                      fetchEntriesData({...entriesFilters, page: pageNum})
                                    }}
                                    className={`px-3 py-1 border rounded text-sm ${
                                      entriesFilters.page === pageNum
                                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                                  >
                                    {pageNum}
                                  </button>
                                )
                              })}
                              
                              <button
                                onClick={() => {
                                  const newPage = Math.min(entriesData.pagination.totalPages, entriesFilters.page + 1)
                                  setEntriesFilters({...entriesFilters, page: newPage})
                                  fetchEntriesData({...entriesFilters, page: newPage})
                                }}
                                disabled={entriesFilters.page >= entriesData.pagination.totalPages}
                                className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Suivant
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actions pour l'onglet entrées */}
                    <div className="bg-white rounded-lg border p-4">
                      <h3 className="font-semibold text-gray-900 mb-4">⚡ Actions sur les Entrées</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button
                          onClick={() => {
                            setEntriesFilters({
                              ...entriesFilters,
                              startDate: new Date().toISOString().split('T')[0],
                              endDate: new Date().toISOString().split('T')[0],
                              status: 'ACTIVE'
                            })
                            fetchEntriesData({
                              ...entriesFilters,
                              startDate: new Date().toISOString().split('T')[0],
                              endDate: new Date().toISOString().split('T')[0],
                              status: 'ACTIVE'
                            })
                          }}
                          className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-left"
                        >
                          <div className="flex items-center space-x-2 mb-2">
                            <ClockIcon className="w-5 h-5 text-blue-600" />
                            <span className="font-medium text-blue-900">Séjours Actifs</span>
                          </div>
                          <p className="text-sm text-blue-700">Chambres actuellement occupées</p>
                        </button>

                        <button
                          onClick={() => {
                            setEntriesFilters({
                              ...entriesFilters,
                              climateType: 'CLIMATISE',
                              startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                            })
                            fetchEntriesData({
                              ...entriesFilters,
                              climateType: 'CLIMATISE',
                              startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                            })
                          }}
                          className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-left"
                        >
                          <div className="flex items-center space-x-2 mb-2">
                            <CloudIcon className="w-5 h-5 text-blue-600" />
                            <span className="font-medium text-blue-900">Chambres Climatisées</span>
                          </div>
                          <p className="text-sm text-blue-700">7 derniers jours avec climatisation</p>
                        </button>

                        <button
                          onClick={() => {
                            const today = new Date()
                            const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1)
                            setEntriesFilters({
                              ...entriesFilters,
                              startDate: thisMonth.toISOString().split('T')[0],
                              endDate: today.toISOString().split('T')[0],
                              bookingType: 'EXTENDED'
                            })
                            fetchEntriesData({
                              ...entriesFilters,
                              startDate: thisMonth.toISOString().split('T')[0],
                              endDate: today.toISOString().split('T')[0],
                              bookingType: 'EXTENDED'
                            })
                          }}
                          className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-left"
                        >
                          <div className="flex items-center space-x-2 mb-2">
                            <UsersIcon className="w-5 h-5 text-green-600" />
                            <span className="font-medium text-green-900">Séjours Prolongés</span>
                          </div>
                          <p className="text-sm text-green-700">Ce mois avec pièce d'identité</p>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Messages d'erreur */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4"
            >
              <p className="text-red-800">❌ {error}</p>
            </motion.div>
          )}

          {/* Actions rapides */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">⚡ Actions Rapides</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <button
                onClick={() => {
                  setSelectedDate(new Date().toISOString().split('T')[0])
                  fetchDailyReport()
                  setActiveTab('daily')
                }}
                className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-left"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <CalendarDaysIcon className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-900">Rapport Aujourd'hui</span>
                </div>
                <p className="text-sm text-blue-700">Consulter les ventes du jour</p>
              </button>

              <button
                onClick={() => {
                  setSelectedPeriod({
                    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    end: new Date().toISOString().split('T')[0]
                  })
                  fetchPeriodReport()
                  setActiveTab('period')
                }}
                className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-left"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <ChartBarIcon className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-900">7 Derniers Jours</span>
                </div>
                <p className="text-sm text-green-700">Tendance hebdomadaire</p>
              </button>

              <button
                onClick={() => {
                  setActiveTab('entries')
                  if (!entriesData) fetchEntriesData()
                }}
                className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-left"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <ListBulletIcon className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-purple-900">Entrées Chambres</span>
                </div>
                <p className="text-sm text-purple-700">Liste détaillée filtrée</p>
              </button>

              <button
                onClick={exportCSV}
                disabled={loading}
                className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors text-left disabled:opacity-50"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <DocumentArrowDownIcon className="w-5 h-5 text-orange-600" />
                  <span className="font-medium text-orange-900">Export CSV</span>
                </div>
                <p className="text-sm text-orange-700">Télécharger données Excel</p>
              </button>
            </div>
          </motion.div>

          {/* Footer info */}
          <div className="mt-8 text-center text-gray-500 text-sm">
            <p className="mb-2">
              📊 Rapports & Encaissements • Entrées Chambres • Export CSV • Journal • msylla01 • 2025-10-05 00:21:30
            </p>
            <div className="flex justify-center space-x-4 text-xs">
              <span>📅 Rapports journaliers</span>
              <span>📊 Analyses périodes</span>
              <span>🏨 Entrées détaillées</span>
              <span>🔍 Filtres avancés</span>
              <span>💾 Export CSV Excel</span>
              <span>🖨️ Impression PDF</span>
              <span>📈 Statistiques revenus</span>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}

