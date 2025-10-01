import Layout from '../components/Layout'
import Head from 'next/head'

export default function Services() {
  return (
    <Layout title="Services - Hotel Luxe">
      <Head>
        <title>Nos Services - Hotel Luxe</title>
        <meta name="description" content="Découvrez tous nos services premium" />
      </Head>

      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Nos Services
            </h1>
            <p className="text-xl text-gray-600">
              Des services d'exception pour un séjour inoubliable
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: 'Spa & Wellness', desc: 'Détente et bien-être' },
              { title: 'Restaurant Gastronomique', desc: 'Cuisine d\'exception' },
              { title: 'Conciergerie 24h/24', desc: 'Service personnalisé' },
              { title: 'Centre Fitness', desc: 'Équipements modernes' },
              { title: 'Business Center', desc: 'Espace de travail' },
              { title: 'Room Service', desc: 'Service en chambre' }
            ].map((service, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {service.title}
                </h3>
                <p className="text-gray-600">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}
