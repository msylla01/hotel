import Head from 'next/head'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { PauseIcon, ArrowPathIcon, HomeIcon } from '@heroicons/react/24/outline'

export default function AccountDeactivated() {
  return (
    <>
      <Head>
        <title>Compte désactivé - Hotel Luxe</title>
        <meta name="description" content="Votre compte a été désactivé temporairement" />
      </Head>

      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full"
        >
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <PauseIcon className="w-8 h-8 text-orange-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Compte désactivé temporairement
          </h1>
          
          <p className="text-gray-600 mb-6">
            Votre compte Hotel Luxe a été désactivé temporairement. 
            Vous pouvez le réactiver à tout moment en vous reconnectant.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">Pour réactiver votre compte :</h3>
            <ol className="text-blue-700 text-sm space-y-1 text-left">
              <li>1. Cliquez sur "Réactiver mon compte" ci-dessous</li>
              <li>2. Saisissez vos identifiants habituels</li>
              <li>3. Votre compte sera immédiatement réactivé</li>
            </ol>
          </div>

          <div className="space-y-4">
            <Link
              href="/auth/reactivate"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <ArrowPathIcon className="w-5 h-5" />
              <span>Réactiver mon compte</span>
            </Link>
            
            <Link
              href="/"
              className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
            >
              <HomeIcon className="w-5 h-5" />
              <span>Retour à l'accueil</span>
            </Link>
          </div>

          <div className="mt-8 text-xs text-gray-500">
            <p>Vos données sont conservées en sécurité</p>
            <p>Développé par msylla01 • 2025-10-01 17:47:22 UTC</p>
          </div>
        </motion.div>
      </div>
    </>
  )
}
