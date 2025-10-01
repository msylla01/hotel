import Head from 'next/head'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { HomeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'

export default function Custom404() {
  return (
    <>
      <Head>
        <title>Page non trouvée - Hotel Luxe</title>
        <meta name="description" content="La page que vous cherchez n'existe pas" />
      </Head>

      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-blue-600">404</h1>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Page non trouvée
          </h2>
          
          <p className="text-xl text-gray-600 mb-8 max-w-md">
            Désolé, la page que vous cherchez n'existe pas ou a été déplacée.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <HomeIcon className="w-5 h-5" />
              <span>Retour à l'accueil</span>
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="flex items-center justify-center space-x-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Page précédente</span>
            </button>
          </div>
        </motion.div>
      </div>
    </>
  )
}
