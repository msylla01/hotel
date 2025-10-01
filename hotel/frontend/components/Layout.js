import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Bars3Icon, 
  XMarkIcon,
  HomeIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  UserIcon
} from '@heroicons/react/24/outline'

export default function Layout({ children, title = "Hotel Luxe" }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Hotel Luxe - Votre séjour de rêve vous attend" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              {/* Logo */}
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">H</span>
                </div>
                <div>
                  <Link href="/" className="text-xl font-bold text-gray-900">
                    Hotel Luxe
                  </Link>
                  <p className="text-xs text-gray-500">Excellence & Confort</p>
                </div>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-8">
                <Link href="/" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Accueil
                </Link>
                <Link href="/rooms" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Chambres
                </Link>
                <Link href="/services" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Services
                </Link>
                <Link href="/contact" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Contact
                </Link>
              </nav>

              {/* Desktop Auth Buttons */}
              <div className="hidden md:flex items-center space-x-4">
                <Link
                  href="/auth/login"
                  className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Inscription
                </Link>
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  {mobileMenuOpen ? (
                    <XMarkIcon className="h-6 w-6" />
                  ) : (
                    <Bars3Icon className="h-6 w-6" />
                  )}
                </button>
              </div>
            </div>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="md:hidden border-t border-gray-200 py-4"
              >
                <div className="space-y-4">
                  <Link
                    href="/"
                    className="block text-gray-600 hover:text-blue-600 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Accueil
                  </Link>
                  <Link
                    href="/rooms"
                    className="block text-gray-600 hover:text-blue-600 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Chambres
                  </Link>
                  <Link
                    href="/services"
                    className="block text-gray-600 hover:text-blue-600 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Services
                  </Link>
                  <Link
                    href="/contact"
                    className="block text-gray-600 hover:text-blue-600 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Contact
                  </Link>
                  <div className="border-t border-gray-200 pt-4 space-y-2">
                    <Link
                      href="/auth/login"
                      className="block text-gray-600 hover:text-blue-600 font-medium transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Connexion
                    </Link>
                    <Link
                      href="/auth/register"
                      className="block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Inscription
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main>
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">H</span>
                  </div>
                  <span className="text-xl font-bold">Hotel Luxe</span>
                </div>
                <p className="text-gray-400 mb-4">
                  Votre destination de choix pour un séjour d'exception. 
                  Excellence, confort et service personnalisé depuis 2025.
                </p>
                <p className="text-sm text-gray-500">
                  Développé par msylla01 • 2025-10-01 14:44:03 UTC
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Navigation</h3>
                <ul className="space-y-2">
                  <li><Link href="/" className="text-gray-400 hover:text-white transition-colors">Accueil</Link></li>
                  <li><Link href="/rooms" className="text-gray-400 hover:text-white transition-colors">Chambres</Link></li>
                  <li><Link href="/services" className="text-gray-400 hover:text-white transition-colors">Services</Link></li>
                  <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Contact</h3>
                <ul className="space-y-2 text-gray-400">
                  <li className="flex items-center">
                    <PhoneIcon className="w-4 h-4 mr-2" />
                    +33 1 23 45 67 89
                  </li>
                  <li className="flex items-center">
                    <BuildingOfficeIcon className="w-4 h-4 mr-2" />
                    contact@hotel-luxe.com
                  </li>
                  <li className="flex items-center">
                    <HomeIcon className="w-4 h-4 mr-2" />
                    123 Avenue de l'Élégance, Paris
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2025 Hotel Luxe. Tous droits réservés. Développé avec ❤️ par msylla01</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
