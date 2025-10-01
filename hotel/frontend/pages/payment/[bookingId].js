import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import PaymentForm from '../../components/payments/PaymentForm'

export default function PaymentPage() {
  const router = useRouter()
  const { bookingId } = router.query
  
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [paymentData, setPaymentData] = useState(null)

  useEffect(() => {
    if (bookingId) {
      fetchBooking()
    }
  }, [bookingId])

  const fetchBooking = async () => {
    try {
      const token = localStorage.getItem('hotel_token')
      if (!token) {
        router.push('/auth/login')
        return
      }

      // Simuler une réservation pour les tests
      const mockBooking = {
        id: bookingId,
        checkIn: new Date('2025-12-15'),
        checkOut: new Date('2025-12-18'),
        guests: 2,
        totalAmount: 540,
        status: 'PENDING',
        room: {
          name: 'Chambre Double Classique',
          type: 'DOUBLE'
        },
        user: {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@hotel.com'
        }
      }

      setBooking(mockBooking)
    } catch (error) {
      console.error('❌ Erreur récupération réservation [msylla01]:', error)
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSuccess = (paymentResult) => {
    console.log('✅ Paiement réussi [msylla01]:', paymentResult)
    setPaymentData(paymentResult)
    setPaymentSuccess(true)
    
    // Redirection automatique après 5 secondes
    setTimeout(() => {
      router.push('/dashboard')
    }, 5000)
  }

  const handlePaymentError = (error) => {
    console.error('❌ Erreur paiement [msylla01]:', error)
    // L'erreur est gérée dans le composant PaymentForm
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (paymentSuccess) {
    return (
      <>
        <Head>
          <title>Paiement Réussi - Hotel Luxe</title>
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
              Paiement Réussi ! 🎉
            </h1>
            
            <p className="text-gray-600 mb-6">
              Votre réservation a été confirmée et payée avec succès. 
              Vous recevrez un email de confirmation sous peu.
            </p>

            {paymentData && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-medium text-gray-900 mb-2">Détails du paiement :</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Montant :</span>
                    <span className="font-medium">{paymentData.payment?.amount}€</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Méthode :</span>
                    <span className="font-medium">Carte Bancaire</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transaction :</span>
                    <span className="font-medium font-mono text-xs">
                      {paymentData.payment?.transactionId?.slice(-8) || 'TEST-' + Date.now().toString().slice(-6)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Link
                href="/dashboard"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-block"
              >
                Voir mes réservations
              </Link>
              
              <Link
                href="/"
                className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors inline-block"
              >
                Retour à l'accueil
              </Link>
            </div>

            <p className="text-xs text-gray-500 mt-6">
              Redirection automatique dans 5 secondes...
            </p>
          </motion.div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Paiement - Hotel Luxe</title>
        <meta name="description" content="Finaliser le paiement de votre réservation" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-6">
              <Link
                href="/dashboard"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                <span>Retour au dashboard</span>
              </Link>
              
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">H</span>
                </div>
                <span className="font-semibold text-gray-900">Hotel Luxe</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Finaliser votre Paiement
            </h1>
            <p className="text-xl text-gray-600">
              Sécurisé par Stripe • Développé par msylla01 • 2025-10-01 15:34:57
            </p>
          </div>

          {booking ? (
            <PaymentForm 
              booking={booking}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">Réservation non trouvée</p>
              <Link
                href="/dashboard"
                className="mt-4 inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retour au dashboard
              </Link>
            </div>
          )}
        </main>
      </div>
    </>
  )
}
