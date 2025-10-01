import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { 
  ArrowRightIcon,
  StarIcon,
  UserGroupIcon,
  HomeIcon,
  ChartBarIcon,
  CheckCircleIcon,
  PhoneIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'

export default function Home() {
  const [apiStatus, setApiStatus] = useState('Testing...')
  const [rooms, setRooms] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Vérifier l'utilisateur connecté
    try {
      const userData = localStorage.getItem('hotel_user')
      if (userData) {
        setUser(JSON.parse(userData))
      }
    } catch (error) {
      console.log('Pas d\'utilisateur connecté')
    }

    // Test de connexion à l'API
    fetch('http://localhost:5000/health')
      .then(res => res.json())
      .then(data => {
        setApiStatus('✅ API Connected')
        console.log('API Status:', data)
      })
      .catch(err => {
        setApiStatus('❌ API Disconnected')
        console.error('API Error:', err)
      })

    // Récupérer les chambres
    fetch('http://localhost:5000/api/rooms')
      .then(res => res.json())
      .then(data => {
        setRooms(data.rooms || [])
        console.log('Rooms:', data)
      })
      .catch(err => {
        console.error('Rooms Error:', err)
        setRooms([]) // Fallback en cas d'erreur
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('hotel_token')
    localStorage.removeItem('hotel_user')
    setUser(null)
    window.location.reload()
  }

  return (
    <>
      <Head>
        <title>Hotel Luxe - Votre séjour de rêve vous attend</title>
        <meta name="description" content="Découvrez Hotel Luxe, votre destination de choix pour un séjour d'exception. Réservez dès maintenant !" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">H</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Hotel Luxe</h1>
                  <p className="text-xs text-gray-500">Excellence & Confort</p>
                </div>
              </div>

              <nav className="hidden md:flex items-center space-x-8">
                <Link href="/rooms" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Chambres
                </Link>
                <Link href="/services" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Services
                </Link>
                <Link href="/contact" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Contact
                </Link>
              </nav>

              <div className="flex items-center space-x-4">
                {user ? (
                  <div className="flex items-center space-x-4">
                    <Link
                      href={user.role === 'ADMIN' ? '/admin' : '/dashboard'}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {user.role === 'ADMIN' ? 'Admin' : 'Dashboard'}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="text-gray-600 hover:text-gray-700"
                    >
                      Déconnexion
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <Link
                      href="/auth/login"
                      className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
                    >
                      Connexion
                    </Link>
                    <Link
                      href="/auth/register"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Inscription
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="animate-fade-in">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Bienvenue à Hotel Luxe
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
                Votre expérience de luxe commence ici. Découvrez nos chambres d'exception 
                et nos services de qualité supérieure.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/rooms"
                  className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center space-x-2"
                >
                  <span>Découvrir nos chambres</span>
                  <ArrowRightIcon className="h-5 w-5" />
                </Link>
                
                {!user && (
                  <Link
                    href="/auth/register"
                    className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
                  >
                    Réserver maintenant
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Status Section */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">État du Système</h2>
              <p className="text-gray-600">Développé par msylla01 - 2025-10-01 14:50:55</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <CheckCircleIcon className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-green-800 mb-2">Backend API</h3>
                <p className="text-green-600">{apiStatus}</p>
                <p className="text-sm text-green-500">Port: 5000</p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                <ChartBarIcon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-blue-800 mb-2">Frontend</h3>
                <p className="text-blue-600">✅ React/Next.js</p>
                <p className="text-sm text-blue-500">Port: 3000</p>
              </div>
              
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 text-center">
                <HomeIcon className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-purple-800 mb-2">Base de Données</h3>
                <p className="text-purple-600">✅ PostgreSQL</p>
                <p className="text-sm text-purple-500">Docker Container</p>
              </div>
            </div>
          </div>
        </section>

        {/* Chambres Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Nos Chambres d'Exception
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Découvrez notre collection de chambres et suites, 
                conçues pour vous offrir le plus grand confort
              </p>
            </div>
            
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Chargement des chambres...</p>
              </div>
            ) : rooms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {rooms.slice(0, 6).map((room, index) => (
                  <div
                    key={room.id}
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                    style={{ animationDelay: `${index * 0.1}s` }}
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
                          {room.type}
                        </span>
                      </div>
                      
                      <Link
                        href={`/rooms/${room.id}`}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <span>Voir détails</span>
                        <ArrowRightIcon className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <HomeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Aucune chambre disponible
                </h3>
                <p className="text-gray-600">
                  Les chambres se chargent depuis l'API backend
                </p>
              </div>
            )}
            
            <div className="text-center mt-12">
              <Link
                href="/rooms"
                className="inline-flex items-center bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Voir toutes nos chambres
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">H</span>
                  </div>
                  <span className="text-xl font-bold">Hotel Luxe</span>
                </div>
                <p className="text-gray-400 mb-4">
                  Votre destination de choix pour un séjour d'exception. 
                  Excellence, confort et service personnalisé.
                </p>
                <p className="text-sm text-gray-500">
                  Développé par msylla01 • 2025-10-01 14:50:55 UTC
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Navigation</h3>
                <ul className="space-y-2">
                  <li><Link href="/rooms" className="text-gray-400 hover:text-white transition-colors">Chambres</Link></li>
                  <li><Link href="/services" className="text-gray-400 hover:text-white transition-colors">Services</Link></li>
                  <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Contact</h3>
                <ul className="space-y-2 text-gray-400">
                  <li className="flex items-center">
                    <PhoneIcon className="w-4 h-4 mr-2" />
                    +33 1 23 45 67 89
                  </li>
                  <li className="flex items-center">
                    <BuildingOfficeIcon className="w-4 h-4 mr-2" />
                    contact@hotel-luxe.com
                  </li>
                  <li className="flex items-center">
                    <HomeIcon className="w-4 h-4 mr-2" />
                    123 Avenue de l'Élégance, Paris
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2025 Hotel Luxe. Tous droits réservés. Développé avec ❤️ par msylla01</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
