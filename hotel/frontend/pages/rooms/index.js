import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import Head from 'next/head'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { StarIcon, UserGroupIcon, HomeIcon } from '@heroicons/react/24/solid'

export default function Rooms() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRooms()
  }, [])

  const fetchRooms = async () => {
    try {
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

  if (loading) {
    return (
      <Layout title="Nos Chambres - Hotel Luxe">
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Nos Chambres - Hotel Luxe">
      <Head>
        <title>Nos Chambres - Hotel Luxe</title>
        <meta name="description" content="Découvrez notre collection de chambres d'exception" />
      </Head>

      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Nos Chambres d'Exception
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez notre collection de chambres et suites, 
              conçues pour vous offrir le plus grand confort
            </p>
          </div>

          {rooms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {rooms.map((room, index) => (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    <HomeIcon className="w-16 h-16 text-blue-600" />
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{room.name}</h3>
                      <div className="flex items-center space-x-1">
                        <StarIcon className="h-4 w-4 text-yellow-400" />
                        <span className="text-sm text-gray-600">{room.averageRating || 4.8}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {room.description || 'Chambre confortable et élégante'}
                    </p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-2xl font-bold text-blue-600">
                        {room.price}€
                        <span className="text-sm text-gray-500 font-normal">/nuit</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <UserGroupIcon className="w-4 h-4 mr-1" />
                        {room.capacity} pers.
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        room.type === 'SINGLE' ? 'bg-green-100 text-green-800' :
                        room.type === 'DOUBLE' ? 'bg-blue-100 text-blue-800' :
                        room.type === 'SUITE' ? 'bg-purple-100 text-purple-800' :
                        room.type === 'FAMILY' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {getRoomTypeLabel(room.type)}
                      </span>
                    </div>
                    
                    <Link
                      href={`/rooms/${room.id}`}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <span>Voir détails</span>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <HomeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Aucune chambre disponible
              </h3>
              <p className="text-gray-600">
                Veuillez réessayer plus tard
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
