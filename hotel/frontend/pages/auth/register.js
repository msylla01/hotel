import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { 
  EyeIcon, 
  EyeSlashIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  LockClosedIcon 
} from '@heroicons/react/24/outline'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [passwordStrength, setPasswordStrength] = useState(0)

  const calculatePasswordStrength = (password) => {
    let strength = 0
    if (password.length >= 6) strength += 1
    if (password.match(/[a-z]/)) strength += 1
    if (password.match(/[A-Z]/)) strength += 1
    if (password.match(/[0-9]/)) strength += 1
    if (password.match(/[^a-zA-Z0-9]/)) strength += 1
    return strength
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Stocker le token
        localStorage.setItem('hotel_token', data.token)
        localStorage.setItem('hotel_user', JSON.stringify(data.user))
        
        // Redirection
        router.push('/dashboard')
      } else {
        setError(data.message || 'Erreur lors de l\'inscription')
      }
    } catch (error) {
      setError('Erreur de connexion au serveur')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })

    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value))
    }
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 2) return 'bg-red-400'
    if (passwordStrength < 4) return 'bg-yellow-400'
    return 'bg-green-400'
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength < 2) return 'Faible'
    if (passwordStrength < 4) return 'Moyen'
    return 'Fort'
  }

  return (
    <>
      <Head>
        <title>Inscription - Hotel Luxe</title>
        <meta name="description" content="Créez votre compte Hotel Luxe" />
      </Head>

      <div className="min-h-screen flex">
        {/* Section gauche - Image */}
        <div className="hidden lg:block relative flex-1">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800">
            <div className="h-full w-full bg-cover bg-center opacity-20"
                 style={{backgroundImage: "url('https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3')"}}
            ></div>
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          </div>
          
          <div className="relative h-full flex items-center justify-center p-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-center text-white"
            >
              <h2 className="text-4xl font-bold mb-6">
                Rejoignez Hotel Luxe
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-md">
                Créez votre compte et découvrez un monde d'expériences 
                de luxe et de services exceptionnels.
              </p>
              
              <div className="space-y-4 text-left">
                {[
                  { icon: '🎯', title: 'Réservation Express', desc: 'Réservez en 2 minutes chrono' },
                  { icon: '💎', title: 'Avantages Exclusifs', desc: 'Offres spéciales membres' },
                  { icon: '🏆', title: 'Programme Fidélité', desc: 'Gagnez des points à chaque séjour' },
                  { icon: '🎁', title: 'Surprises Régulières', desc: 'Cadeaux et attentions personnalisées' }
                ].map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4 flex items-center space-x-4"
                  >
                    <span className="text-2xl">{benefit.icon}</span>
                    <div>
                      <h3 className="font-semibold">{benefit.title}</h3>
                      <p className="text-sm text-blue-100">{benefit.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Section droite - Formulaire */}
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
                  Créer votre compte
                </h2>
                <p className="text-gray-600">
                  Rejoignez-nous pour vivre des expériences exceptionnelles
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

                {/* Prénom et Nom */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                      Prénom
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      className="block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Prénom"
                    />
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                      Nom
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      className="block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Nom"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400" />
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

                {/* Téléphone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone <span className="text-gray-400">(optionnel)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <PhoneIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="+33 1 23 45 67 89"
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
                      placeholder="Choisissez un mot de passe"
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
                  
                  {/* Indicateur de force du mot de passe */}
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                            style={{ width: `${(passwordStrength / 5) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600">
                          {getPasswordStrengthText()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirmer mot de passe */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmer le mot de passe
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LockClosedIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Confirmez votre mot de passe"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Bouton d'inscription */}
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
                    'Créer mon compte'
                  )}
                </motion.button>
              </form>

              {/* Lien vers la connexion */}
              <div className="mt-6 text-center">
                <span className="text-gray-600">Déjà client ? </span>
                <Link
                  href="/auth/login"
                  className="text-blue-600 hover:text-blue-500 font-medium transition-colors"
                >
                  Connectez-vous
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  )
}
