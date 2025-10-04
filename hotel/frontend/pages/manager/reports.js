import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  ArrowLeftIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline'

export default function ManagerReports() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('hotel_token')
    const userData = localStorage.getItem('hotel_user')
    
    console.log('🔐 Vérification auth page rapports [msylla01] - 2025-10-04 02:16:50')
    
    if (!token || !userData) {
      router.push('/auth/login')
      return
    }

    try {
      const user = JSON.parse(userData)
      if (!['MANAGER', 'ADMIN'].includes(user.role)) {
        router.push('/dashboard')
        return
      }
      setUser(user)
      setLoading(false)
    } catch (err) {
      router.push('/auth/login')
    }
  }, [router])

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Rapports - Espace Gérant</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <Link href="/manager" className="flex items-center text-gray-600 hover:text-orange-600 transition-colors">
                  <ArrowLeftIcon className="w-5 h-5 mr-2" />
                  Retour Dashboard
                </Link>
                <div className="text-gray-300">•</div>
                <h1 className="text-xl font-bold text-gray-900">Rapports & Encaissements</h1>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm p-8"
          >
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center">
                <ChartBarIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Rapports & Encaissements</h2>
                <p className="text-gray-600">Journal journalier • Export CSV • Suivi revenus</p>
              </div>
            </div>

            <div className="text-center py-12">
              <DocumentArrowDownIcon className="w-16 h-16 text-orange-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Page en développement
              </h3>
              <p className="text-gray-600 mb-6">
                Les rapports et encaissements sont en cours de développement.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="font-semibold text-orange-900">Rapport journalier</div>
                  <div className="text-lg font-bold text-orange-600">Aujourd'hui</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="font-semibold text-green-900">Export CSV</div>
                  <div className="text-lg font-bold text-green-600">Disponible</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="font-semibold text-blue-900">Encaissements</div>
                  <div className="text-lg font-bold text-blue-600">Temps réel</div>
                </div>
              </div>

              <Link
                href="/manager"
                className="inline-flex items-center bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Retour au Dashboard
              </Link>
            </div>
          </motion.div>
        </main>
      </div>
    </>
  )
}
