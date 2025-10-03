import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function WriteReview({ roomId, onClose, onSuccess }) {
  const [user, setUser] = useState(null)
  const [bookings, setBookings] = useState([])
  const [formData, setFormData] = useState({
    bookingId: '',
    rating: 5,
    title: '',
    comment: '',
    pros: [''],
    cons: [''],
    recommendToFriends: null
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Vérifier l'utilisateur connecté
    const userData = localStorage.getItem('hotel_user')
    if (userData) {
      setUser(JSON.parse(userData))
      fetchUserBookings()
    }
  }, [])

  const fetchUserBookings = async () => {
    try {
      const token = localStorage.getItem('hotel_token')
      const response = await fetch(`http://localhost:5000/api/bookings?roomId=${roomId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (data.success) {
        // Filtrer les réservations terminées
        const completedBookings = data.bookings.filter(booking => 
          ['COMPLETED', 'CHECKED_OUT'].includes(booking.status) && 
          new Date(booking.checkOut) < new Date()
        )
        setBookings(completedBookings)
      }
    } catch (error) {
      console.error('❌ Erreur récupération réservations [msylla01]:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    console.log('📝 Soumission avis [msylla01] - 2025-10-03 15:56:36:', {
      roomId,
      rating: formData.rating,
      title: formData.title.substring(0, 30),
      comment: formData.comment.substring(0, 50)
    })
    
    if (!formData.title.trim() || !formData.comment.trim()) {
      setError('Veuillez remplir tous les champs obligatoires')
      return
    }

    if (formData.title.length < 5) {
      setError('Le titre doit contenir au moins 5 caractères')
      return
    }

    if (formData.comment.length < 10) {
      setError('Le commentaire doit contenir au moins 10 caractères')
      return
    }

    try {
      setLoading(true)
      setError('')

      const token = localStorage.getItem('hotel_token')
      
      if (!token) {
        setError('Token d\'authentification manquant')
        return
      }

      // Nettoyer les pros et cons
      const cleanPros = formData.pros.filter(pro => pro.trim() !== '')
      const cleanCons = formData.cons.filter(con => con.trim() !== '')

      const requestBody = {
        roomId,
        rating: parseInt(formData.rating),
        title: formData.title.trim(),
        comment: formData.comment.trim(),
        pros: cleanPros,
        cons: cleanCons,
        recommendToFriends: formData.recommendToFriends
      }

      if (formData.bookingId) {
        requestBody.bookingId = formData.bookingId
      }

      console.log('📡 Envoi requête avis [msylla01]:', {
        url: 'http://localhost:5000/api/reviews',
        method: 'POST',
        body: requestBody
      })

      const response = await fetch('http://localhost:5000/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      })

      const data = await response.json()

      if (response.ok && data.success) {
        console.log('✅ Avis créé avec succès [msylla01]:', data.review?.id)
        alert('✅ Votre avis a été publié avec succès ! Merci pour votre contribution.')
        if (onSuccess) onSuccess(data.review)
        onClose()
      } else {
        const errorMessage = data.message || `Erreur ${response.status}: ${response.statusText}`
        console.error('❌ Erreur création avis [msylla01]:', errorMessage)
        setError(errorMessage)
      }

    } catch (error) {
      console.error('❌ Erreur réseau avis [msylla01]:', error)
      setError(`Erreur de connexion: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <button
        key={i}
        type="button"
        onClick={() => setFormData({ ...formData, rating: i + 1 })}
        className={`text-2xl transition-colors ${
          i < rating ? 'text-yellow-400 hover:text-yellow-500' : 'text-gray-300 hover:text-gray-400'
        }`}
      >
        ⭐
      </button>
    ))
  }

  const getRatingLabel = (rating) => {
    const labels = {
      1: 'Très décevant',
      2: 'Décevant', 
      3: 'Correct',
      4: 'Très bien',
      5: 'Excellent'
    }
    return labels[rating] || ''
  }

  const addProsCons = (type) => {
    if (type === 'pros') {
      setFormData({ ...formData, pros: [...formData.pros, ''] })
    } else {
      setFormData({ ...formData, cons: [...formData.cons, ''] })
    }
  }

  const removeProsCons = (type, index) => {
    if (type === 'pros') {
      const newPros = formData.pros.filter((_, i) => i !== index)
      setFormData({ ...formData, pros: newPros })
    } else {
      const newCons = formData.cons.filter((_, i) => i !== index)
      setFormData({ ...formData, cons: newCons })
    }
  }

  const updateProsCons = (type, index, value) => {
    if (type === 'pros') {
      const newPros = [...formData.pros]
      newPros[index] = value
      setFormData({ ...formData, pros: newPros })
    } else {
      const newCons = [...formData.cons]
      newCons[index] = value
      setFormData({ ...formData, cons: newCons })
    }
  }

  if (!user) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            🔐 Connexion requise
          </h3>
          <p className="text-gray-600 mb-6">
            Vous devez être connecté pour laisser un avis.
          </p>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50"
            >
              Fermer
            </button>
            <button
              onClick={() => window.location.href = '/auth/login'}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              Se connecter
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">
              ✍️ Écrire un avis détaillé
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors text-2xl"
            >
              ×
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">❌ {error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sélection de réservation */}
            {bookings.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Réservation (optionnel - pour avis vérifié ✅)
                </label>
                <select
                  value={formData.bookingId}
                  onChange={(e) => setFormData({ ...formData, bookingId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choisir une réservation...</option>
                  {bookings.map(booking => (
                    <option key={booking.id} value={booking.id}>
                      Séjour du {new Date(booking.checkIn).toLocaleDateString('fr-FR')} au {new Date(booking.checkOut).toLocaleDateString('fr-FR')}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Sélectionnez une réservation terminée pour un avis vérifié
                </p>
              </div>
            )}

            {/* Note */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Note * (obligatoire)
              </label>
              <div className="flex items-center space-x-2">
                {renderStars(formData.rating)}
                <span className="text-gray-600 ml-4 font-medium">
                  {formData.rating}/5 - {getRatingLabel(formData.rating)}
                </span>
              </div>
            </div>

            {/* Titre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre de votre avis * (obligatoire)
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Séjour parfait, chambre exceptionnelle..."
                maxLength={100}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Minimum 5 caractères</span>
                <span className={formData.title.length < 5 ? 'text-red-500' : 'text-gray-500'}>
                  {formData.title.length}/100
                </span>
              </div>
            </div>

            {/* Commentaire */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Votre avis détaillé * (obligatoire)
              </label>
              <textarea
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                placeholder="Décrivez votre expérience: qualité de la chambre, propreté, service, rapport qualité-prix, ambiance..."
                rows={6}
                maxLength={1000}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                required
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Minimum 10 caractères</span>
                <span className={formData.comment.length < 10 ? 'text-red-500' : 'text-gray-500'}>
                  {formData.comment.length}/1000
                </span>
              </div>
            </div>

            {/* Points positifs */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                👍 Points positifs (optionnel)
              </label>
              {formData.pros.map((pro, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={pro}
                    onChange={(e) => updateProsCons('pros', index, e.target.value)}
                    placeholder="Ex: Chambre très propre, vue magnifique..."
                    maxLength={100}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  {formData.pros.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeProsCons('pros', index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ❌
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addProsCons('pros')}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                ➕ Ajouter un point positif
              </button>
            </div>

            {/* Points négatifs */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                👎 Points à améliorer (optionnel)
              </label>
              {formData.cons.map((con, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={con}
                    onChange={(e) => updateProsCons('cons', index, e.target.value)}
                    placeholder="Ex: Bruit de la rue, WiFi lent..."
                    maxLength={100}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  {formData.cons.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeProsCons('cons', index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ❌
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addProsCons('cons')}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                ➕ Ajouter un point à améliorer
              </button>
            </div>

            {/* Recommandation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                👥 Recommanderiez-vous cette chambre à des amis ?
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="true"
                    checked={formData.recommendToFriends === true}
                    onChange={() => setFormData({ ...formData, recommendToFriends: true })}
                    className="mr-2"
                  />
                  ✅ Oui, je recommande
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="false"
                    checked={formData.recommendToFriends === false}
                    onChange={() => setFormData({ ...formData, recommendToFriends: false })}
                    className="mr-2"
                  />
                  ❌ Non, je ne recommande pas
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="null"
                    checked={formData.recommendToFriends === null}
                    onChange={() => setFormData({ ...formData, recommendToFriends: null })}
                    className="mr-2"
                  />
                  🤔 Sans avis
                </label>
              </div>
            </div>

            {/* Conseils */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">💡 Conseils pour un avis utile</h4>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• Soyez spécifique et honnête dans votre évaluation</li>
                <li>• Mentionnez les points forts et les axes d'amélioration</li>
                <li>• Aidez les futurs clients dans leur choix</li>
                <li>• Restez respectueux et constructif</li>
                <li>• Décrivez l'expérience globale de votre séjour</li>
              </ul>
            </div>

            {/* Boutons */}
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading || !formData.title.trim() || !formData.comment.trim() || formData.title.length < 5 || formData.comment.length < 10}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Publication...</span>
                  </>
                ) : (
                  <>
                    <span>✍️</span>
                    <span>Publier mon avis détaillé</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}