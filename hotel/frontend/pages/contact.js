import Layout from '../components/Layout'
import Head from 'next/head'

export default function Contact() {
  return (
    <Layout title="Contact - Hotel Luxe">
      <Head>
        <title>Contact - Hotel Luxe</title>
        <meta name="description" content="Contactez-nous pour toute question" />
      </Head>

      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Contactez-nous
            </h1>
            <p className="text-xl text-gray-600">
              Notre équipe est à votre disposition
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Informations de contact
              </h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900">Adresse</h3>
                  <p className="text-gray-600">123 Avenue de l'Élégance, 75001 Paris</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900">Téléphone</h3>
                  <p className="text-gray-600">+33 1 23 45 67 89</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900">Email</h3>
                  <p className="text-gray-600">contact@hotel-luxe.com</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Envoyez-nous un message
              </h2>
              
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Votre nom"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="votre@email.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Votre message..."
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Envoyer le message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
