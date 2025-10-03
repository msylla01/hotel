import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'

export default function Services() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté (SANS redirection forcée)
    const token = localStorage.getItem('hotel_token')
    const userData = localStorage.getItem('hotel_user')
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData)
        setUser(user)
        setIsConnected(true)
      } catch (error) {
        console.log('❌ Erreur parsing user data:', error)
        setIsConnected(false)
      }
    } else {
      setIsConnected(false)
    }
    
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des services...</p>
          <p className="text-xs text-gray-500 mt-2">msylla01 • 2025-10-03 09:47:27</p>
        </div>
      </div>
    )
  }

  const services = [
    {
      category: '🧖‍♀️ Spa & Bien-être',
      color: 'from-pink-500 to-pink-600',
      services: [
        { name: 'Massage relaxant', price: '80€', duration: '60 min', description: 'Massage aux huiles essentielles pour une détente absolue' },
        { name: 'Soin du visage', price: '120€', duration: '90 min', description: 'Soin complet anti-âge avec produits premium' },
        { name: 'Jacuzzi privatif', price: '50€', duration: '45 min', description: 'Session détente privée avec aromathérapie' },
        { name: 'Hammam traditionnel', price: '35€', duration: '30 min', description: 'Bain de vapeur relaxant aux eucalyptus' }
      ]
    },
    {
      category: '🍽️ Restaurant & Bar',
      color: 'from-orange-500 to-orange-600',
      services: [
        { name: 'Petit-déjeuner en chambre', price: '25€', duration: 'Livraison', description: 'Plateau continental premium livré à l\'heure souhaitée' },
        { name: 'Dîner gastronomique', price: '65€', duration: '2h', description: 'Menu dégustation 5 services par notre chef étoilé' },
        { name: 'Room service 24h/24', price: 'Variable', duration: 'Immédiat', description: 'Carte complète disponible à toute heure' },
        { name: 'Bar cocktails', price: '15€', duration: 'Jusqu\'à 2h', description: 'Cocktails signature de notre mixologue expert' }
      ]
    },
    {
      category: '💼 Services Business',
      color: 'from-blue-500 to-blue-600',
      services: [
        { name: 'Salle de réunion', price: '100€/jour', duration: '8h', description: 'Capacité 12 personnes avec équipement moderne' },
        { name: 'Équipement audiovisuel', price: '50€/jour', duration: 'Location', description: 'Projecteur 4K, écran, système de sonorisation' },
        { name: 'Service de conciergerie', price: 'Gratuit', duration: '24h/24', description: 'Assistance personnalisée pour tous vos besoins' },
        { name: 'Centre d\'affaires', price: 'Gratuit', duration: 'Accès libre', description: 'Ordinateurs, imprimantes, WiFi haut débit, scanner' }
      ]
    },
    {
      category: '🚗 Transport & Loisirs',
      color: 'from-green-500 to-green-600',
      services: [
        { name: 'Navette aéroport', price: '30€', duration: '45 min', description: 'Transfert aller simple avec chauffeur professionnel' },
        { name: 'Location de véhicule', price: '80€/jour', duration: '24h', description: 'Voiture de catégorie économique, assurance incluse' },
        { name: 'Tour guidé de la ville', price: '45€', duration: '3h', description: 'Visite des sites emblématiques avec guide local' },
        { name: 'Parking sécurisé', price: '15€/nuit', duration: '24h', description: 'Garage surveillé et sécurisé, accès contrôlé' }
      ]
    }
  ]

  return (
    <>
      <Head>
        <title>Services - Hotel Luxe</title>
        <meta name="description" content="Découvrez tous nos services premium - Hotel Luxe" />
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
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <span className="font-semibold text-gray-900">Services Hotel Luxe</span>
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
              ✨ Nos Services Premium
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Profitez d'une expérience complète avec nos services haut de gamme disponibles 24h/24
            </p>
            <div className="mt-6 flex items-center justify-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <span>🕐</span>
                <span>Service 24h/24</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>📞</span>
                <span>Réservation: +221 33 123 45 67</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>📶</span>
                <span>WiFi gratuit inclus</span>
              </div>
            </div>
          </div>

          {/* Message pour visiteurs non connectés */}
          {!isConnected && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
              <div className="text-center">
                <h3 className="text-blue-900 font-bold text-lg mb-2">
                  👋 Visiteur, bienvenue chez Hotel Luxe !
                </h3>
                <p className="text-blue-800 mb-4">
                  Découvrez nos services premium. Connectez-vous ou créez un compte pour réserver.
                </p>
                <div className="flex items-center justify-center space-x-4">
                  <Link
                    href="/auth/login"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    Se connecter
                  </Link>
                  <Link
                    href="/auth/register"
                    className="border border-blue-600 text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50 transition-colors font-semibold"
                  >
                    Créer un compte
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Message pour utilisateurs inactifs */}
          {isConnected && user && !user.isActive && (
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 mb-8">
              <div className="text-center">
                <h3 className="text-orange-900 font-bold text-lg mb-2">
                  ⚠️ Compte temporairement désactivé
                </h3>
                <p className="text-orange-800 mb-4">
                  Vous pouvez consulter nos services mais vous devez réactiver votre compte pour les réserver.
                </p>
                <Link
                  href="/auth/reactivate"
                  className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors font-semibold"
                >
                  Réactiver mon compte
                </Link>
              </div>
            </div>
          )}

          {/* Services Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {services.map((category, index) => (
              <div
                key={category.category}
                className="bg-white rounded-2xl shadow-sm overflow-hidden"
              >
                {/* Header de la catégorie */}
                <div className={`bg-gradient-to-r ${category.color} p-6 text-white`}>
                  <h2 className="text-2xl font-bold">{category.category}</h2>
                </div>

                {/* Liste des services */}
                <div className="p-6">
                  <div className="space-y-4">
                    {category.services.map((service, serviceIndex) => (
                      <div key={serviceIndex} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {service.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                          <div className="flex items-center space-x-3">
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              📅 {service.duration}
                            </span>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-bold text-blue-600 text-lg">{service.price}</p>
                          {isConnected ? (
                            user?.isActive ? (
                              <button className="text-xs text-blue-600 hover:text-blue-700 underline mt-1 transition-colors">
                                📞 Réserver
                              </button>
                            ) : (
                              <p className="text-xs text-orange-600 mt-1">
                                🔒 Réactivez votre compte
                              </p>
                            )
                          ) : (
                            <Link
                              href="/auth/login"
                              className="text-xs text-blue-600 hover:text-blue-700 underline mt-1 transition-colors block"
                            >
                              🔑 Se connecter pour réserver
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Services inclus gratuitement */}
          <div className="bg-blue-50 rounded-2xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              🎁 Services Inclus Gratuitement
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                <div className="text-4xl mb-3">📶</div>
                <h4 className="font-semibold text-gray-900 mb-2">WiFi Haut Débit</h4>
                <p className="text-gray-600 text-sm">Connexion gratuite dans tout l'hôtel pour tous les clients</p>
              </div>
              <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                <div className="text-4xl mb-3">📞</div>
                <h4 className="font-semibold text-gray-900 mb-2">Conciergerie 24h/24</h4>
                <p className="text-gray-600 text-sm">Assistance et recommandations personnalisées</p>
              </div>
              <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                <div className="text-4xl mb-3">🅿️</div>
                <h4 className="font-semibold text-gray-900 mb-2">Accueil et Information</h4>
                <p className="text-gray-600 text-sm">Informations touristiques et assistance</p>
              </div>
            </div>
          </div>

          {/* CTA différent selon statut connexion */}
          <div className="text-center">
            <div className="bg-white rounded-2xl shadow-sm p-8">
              {isConnected ? (
                <>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    📞 Réservez vos services dès maintenant
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Contactez notre conciergerie pour réserver vos services ou obtenir plus d'informations
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                      href="/contact"
                      className="w-full sm:w-auto bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                    >
                      📞 Nous contacter
                    </Link>
                    <Link
                      href="/rooms"
                      className="w-full sm:w-auto border border-blue-600 text-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors font-semibold"
                    >
                      🏨 Réserver une chambre
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    🏨 Prêt à réserver votre séjour ?
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Créez votre compte Hotel Luxe pour accéder à la réservation en ligne et profiter de nos services premium
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                      href="/auth/register"
                      className="w-full sm:w-auto bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                    >
                      ✨ Créer mon compte
                    </Link>
                    <Link
                      href="/auth/login"
                      className="w-full sm:w-auto border border-blue-600 text-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors font-semibold"
                    >
                      🔑 Se connecter
                    </Link>
                  </div>
                </>
              )}
              
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">💡 Bon à savoir</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>• Consultation des services : <strong>accessible à tous</strong></p>
                  <p>• Réservation de services : <strong>compte requis</strong></p>
                  <p>• Réductions disponibles pour les séjours de plus de 3 nuits</p>
                  <p>• Programme fidélité : gagnez des points sur tous les services</p>
                </div>
              </div>
            </div>
          </div>

          {/* Informations de contact - toujours visible */}
          <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">📱 Informations et Réservation</h3>
            <p className="mb-6">Contactez-nous directement pour toute question ou réservation</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-2xl mb-2">📞</div>
                <h4 className="font-semibold mb-1">Téléphone</h4>
                <p>+221 33 123 45 67</p>
                <p className="text-sm opacity-90">Disponible 24h/24</p>
              </div>
              <div>
                <div className="text-2xl mb-2">📱</div>
                <h4 className="font-semibold mb-1">Mobile Money</h4>
                <p>Orange/Wave: 0703033133</p>
                <p className="text-sm opacity-90">Pour vos paiements</p>
              </div>
              <div>
                <div className="text-2xl mb-2">✉️</div>
                <h4 className="font-semibold mb-1">Email</h4>
                <p>services@hotel-luxe.fr</p>
                <p className="text-sm opacity-90">Réponse sous 2h</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-16 text-center text-gray-500">
            <p className="text-sm">
              Services Hotel Luxe • Accessible à tous • Réservation avec compte • msylla01 • 2025-10-03 09:47:27 UTC
            </p>
          </div>
        </main>
      </div>
    </>
  )
}
