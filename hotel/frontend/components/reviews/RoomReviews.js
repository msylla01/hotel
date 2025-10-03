import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function RoomReviews({ roomId, onWriteReview }) {
  const [reviews, setReviews] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState('createdAt')
  const [filterRating, setFilterRating] = useState('')

  useEffect(() => {
    if (roomId) {
      fetchReviews()
      fetchStats()
    }
  }, [roomId, page, sortBy, filterRating])

  const fetchReviews = async () => {
    try {
      const params = new URLSearchParams({
        roomId,
        page,
        limit: 5,
        sortBy,
        order: 'desc'
      })

      if (filterRating) {
        params.append('rating', filterRating)
      }

      const response = await fetch(`http://localhost:5000/api/reviews?${params}`)
      const data = await response.json()

      if (data.success) {
        setReviews(data.reviews)
        console.log(`✅ ${data.reviews.length} avis récupérés [msylla01]`)
      }
    } catch (error) {
      console.error('❌ Erreur récupération avis [msylla01]:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/reviews/room/${roomId}/stats`)
      const data = await response.json()

      if (data.success) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error('❌ Erreur stats avis [msylla01]:', error)
    }
  }

  const markAsHelpful = async (reviewId) => {
    try {
      const token = localStorage.getItem('hotel_token')
      if (!token) {
        alert('Connectez-vous pour voter')
        return
      }

      const response = await fetch(`http://localhost:5000/api/reviews/${reviewId}/helpful`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (data.success) {
        // Mettre à jour le compteur localement
        setReviews(prev => prev.map(review => 
          review.id === reviewId 
            ? { ...review, helpful: data.helpful }
            : review
        ))
        alert('✅ Merci pour votre vote !')
      } else {
        alert(`❌ ${data.message}`)
      }
    } catch (error) {
      console.error('❌ Erreur vote utile [msylla01]:', error)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`text-xl ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}>
        ⭐
      </span>
    ))
  }

  const renderRatingBar = (rating, count, total) => {
    const percentage = total > 0 ? (count / total) * 100 : 0
    return (
      <div className="flex items-center space-x-2 text-sm">
        <span className="w-8">{rating}⭐</span>
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div 
            className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <span className="text-gray-600 w-8">{count}</span>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Chargement des avis...</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-8">
      {/* Header avec stats */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            ⭐ Avis clients ({stats?.totalReviews || 0})
          </h3>
          {stats && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="text-4xl font-bold text-blue-600">
                  {stats.averageRating}
                </div>
                <div>
                  <div className="flex">
                    {renderStars(Math.round(parseFloat(stats.averageRating)))}
                  </div>
                  <div className="text-sm text-gray-600">
                    {stats.verifiedReviews} avis vérifiés ✅
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onWriteReview}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
        >
          ✍️ Écrire un avis
        </button>
      </div>

      {/* Distribution des notes */}
      {stats?.ratingDistribution && stats.ratingDistribution.length > 0 && (
        <div className="mb-8 p-6 bg-gray-50 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-4">Répartition des notes</h4>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map(rating => {
              const ratingData = stats.ratingDistribution.find(r => r.rating === rating)
              const count = ratingData ? ratingData.count : 0
              return renderRatingBar(rating, count, stats.totalReviews)
            })}
          </div>
        </div>
      )}

      {/* Filtres et tri */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="createdAt">Plus récents</option>
          <option value="rating">Note</option>
          <option value="helpful">Plus utiles</option>
        </select>

        <select
          value={filterRating}
          onChange={(e) => setFilterRating(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Toutes les notes</option>
          <option value="5">5 étoiles</option>
          <option value="4">4 étoiles</option>
          <option value="3">3 étoiles</option>
          <option value="2">2 étoiles</option>
          <option value="1">1 étoile</option>
        </select>

        <div className="text-sm text-gray-600">
          {reviews.length} avis affichés
        </div>
      </div>

      {/* Liste des avis */}
      <div className="space-y-6">
        <AnimatePresence>
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              {/* En-tête de l'avis */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    {review.user.firstName[0]}{review.user.lastName[0]}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-gray-900">
                        {review.user.firstName} {review.user.lastName}
                      </h4>
                      {review.verified && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                          ✅ Vérifié
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex">
                        {renderStars(review.rating)}
                      </div>
                      <span className="text-gray-500 text-sm">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contenu de l'avis */}
              <div className="mb-4">
                <h5 className="font-semibold text-gray-900 mb-2">{review.title}</h5>
                <p className="text-gray-700 leading-relaxed mb-4">{review.comment}</p>
                
                {/* Points positifs et négatifs */}
                {(review.pros?.length > 0 || review.cons?.length > 0) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                  <div className="mb-4">
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

              {/* Réponse de l'hôtel */}
              {review.response && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-semibold text-blue-900">🏨 Réponse de Hotel Luxe</span>
                    <span className="text-blue-600 text-sm">
                      {formatDate(review.responseDate)}
                    </span>
                  </div>
                  <p className="text-blue-800">{review.response}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => markAsHelpful(review.id)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <span>👍</span>
                  <span className="text-sm">Utile ({review.helpful})</span>
                </button>

                <div className="text-xs text-gray-500">
                  Avis #{review.id.slice(-8)}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Message si aucun avis */}
      {reviews.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💭</div>
          <h4 className="text-xl font-semibold text-gray-900 mb-2">
            Aucun avis pour cette chambre
          </h4>
          <p className="text-gray-600 mb-6">
            Soyez le premier à partager votre expérience !
          </p>
          <button
            onClick={onWriteReview}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            ✍️ Écrire le premier avis
          </button>
        </div>
      )}

      {/* Pagination simple */}
      {reviews.length > 0 && (
        <div className="flex justify-center mt-8">
          <div className="flex space-x-2">
            <button
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </button>
            <span className="px-4 py-2 bg-blue-600 text-white rounded-lg">
              Page {page}
            </span>
            <button
              onClick={() => setPage(prev => prev + 1)}
              disabled={reviews.length < 5}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
