import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  ArrowLeftIcon,
  StarIcon as StarIconOutline,
  CreditCardIcon,
  CalendarDaysIcon,
  GiftIcon,
  TrophyIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { StarIcon } from '@heroicons/react/24/solid'

export default function LoyaltyProgram() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loyaltyData, setLoyaltyData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('hotel_token')
    const userData = localStorage.getItem('hotel_user')
    
    if (!token || !userData) {
      router.push('/auth/login')
      return
    }

    const user = JSON.parse(userData)
    setUser(user)
    
    fetchLoyaltyData()
  }, [router])

  const fetchLoyaltyData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('hotel_token')
      
      // Récupérer les stats pour calculer les points fidélité
      const response = await fetch('http://localhost:5000/api/bookings/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          const stats = data.stats
          const loyaltyPoints = stats.loyaltyPoints || 0
          const totalSpent = stats.totalSpent || 0
          const totalBookings = stats.totalBookings || 0

          // Calculer le niveau de fidélité
          let level = 'Bronze'
          let levelColor = 'text-orange-600'
          let levelBg = 'bg-orange-100'
          let nextLevel = 'Silver'
          let pointsToNext = 500

          if (loyaltyPoints >= 2000) {
            level = 'Platine'
            levelColor = 'text-purple-600'
            levelBg = 'bg-purple-100'
            nextLevel = 'Diamant'
            pointsToNext = 5000 - loyaltyPoints
          } else if (loyaltyPoints >= 1000) {
            level = 'Gold'
            levelColor = 'text-yellow-600'
            levelBg = 'bg-yellow-100'
            nextLevel = 'Platine'
            pointsToNext = 2000 - loyaltyPoints
          } else if (loyaltyPoints >= 500) {
            level = 'Silver'
            levelColor = 'text-gray-600'
            levelBg = 'bg-gray-100'
            nextLevel = 'Gold'
            pointsToNext = 1000 - loyaltyPoints
          } else {
            pointsToNext = 500 - loyaltyPoints
          }

          setLoyaltyData({
            points: loyaltyPoints,
            level,
            levelColor,
            levelBg,
            nextLevel,
            pointsToNext: Math.max(0, pointsToNext),
            totalSpent,
            totalBookings,
            memberSince: stats.memberSince
          })
        }
      }
    } catch (error) {
      console.error('❌ Erreur récupération fidélité [msylla01]:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de votre programme fidélité...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <>
      <Head>
        <title>Programme Fidélité - Hotel Luxe</title>
        <meta name="description" content="Votre programme de fidélité Hotel Luxe" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-6">
              <Link
                href="/dashboard"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                <span>Retour au dashboard</span>
              </Link>
              
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                  <StarIcon className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-gray-900">Programme Fidélité</span>
              </div>

              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {user.firstName} {user.lastName}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              ⭐ Programme Fidélité Hotel Luxe
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Gagnez des points à chaque séjour et profitez d'avantages exclusifs !
            </p>
          </motion.div>

          {/* Statut Fidélité */}
          {loyaltyData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-2xl p-8 text-white mb-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    Niveau {loyaltyData.level}
                  </h2>
                  <p className="text-yellow-100 mb-4">
                    Vous avez <strong>{loyaltyData.points} points</strong> fidélité
                  </p>
                  <div className="flex items-center space-x-6 text-sm">
                    <div>
                      <span className="block text-white font-semibold">{loyaltyData.totalBookings}</span>
                      <span>Réservations</span>
                    </div>
                    <div>
                      <span className="block text-white font-semibold">{loyaltyData.totalSpent}€</span>
                      <span>Total dépensé</span>
                    </div>
                    <div>
                      <span className="block text-white font-semibold">
                        {loyaltyData.memberSince ? new Date(loyaltyData.memberSince).getFullYear() : '2024'}
                      </span>
                      <span>Membre depuis</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <TrophyIcon className="w-16 h-16 text-yellow-200 mx-auto mb-2" />
                  {loyaltyData.pointsToNext > 0 && (
                    <div className="text-yellow-100 text-sm">
                      <p>Plus que <strong>{loyaltyData.pointsToNext} points</strong></p>
                      <p>pour atteindre {loyaltyData.nextLevel}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Niveaux de Fidélité */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-sm p-8 mb-8"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6">🏆 Niveaux de Fidélité</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  name: 'Bronze',
                  points: '0 - 499 points',
                  color: 'from-orange-400 to-orange-600',
                  benefits: ['Points sur réservations', 'Newsletter exclusive'],
                  active: loyaltyData?.level === 'Bronze'
                },
                {
                  name: 'Silver',
                  points: '500 - 999 points',
                  color: 'from-gray-400 to-gray-600',
                  benefits: ['Check-out tardif gratuit', '5% de réduction'],
                  active: loyaltyData?.level === 'Silver'
                },
                {
                  name: 'Gold',
                  points: '1000 - 1999 points',
                  color: 'from-yellow-400 to-yellow-600',
                  benefits: ['Surclassement gratuit', '10% de réduction', 'Welcome drink'],
                  active: loyaltyData?.level === 'Gold'
                },
                {
                  name: 'Platine',
                  points: '2000+ points',
                  color: 'from-purple-400 to-purple-600',
                  benefits: ['Accès VIP', '15% de réduction', 'Petit-déjeuner gratuit'],
                  active: loyaltyData?.level === 'Platine'
                }
              ].map((level, index) => (
                <div
                  key={level.name}
                  className={`rounded-xl p-6 text-white ${
                    level.active 
                      ? `bg-gradient-to-br ${level.color} ring-4 ring-yellow-300` 
                      : 'bg-gray-300'
                  }`}
                >
                  <div className="text-center mb-4">
                    <h4 className="text-xl font-bold">{level.name}</h4>
                    <p className="text-sm opacity-90">{level.points}</p>
                    {level.active && (
                      <div className="mt-2">
                        <span className="bg-white text-gray-900 px-2 py-1 rounded-full text-xs font-medium">
                          Votre niveau actuel
                        </span>
                      </div>
                    )}
                  </div>
                  <ul className="text-sm space-y-1">
                    {level.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-center">
                        <StarIcon className="w-4 h-4 mr-2" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Comment gagner des points */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-2xl shadow-sm p-8 mb-8"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6">💰 Comment gagner des points ?</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-blue-50 rounded-xl">
                <CalendarDaysIcon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h4 className="font-semibold text-gray-900 mb-2">Réservations</h4>
                <p className="text-gray-600 text-sm">1 point par euro dépensé</p>
              </div>
              
              <div className="text-center p-6 bg-green-50 rounded-xl">
                <StarIconOutline className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h4 className="font-semibold text-gray-900 mb-2">Avis clients</h4>
                <p className="text-gray-600 text-sm">50 points par avis vérifié</p>
              </div>
              
              <div className="text-center p-6 bg-purple-50 rounded-xl">
                <GiftIcon className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h4 className="font-semibold text-gray-900 mb-2">Parrainage</h4>
                <p className="text-gray-600 text-sm">200 points par ami parrainé</p>
              </div>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-center"
          >
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                🎯 Continuez à gagner des points !
              </h3>
              <p className="text-gray-600 mb-6">
                Réservez votre prochain séjour et gagnez encore plus de points fidélité
              </p>
              <Link
                href="/rooms"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                <SparklesIcon className="w-5 h-5 mr-2" />
                Réserver maintenant
              </Link>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="mt-16 text-center text-gray-500"
          >
            <p className="text-sm">
              Programme Fidélité Hotel Luxe • msylla01 • 2025-10-03 09:14:26 UTC
            </p>
          </motion.div>
        </main>
      </div>
    </>
  )
}
