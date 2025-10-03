import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'

export default function Contact() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: '',
    priority: 'normal'
  })
  const [sending, setSending] = useState(false)

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté (SANS redirection forcée)
    const token = localStorage.getItem('hotel_token')
    const userData = localStorage.getItem('hotel_user')
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData)
        setUser(user)
        setIsConnected(true)
        // Pré-remplir le formulaire avec les données utilisateur
        setFormData(prev => ({
          ...prev,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || ''
        }))
      } catch (error) {
        console.log('❌ Erreur parsing user data:', error)
        setIsConnected(false)
      }
    } else {
      setIsConnected(false)
    }
    
    setLoading(false)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSending(true)

    // Validation basique
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.subject || !formData.message) {
      alert('❌ Veuillez remplir tous les champs obligatoires')
      setSending(false)
      return
    }

    // Simulation d'envoi de message
    setTimeout(() => {
      const statusMessage = isConnected 
        ? `✅ Message envoyé avec succès depuis votre compte !\n\nDe: ${formData.firstName} ${formData.lastName} (${user?.id || 'Client'})`
        : `✅ Message envoyé avec succès !\n\nDe: ${formData.firstName} ${formData.lastName} (Visiteur)`

      alert(`${statusMessage}\n\nSubjet: ${formData.subject}\nPriorité: ${formData.priority}\n\nNous vous répondrons par email dans les plus brefs délais.`)
      
      // Réinitialiser seulement les champs modifiables
      setFormData(prev => ({
        ...prev,
        subject: '',
        message: '',
        priority: 'normal',
        // Garder les infos perso si connecté, sinon tout vider
        ...(isConnected ? {} : { firstName: '', lastName: '', email: '' })
      }))
      setSending(false)
    }, 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
          <p className="text-xs text-gray-500 mt-2">msylla01 • 2025-10-03 09:50:32</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Contact - Hotel Luxe</title>
        <meta name="description" content="Contactez Hotel Luxe - Support client 24h/24" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-6">
              <Link
                href={isConnected ? "/dashboard" : "/"}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <span>←</span>
                <span>Retour {isConnected ? 'au dashboard' : 'à l\'accueil'}</span>
              </Link>
              
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">C</span>
                </div>
                <span className="font-semibold text-gray-900">Contact Hotel Luxe</span>
              </div>

              <div className="flex items-center space-x-4">
                {isConnected && user ? (
                  <>
                    <span className="text-sm text-gray-600">
                      {user.firstName} {user.lastName}
                    </span>
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      user.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {user.isActive ? '✅ Actif' : '⚠️ Inactif'}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Link
                      href="/auth/login"
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Se connecter
                    </Link>
                    <Link
                      href="/auth/register"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
                    >
                      S'inscrire
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              📞 Contactez-nous
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Notre équipe est disponible 24h/24 pour répondre à toutes vos questions et vous assister
            </p>
            {isConnected ? (
              <p className="text-blue-600 mt-2">
                👋 Bonjour {user?.firstName}, vos informations sont pré-remplies
              </p>
            ) : (
              <p className="text-gray-500 mt-2">
                💡 Connectez-vous pour pré-remplir automatiquement vos informations
              </p>
            )}
          </div>

          {/* Message pour visiteurs non connectés */}
          {!isConnected && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
              <div className="text-center">
                <h3 className="text-blue-900 font-bold text-lg mb-2">
                  👋 Besoin d'aide ? Nous sommes là !
                </h3>
                <p className="text-blue-800 mb-4">
                  Que vous soyez client ou futur client, n'hésitez pas à nous contacter. Créez un compte pour un suivi personnalisé.
                </p>
                <div className="flex items-center justify-center space-x-4">
                  <Link
                    href="/auth/login"
                    className="text-blue-600 hover:text-blue-700 font-medium underline"
                  >
                    Se connecter
                  </Link>
                  <span className="text-blue-600">ou</span>
                  <Link
                    href="/auth/register"
                    className="text-blue-600 hover:text-blue-700 font-medium underline"
                  >
                    Créer un compte
                  </Link>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Informations de contact */}
            <div className="space-y-8">
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">📍 Nos Coordonnées</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <span className="text-2xl">📍</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Adresse</h3>
                      <p className="text-gray-600">123 Avenue de la Paix</p>
                      <p className="text-gray-600">Dakar, Sénégal</p>
                      <p className="text-gray-600">CP: 12345</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <span className="text-2xl">📞</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Téléphone</h3>
                      <p className="text-gray-600">+221 33 123 45 67</p>
                      <p className="text-gray-600">Support 24h/24 - 7j/7</p>
                      <p className="text-green-600 text-sm font-medium">📞 Appel gratuit depuis l'hôtel</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-orange-100 p-3 rounded-lg">
                      <span className="text-2xl">📱</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Mobile Money</h3>
                      <p className="text-gray-600">Orange Money: 0703033133</p>
                      <p className="text-gray-600">Wave: 0703033133</p>
                      <p className="text-gray-600">Free Money: 0703033133</p>
                      <p className="text-orange-600 text-sm font-medium">💳 Pour vos paiements rapides</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-purple-100 p-3 rounded-lg">
                      <span className="text-2xl">✉️</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                      <p className="text-gray-600">contact@hotel-luxe.fr</p>
                      <p className="text-gray-600">reservations@hotel-luxe.fr</p>
                      <p className="text-gray-600">services@hotel-luxe.fr</p>
                      <p className="text-purple-600 text-sm font-medium">📧 Réponse sous 2h garantie</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-yellow-100 p-3 rounded-lg">
                      <span className="text-2xl">🕐</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Horaires</h3>
                      <p className="text-gray-600">Accueil: 24h/24 - 365j/an</p>
                      <p className="text-gray-600">Check-in: 14h00 - Check-out: 11h00</p>
                      <p className="text-gray-600">Room Service: 24h/24</p>
                      <p className="text-yellow-600 text-sm font-medium">⏰ Service continu</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Services d'urgence */}
              <div className="bg-red-50 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-red-900 mb-4">🚨 Urgences</h3>
                <div className="space-y-2 text-red-800">
                  <p><strong>🏥 Urgence médicale:</strong> +221 33 999 99 99</p>
                  <p><strong>🛡️ Sécurité hôtel:</strong> +221 33 123 45 68</p>
                  <p><strong>🔧 Maintenance urgente:</strong> Poste 911 depuis votre chambre</p>
                  <p><strong>🆘 Assistance 24h:</strong> Appelez la réception (Poste 0)</p>
                </div>
              </div>

              {/* Réseaux sociaux */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
                <h3 className="text-lg font-bold mb-4">📱 Suivez-nous</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>📘 Facebook:</strong> /HotelLuxeDakar</p>
                    <p><strong>📸 Instagram:</strong> @hotelluxe_dkr</p>
                  </div>
                  <div>
                    <p><strong>🐦 Twitter:</strong> @HotelLuxe_SN</p>
                    <p><strong>💼 LinkedIn:</strong> Hotel Luxe Sénégal</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Formulaire de contact */}
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                💬 Envoyez-nous un message
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prénom <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      required
                      disabled={isConnected && user?.firstName}
                      placeholder="Votre prénom"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                    />
                    {isConnected && user?.firstName && (
                      <p className="text-xs text-green-600 mt-1">✅ Pré-rempli depuis votre compte</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      required
                      disabled={isConnected && user?.lastName}
                      placeholder="Votre nom"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                    />
                    {isConnected && user?.lastName && (
                      <p className="text-xs text-green-600 mt-1">✅ Pré-rempli depuis votre compte</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                    disabled={isConnected && user?.email}
                    placeholder="votre.email@exemple.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                  />
                  {isConnected && user?.email && (
                    <p className="text-xs text-green-600 mt-1">✅ Pré-rempli depuis votre compte</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sujet <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choisissez un sujet</option>
                    <option value="information">Information générale</option>
                    <option value="reservation">Question sur une réservation</option>
                    <option value="service">Demande de service</option>
                    <option value="paiement">Problème de paiement</option>
                    <option value="reclamation">Réclamation</option>
                    <option value="compliment">Compliment / Feedback positif</option>
                    <option value="partenariat">Proposition de partenariat</option>
                    <option value="emploi">Candidature emploi</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priorité
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">🟢 Basse - Réponse sous 48h</option>
                    <option value="normal">🟡 Normale - Réponse sous 24h</option>
                    <option value="urgent">🔴 Urgente - Réponse dans l'heure</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    required
                    rows={6}
                    placeholder="Décrivez votre demande en détail..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.message.length}/1000 caractères
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={sending || !formData.firstName || !formData.lastName || !formData.email || !formData.subject || !formData.message}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  {sending ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Envoi en cours...</span>
                    </>
                  ) : (
                    <>
                      <span>✉️</span>
                      <span>Envoyer le message</span>
                    </>
                  )}
                </button>

                {!isConnected && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-blue-800 text-sm">
                      💡 <strong>Astuce :</strong> Créez un compte pour bénéficier d'un suivi personnalisé de vos demandes et pré-remplir automatiquement vos informations.
                    </p>
                  </div>
                )}
              </form>

              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <p className="text-green-800 text-sm">
                  <strong>📞 Temps de réponse garantis :</strong><br/>
                  • 🔴 Urgent: Dans l'heure (appel si nécessaire)<br/>
                  • 🟡 Normal: Sous 24h par email<br/>
                  • 🟢 Basse: Sous 48h par email<br/>
                  • 🆘 Urgence absolue: Appelez directement +221 33 123 45 67
                </p>
              </div>
            </div>
          </div>

          {/* FAQ rapide */}
          <div className="mt-12 bg-white rounded-2xl shadow-sm p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">❓ Questions Fréquentes</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">🏨 Comment réserver une chambre ?</h4>
                <p className="text-gray-600 text-sm">
                  {isConnected 
                    ? "Depuis votre dashboard, cliquez sur 'Réserver une chambre' ou contactez-nous."
                    : "Créez un compte puis accédez à notre système de réservation en ligne, ou appelez-nous."
                  }
                </p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">💳 Quels moyens de paiement acceptez-vous ?</h4>
                <p className="text-gray-600 text-sm">Cartes bancaires, Orange Money (0703033133), Wave (0703033133), virements bancaires, PayPal et espèces.</p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">❌ Puis-je annuler gratuitement ?</h4>
                <p className="text-gray-600 text-sm">Oui, annulation gratuite jusqu'à 24h avant votre arrivée. Conditions détaillées lors de la réservation.</p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">🛎️ Avez-vous un service de conciergerie ?</h4>
                <p className="text-gray-600 text-sm">Oui, disponible 24h/24 pour tous vos besoins : réservations restaurants, excursions, transport, etc.</p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">🚗 Proposez-vous un service de transport ?</h4>
                <p className="text-gray-600 text-sm">Oui : navette aéroport (30€), location de véhicules, tours guidés et parking sécurisé (15€/nuit).</p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">📶 Y a-t-il du WiFi gratuit ?</h4>
                <p className="text-gray-600 text-sm">Oui, WiFi haut débit gratuit dans tout l'hôtel (chambres, espaces communs, restaurant, spa).</p>
              </div>
            </div>
          </div>

          {/* CTA final */}
          <div className="mt-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">💬 Une question urgente ?</h3>
            <p className="mb-6">Notre équipe est disponible 24h/24 pour vous aider</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="tel:+221331234567"
                className="w-full sm:w-auto bg-white text-green-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
              >
                📞 Appeler maintenant
              </a>
              <Link
                href="/services"
                className="w-full sm:w-auto border border-white text-white px-8 py-3 rounded-lg hover:bg-white hover:text-green-600 transition-colors font-semibold"
              >
                🛎️ Voir nos services
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-16 text-center text-gray-500">
            <p className="text-sm">
              Contact Hotel Luxe • Support 24h/24 • Accessible à tous • msylla01 • 2025-10-03 09:50:32 UTC
            </p>
          </div>
        </main>
      </div>
    </>
  )
}
