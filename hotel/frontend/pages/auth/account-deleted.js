import Head from 'next/head'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { CheckCircleIcon, HomeIcon } from '@heroicons/react/24/outline'

export default function AccountDeleted() {
  return (
    <>
      <Head>
        <title>Compte supprimé - Hotel Luxe</title>
        <meta name="description" content="Votre compte a été supprimé avec succès" />
      </Head>

      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="w-8 h-8 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Compte supprimé avec succès
          </h1>
          
          <p className="text-gray-600 mb-6">
            Votre compte Hotel Luxe et toutes vos données associées ont été définitivement supprimés. 
            Nous espérons vous revoir bientôt !
          </p>

          <div className="space-y-4">
            <Link
              href="/"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <HomeIcon className="w-5 h-5" />
              <span>Retour à l'accueil</span>
            </Link>
            
            <Link
              href="/auth/register"
              className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors block"
            >
              Créer un nouveau compte
            </Link>
          </div>

          <div className="mt-8 text-xs text-gray-500">
            <p>Merci d'avoir utilisé Hotel Luxe</p>
            <p>Développé par msylla01 • 2025-10-01 17:36:39 UTC</p>
          </div>
        </motion.div>
      </div>
    </>
  )
}
