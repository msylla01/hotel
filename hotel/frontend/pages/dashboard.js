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
  PlusIcon
} from '@heroicons/react/24/outline'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Vérifier l'authentification
    const token = localStorage.getItem('hotel_token')
    const userData = localStorage.getItem('hotel_user')
    
    if (!token || !userData) {
      router.push('/auth/login')
      return
    }

    setUser(JSON.parse(userData))
    setLoading(false)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('hotel_token')
    localStorage.removeItem('hotel_user')
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
        <title>Dashboard - Hotel Luxe</title>
        <meta name="description" content="Votre espace personnel Hotel Luxe" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-4">
                <Link href="/" className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">H</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900">Hotel Luxe</span>
                </Link>
              </div>
              
              <div className="flex items-center space-x-4">
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <BellIcon className="h-6 w-6" />
                </button>
                
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
            <h1 className="text-3xl font-bold mb-2">
              Bienvenue, {user.firstName} ! 👋
            </h1>
            <p className="text-blue-100 mb-6">
              Gérez vos réservations et découvrez nos services exclusifs
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link
                href="/rooms"
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center space-x-2"
              >
                <PlusIcon className="w-5 h-5" />
                <span>Nouvelle réservation</span>
              </Link>
              
              <Link
                href="/rooms"
                className="border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Parcourir les chambres
              </Link>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <CalendarDaysIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Réservations</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CreditCardIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total dépensé</p>
                  <p className="text-2xl font-bold text-gray-900">0€</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <UserIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Statut</p>
                  <p className="text-2xl font-bold text-gray-900">Nouveau</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Mes Réservations',
                description: 'Consultez et gérez vos réservations',
                icon: CalendarDaysIcon,
                href: '/bookings',
                color: 'blue'
              },
              {
                title: 'Découvrir les Chambres',
                description: 'Explorez notre collection de chambres',
                icon: PlusIcon,
                href: '/rooms',
                color: 'green'
              },
              {
                title: 'Mon Profil',
                description: 'Gérez vos informations personnelles',
                icon: UserIcon,
                href: '/profile',
                color: 'purple'
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
                    <div className={`p-3 bg-${action.color}-100 rounded-lg`}>
                      <action.icon className={`h-6 w-6 text-${action.color}-600`} />
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

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-8 bg-white rounded-xl shadow-sm p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Activité Récente
            </h2>
            
            <div className="text-center py-8">
              <CalendarDaysIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune activité récente
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
          </motion.div>
        </main>
      </div>
    </>
  )
}
