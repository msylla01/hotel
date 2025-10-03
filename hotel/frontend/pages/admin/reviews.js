import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  ChatBubbleBottomCenterTextIcon,
  StarIcon,
  UserIcon,
  HomeIcon,
  FunnelIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'

export default function AdminReviews() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [ratingFilter, setRatingFilter] = useState('')
  const [verifiedFilter, setVerifiedFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({})
  const [stats, setStats] = useState({})
  const [responseModal, setResponseModal] = useState(null)
  const [responseText, setResponseText] = useState('')

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
    fetchReviews()
  }, [router, currentPage, ratingFilter, verifiedFilter])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams({
        page: currentPage,
        limit: 12,
        sortBy: 'createdAt',
        order: 'desc'
      })
      
      if (ratingFilter) params.append('rating', ratingFilter)
      if (verifiedFilter) params.append('verified', verifiedFilter)

      const response = await fetch(`http://localhost:5000/api/reviews?${params}`)

      if (response.ok) {
        const data = await response.json()
        setReviews(data.reviews)
        setPagination(data.pagination)
        
        // Calculer les stats
        const statsData = {
          total: data.pagination.total,
          averageRating: data.stats.averageRating,
          verified: data.stats.verifiedReviews,
          withoutResponse: data.reviews.filter(r => !r.response).length,
          by5Stars: data.reviews.filter(r => r.rating === 5).length,
          by4Stars: data.reviews.filter(r => r.rating === 4).length,
          by3Stars: data.reviews.filter(r => r.rating === 3).length,
          by2Stars: data.reviews.filter(r => r.rating === 2).length,
          by1Star: data.reviews.filter(r => r.rating === 1).length
        }
        setStats(statsData)
        
        console.log(`✅ ${data.reviews.length} avis chargés [msylla01] - 2025-10-03 17:58:31`)
      }
    } catch (error) {
      console.error('❌ Erreur chargement avis [msylla01]:', error)
    } finally {
      setLoading(false)
    }
  }

  const addResponse = async (reviewId) => {
    if (!responseText.trim()) {
      alert('Veuillez saisir une réponse')
      return
    }

    try {
      const token = localStorage.getItem('hotel_token')
      const response = await fetch(`http://localhost:5000/api/reviews/${reviewId}/response`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ response: responseText.trim() })
      })

      if (response.ok) {
        const data = await response.json()
        // Mettre à jour la liste
        setReviews(reviews.map(r => 
          r.id === reviewId ? { ...r, response: responseText.trim(), responseDate: new Date() } : r
        ))
        setResponseModal(null)
        setResponseText('')
        alert('✅ Réponse ajoutée avec succès')
      } else {
        const error = await response.json()
        alert(`❌ Erreur: ${error.message}`)
      }
    } catch (error) {
      console.error('❌ Erreur ajout réponse [msylla01]:', error)
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

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ))
  }

  if (loading && reviews.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des avis...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Gestion Avis - Admin Hotel Luxe</title>
        <meta name="description" content="Gestion des avis clients - Dashboard administrateur" />
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
                <h1 className="text-xl font-bold text-gray-900">Gestion Avis Clients</h1>
              </div>

              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  👤 {user?.firstName} {user?.lastName}
                </span>
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">Admin</span>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <ChatBubbleBottomCenterTextIcon className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats.total || 0}</p>
                  <p className="text-gray-600 text-sm">Total Avis</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <StarIcon className="w-8 h-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats.averageRating || '0.0'}</p>
                  <p className="text-gray-600 text-sm">Note Moyenne</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <CheckCircleIcon className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats.verified || 0}</p>
                  <p className="text-gray-600 text-sm">Vérifiés</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="w-8 h-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats.withoutResponse || 0}</p>
                  <p className="text-gray-600 text-sm">Sans réponse</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-yellow-500 rounded flex items-center justify-center">
                  <span className="text-white text-sm font-bold">5</span>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats.by5Stars || 0}</p>
                  <p className="text-gray-600 text-sm">5 étoiles</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center">
                  <span className="text-white text-sm font-bold">1</span>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats.by1Star || 0}</p>
                  <p className="text-gray-600 text-sm">1 étoile</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filtres */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center space-x-4">
              <FunnelIcon className="w-5 h-5 text-gray-400" />
              
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              >
                <option value="">Toutes les notes</option>
                <option value="5">5 étoiles</option>
                <option value="4">4 étoiles</option>
                <option value="3">3 étoiles</option>
                <option value="2">2 étoiles</option>
                <option value="1">1 étoile</option>
              </select>

              <select
                value={verifiedFilter}
                onChange={(e) => setVerifiedFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              >
                <option value="">Tous les avis</option>
                <option value="true">Vérifiés uniquement</option>
                <option value="false">Non vérifiés</option>
              </select>

              <button
                onClick={() => {
                  setRatingFilter('')
                  setVerifiedFilter('')
                }}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Réinitialiser
              </button>
            </div>
          </div>

          {/* Liste des avis */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Avis Clients ({pagination.total || 0})
              </h3>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Chargement...</p>
              </div>
            ) : reviews.length > 0 ? (
              <>
                <div className="divide-y divide-gray-200">
                  {reviews.map((review) => (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-6 hover:bg-gray-50"
                    >
                      {/* En-tête avis */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-4">
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-gray-600 font-medium">
                              {review.user?.firstName?.[0]}{review.user?.lastName?.[0]}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-semibold text-gray-900">
                                {review.user?.firstName} {review.user?.lastName}
                              </h4>
                              {review.verified && (
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                  ✅ Vérifié
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-4 mt-1">
                              <div className="flex">
                                {renderStars(review.rating)}
                              </div>
                              <span className="text-sm text-gray-500">
                                {formatDate(review.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-sm text-gray-600">🏨 {review.room?.name}</div>
                          <div className="text-xs text-gray-500">{review.room?.type}</div>
                        </div>
                      </div>

                      {/* Contenu avis */}
                      <div className="mb-4">
                        {review.title && (
                          <h5 className="font-semibold text-gray-900 mb-2">{review.title}</h5>
                        )}
                        <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                        
                        {/* Points positifs et négatifs */}
                        {(review.pros?.length > 0 || review.cons?.length > 0) && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            {review.pros?.length > 0 && (
                              <div className="bg-green-50 p-3 rounded-lg">
                                <h6 className="font-medium text-green-800 mb-2">👍 Points positifs</h6>
                                <ul className="text-green-700 text-sm space-y-1">
                                  {review.pros.map((pro, idx) => (
                                    <li key={idx}>• {pro}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {review.cons?.length > 0 && (
                              <div className="bg-red-50 p-3 rounded-lg">
                                <h6 className="font-medium text-red-800 mb-2">👎 Points à améliorer</h6>
                                <ul className="text-red-700 text-sm space-y-1">
                                  {review.cons.map((con, idx) => (
                                    <li key={idx}>• {con}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Recommandation */}
                        {review.recommendToFriends !== null && (
                          <div className="mt-3">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              review.recommendToFriends 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-orange-100 text-orange-800'
                            }`}>
                              {review.recommendToFriends ? '👥 Recommande à des amis' : '🤔 Ne recommande pas'}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Réponse admin */}
                      {review.response ? (
                        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-semibold text-blue-900">🏨 Réponse de Hotel Luxe</span>
                            <span className="text-blue-600 text-sm">
                              {formatDate(review.responseDate)}
                            </span>
                          </div>
                          <p className="text-blue-800">{review.response}</p>
                        </div>
                      ) : (
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                          <div className="flex items-center justify-between">
                            <span className="text-yellow-800 font-medium">⚠️ Avis sans réponse</span>
                            <button
                              onClick={() => setResponseModal(review.id)}
                              className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
                            >
                              Répondre
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Métadonnées */}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <span>👍 {review.helpful || 0} personnes trouvent cet avis utile</span>
                          <span>ID: {review.id.slice(-8)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => router.push(`/rooms/${review.room?.id}`)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Voir la chambre"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="px-6 py-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-700">
                        Page {pagination.page} sur {pagination.pages} 
                        ({pagination.total} avis au total)
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                        >
                          <ChevronLeftIcon className="w-4 h-4" />
                        </button>
                        <span className="px-3 py-1 bg-red-600 text-white rounded">
                          {currentPage}
                        </span>
                        <button
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === pagination.pages}
                          className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
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
                <ChatBubbleBottomCenterTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Aucun avis trouvé</p>
              </div>
            )}
          </div>

          {/* Footer info */}
          <div className="mt-8 text-center text-gray-500 text-sm">
            Gestion Avis Clients • Données Prisma PostgreSQL • msylla01 • 2025-10-03 17:58:31
          </div>
        </main>

        {/* Modal réponse */}
        {responseModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Répondre à l'avis
              </h3>
              
              <textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Saisissez votre réponse en tant qu'établissement..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 mb-4"
              />
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setResponseModal(null)
                    setResponseText('')
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={() => addResponse(responseModal)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Publier la réponse
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
