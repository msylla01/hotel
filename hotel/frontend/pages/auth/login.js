import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { EyeIcon, EyeSlashIcon, UserIcon, LockClosedIcon } from '@heroicons/react/24/outline'

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        // Stocker le token
        localStorage.setItem('hotel_token', data.token)
        localStorage.setItem('hotel_user', JSON.stringify(data.user))
        
        // Redirection selon le rôle
        if (data.user.role === 'ADMIN') {
          router.push('/admin')
        } else {
          router.push('/dashboard')
        }
      } else {
        setError(data.message || 'Erreur de connexion')
      }
    } catch (error) {
      setError('Erreur de connexion au serveur')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <>
      <Head>
        <title>Connexion - Hotel Luxe</title>
        <meta name="description" content="Connectez-vous à votre compte Hotel Luxe" />
      </Head>

      <div className="min-h-screen flex">
        {/* Section gauche - Formulaire */}
        <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Logo et titre */}
              <div className="text-center mb-8">
                <Link href="/" className="flex items-center justify-center space-x-2 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-xl">H</span>
                  </div>
                  <div className="text-left">
                    <h1 className="text-2xl font-bold text-gray-900">Hotel Luxe</h1>
                    <p className="text-sm text-gray-500">Excellence & Confort</p>
                  </div>
                </Link>
                
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Bon retour !
                </h2>
                <p className="text-gray-600">
                  Connectez-vous à votre compte pour continuer
                </p>
              </div>

              {/* Formulaire */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="votre@email.com"
                    />
                  </div>
                </div>

                {/* Mot de passe */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LockClosedIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Votre mot de passe"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Options */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                      Se souvenir de moi
                    </label>
                  </div>
                  
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-blue-600 hover:text-blue-500 transition-colors"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>

                {/* Bouton de connexion */}
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    'Se connecter'
                  )}
                </motion.button>
              </form>

              {/* Comptes de test */}
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Comptes de test :</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Admin :</span>
                    <span className="font-mono">admin@hotel.com / admin123</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Client :</span>
                    <span className="font-mono">client@hotel.com / client123</span>
                  </div>
                </div>
              </div>

              {/* Lien vers l'inscription */}
              <div className="mt-6 text-center">
                <span className="text-gray-600">Nouveau client ? </span>
                <Link
                  href="/auth/register"
                  className="text-blue-600 hover:text-blue-500 font-medium transition-colors"
                >
                  Créer un compte
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Section droite - Image */}
        <div className="hidden lg:block relative flex-1">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800">
            <div className="h-full w-full bg-cover bg-center opacity-20"
                 style={{backgroundImage: "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3')"}}
            ></div>
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          </div>
          
          <div className="relative h-full flex items-center justify-center p-12">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-center text-white"
            >
              <h2 className="text-4xl font-bold mb-6">
                Bienvenue à Hotel Luxe
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-md">
                Votre expérience de luxe commence ici. 
                Connectez-vous pour gérer vos réservations et profiter de nos services exclusifs.
              </p>
              
              <div className="grid grid-cols-1 gap-4 text-left">
                <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4">
                  <h3 className="font-semibold mb-2">🏨 Réservation Simple</h3>
                  <p className="text-sm text-blue-100">
                    Réservez en quelques clics et modifiez facilement vos séjours
                  </p>
                </div>
                <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4">
                  <h3 className="font-semibold mb-2">⭐ Avantages Fidélité</h3>
                  <p className="text-sm text-blue-100">
                    Accumulez des points et bénéficiez d'offres exclusives
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  )
}
