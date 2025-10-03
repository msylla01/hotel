import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  PlusIcon,
  HomeIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'

export default function AdminRooms() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    type: '',
    status: 'all'
  })

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
    fetchRooms()
  }, [router])

  const fetchRooms = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:5000/api/rooms')
      const data = await response.json()
      
      if (data.success) {
        setRooms(data.rooms || [])
      }
    } catch (error) {
      console.error('Erreur chargement chambres:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRoomTypeLabel = (type) => {
    const types = {
      'SINGLE': 'Simple',
      'DOUBLE': 'Double',
      'SUITE': 'Suite',
      'FAMILY': 'Familiale',
      'DELUXE': 'Deluxe'
    }
    return types[type] || type
  }

  const getStatusBadge = (isActive) => {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isActive 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {isActive ? 'Active' : 'Inactive'}
      </span>
    )
  }

  const filteredRooms = rooms.filter(room => {
    if (filters.type && room.type !== filters.type) return false
    if (filters.status === 'active' && !room.isActive) return false
    if (filters.status === 'inactive' && room.isActive) return false
    return true
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Gestion des Chambres - Admin Hotel Luxe</title>
        <meta name="description" content="Interface d'administration pour la gestion des chambres" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header Admin */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <Link href="/admin" className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">A</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900">Admin Panel</span>
                </Link>
              </div>

              <nav className="hidden md:flex items-center space-x-6">
                <Link href="/admin" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Dashboard
                </Link>
                <span className="text-blue-600 font-medium">Chambres</span>
                <Link href="/admin/bookings" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Réservations
                </Link>
              </nav>

              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Admin: {user?.firstName}</span>
                <Link
                  href="/"
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Retour au site
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* En-tête */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Gestion des Chambres
              </h1>
              <p className="text-gray-600 mt-1">
                {filteredRooms.length} chambre{filteredRooms.length > 1 ? 's' : ''} • Dernière mise à jour: {new Date().toLocaleTimeString('fr-FR')}
              </p>
            </div>
            
            <Link
              href="/admin/rooms/new"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Ajouter une chambre</span>
            </Link>
          </div>

          {/* Filtres */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex items-center space-x-4">
              <FunnelIcon className="w-5 h-5 text-gray-400" />
              
              <select
                value={filters.type}
                onChange={(e) => setFilters({...filters, type: e.target.value})}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les types</option>
                <option value="SINGLE">Simple</option>
                <option value="DOUBLE">Double</option>
                <option value="SUITE">Suite</option>
                <option value="FAMILY">Familiale</option>
                <option value="DELUXE">Deluxe</option>
              </select>
              
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actives</option>
                <option value="inactive">Inactives</option>
              </select>
              
              <div className="flex-1"></div>
              
              <span className="text-sm text-gray-500">
                {filteredRooms.length} résultat{filteredRooms.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Liste des chambres */}
          {filteredRooms.length > 0 ? (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Chambre
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Prix
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Capacité
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRooms.map((room, index) => (
                      <motion.tr
                        key={room.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                              <HomeIcon className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {room.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {room.size}m² • {room.amenities?.length || 0} équipements
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {getRoomTypeLabel(room.type)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="font-semibold">{room.price}€</span>
                          <span className="text-gray-500">/nuit</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {room.capacity} pers.
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(room.isActive)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <Link
                              href={`/rooms/${room.id}`}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                              title="Voir"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </Link>
                            <Link
                              href={`/admin/rooms/${room.id}/edit`}
                              className="text-yellow-600 hover:text-yellow-900 p-1 rounded hover:bg-yellow-50"
                              title="Modifier"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </Link>
                            <button
                              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                              title="Supprimer"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12 bg-white rounded-lg shadow-sm"
            >
              <HomeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune chambre trouvée
              </h3>
              <p className="text-gray-600 mb-6">
                Commencez par ajouter votre première chambre.
              </p>
              <Link
                href="/admin/rooms/new"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
              >
                <PlusIcon className="w-5 h-5" />
                <span>Ajouter une chambre</span>
              </Link>
            </motion.div>
          )}
        </main>
      </div>
    </>
  )
}
