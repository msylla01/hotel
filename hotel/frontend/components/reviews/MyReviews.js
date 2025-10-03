import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function MyReviews() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingReview, setEditingReview] = useState(null)

  useEffect(() => {
    fetchMyReviews()
  }, [])

  const fetchMyReviews = async () => {
    try {
      const token = localStorage.getItem('hotel_token')
      const response = await fetch('http://localhost:5000/api/reviews/user/mine', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (data.success) {
        setReviews(data.reviews)
        console.log(`✅ ${data.reviews.length} mes avis récupérés [msylla01]`)
      }
    } catch (error) {
      console.error('❌ Erreur récupération mes avis [msylla01]:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteReview = async (reviewId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) {
      return
    }

    try {
      const token = localStorage.getItem('hotel_token')
      const response = await fetch(`http://localhost:5000/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (data.success) {
        setReviews(prev => prev.filter(review => review.id !== reviewId))
        alert('✅ Avis supprimé avec succès')
      } else {
        alert(`❌ Erreur: ${data.message}`)
      }
    } catch (error) {
      console.error('❌ Erreur suppression avis [msylla01]:', error)
      alert('❌ Erreur lors de la suppression')
    }
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`text-lg ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}>
        ⭐
      </span>
    ))
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de vos avis...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          ⭐ Mes avis ({reviews.length})
        </h2>
        <div className="text-sm text-gray-600">
          Total: {reviews.length} avis • Note moyenne: {
            reviews.length > 0 
              ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
              : '0.0'
          }/5
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Aucun avis publié
          </h3>
          <p className="text-gray-600 mb-6">
            Vous n'avez pas encore laissé d'avis. Partagez vos expériences !
          </p>
          <a
            href="/rooms"
            className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            ✍️ Découvrir nos chambres
          </a>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              {/* En-tête */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🏨</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {review.room.name}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        review.room.type === 'SINGLE' ? 'bg-blue-100 text-blue-800' :
                        review.room.type === 'DOUBLE' ? 'bg-green-100 text-green-800' :
                        review.room.type === 'SUITE' ? 'bg-purple-100 text-purple-800' :
                        review.room.type === 'FAMILY' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {review.room.type}
                      </span>
                      {review.verified && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                          ✅ Vérifié
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setEditingReview(review)}
                    className="text-blue-600 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50"
                    title="Modifier"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => deleteReview(review.id)}
                    className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50"
                    title="Supprimer"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {/* Note et date */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="flex">
                    {renderStars(review.rating)}
                  </div>
                  <span className="text-gray-600">({review.rating}/5)</span>
                </div>
                <span className="text-gray-500 text-sm">
                  Publié le {formatDate(review.createdAt)}
                </span>
              </div>

              {/* Contenu */}
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
                <p className="text-gray-700 leading-relaxed">{review.comment}</p>
              </div>

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

              {/* Statistiques */}
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center space-x-4">
                  <span>👍 {review.helpful} personnes trouvent cet avis utile</span>
                  {review.recommendToFriends !== null && (
                    <span className={`px-2 py-1 rounded ${
                      review.recommendToFriends 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {review.recommendToFriends ? '👥 Recommande' : '🤔 Ne recommande pas'}
                    </span>
                  )}
                </div>
                <a
                  href={`/rooms/${review.room.id}`}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Voir la chambre →
                </a>
              </div>

              {/* Réponse de l'hôtel */}
              {review.response && (
                <div className="mt-4 bg-blue-50 border-l-4 border-blue-400 p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-semibold text-blue-900">🏨 Réponse de Hotel Luxe</span>
                    <span className="text-blue-600 text-sm">
                      {formatDate(review.responseDate)}
                    </span>
                  </div>
                  <p className="text-blue-800">{review.response}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
