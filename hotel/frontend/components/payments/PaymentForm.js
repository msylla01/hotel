import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js'
import { motion } from 'framer-motion'
import { 
  CreditCardIcon,
  LockClosedIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline'

// Charger Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

// Composant de formulaire de paiement
function CheckoutForm({ booking, onPaymentSuccess, onPaymentError }) {
  const stripe = useStripe()
  const elements = useElements()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [clientSecret, setClientSecret] = useState('')
  const [paymentIntentId, setPaymentIntentId] = useState('')

  // Créer le Payment Intent au montage
  useEffect(() => {
    createPaymentIntent()
  }, [booking])

  const createPaymentIntent = async () => {
    try {
      const token = localStorage.getItem('hotel_token')
      const response = await fetch('http://localhost:5000/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bookingId: booking.id,
          amount: booking.totalAmount
        })
      })

      const data = await response.json()

      if (data.success) {
        setClientSecret(data.clientSecret)
        setPaymentIntentId(data.paymentIntentId)
        console.log('✅ Payment Intent créé [msylla01]:', data.paymentIntentId)
      } else {
        setError(data.message)
      }
    } catch (err) {
      setError('Erreur lors de la préparation du paiement')
      console.error('❌ Erreur Payment Intent [msylla01]:', err)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!stripe || !elements || !clientSecret) {
      return
    }

    setLoading(true)
    setError(null)

    const cardElement = elements.getElement(CardElement)

    // Confirmer le paiement avec Stripe
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: `${booking.user?.firstName} ${booking.user?.lastName}`,
          email: booking.user?.email
        }
      }
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      onPaymentError?.(error)
      console.error('❌ Erreur paiement Stripe [msylla01]:', error)
    } else {
      console.log('✅ Paiement réussi [msylla01]:', paymentIntent.id)
      
      // Confirmer le paiement côté backend
      try {
        const token = localStorage.getItem('hotel_token')
        const confirmResponse = await fetch('http://localhost:5000/api/payments/confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id
          })
        })

        const confirmData = await confirmResponse.json()

        if (confirmData.success) {
          onPaymentSuccess?.(confirmData)
        } else {
          setError(confirmData.message)
          onPaymentError?.(confirmData)
        }
      } catch (err) {
        setError('Erreur lors de la confirmation du paiement')
        onPaymentError?.(err)
      }
      
      setLoading(false)
    }
  }

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
    hidePostalCode: true
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-xl p-8"
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
          <CreditCardIcon className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Paiement Sécurisé</h3>
          <p className="text-gray-600">Carte bancaire via Stripe</p>
        </div>
      </div>

      {/* Récapitulatif */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Récapitulatif de votre réservation</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Chambre :</span>
            <span className="font-medium">{booking.room?.name || 'Chambre sélectionnée'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Dates :</span>
            <span className="font-medium">
              {new Date(booking.checkIn).toLocaleDateString('fr-FR')} - {' '}
              {new Date(booking.checkOut).toLocaleDateString('fr-FR')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Personnes :</span>
            <span className="font-medium">{booking.guests}</span>
          </div>
          <div className="border-t border-gray-200 pt-2 mt-2">
            <div className="flex justify-between">
              <span className="font-semibold text-gray-900">Total :</span>
              <span className="text-2xl font-bold text-blue-600">{booking.totalAmount}€</span>
            </div>
          </div>
        </div>
      </div>

      {/* Formulaire de paiement */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Informations de carte bancaire
          </label>
          <div className="border border-gray-300 rounded-lg p-4 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
            <CardElement options={cardElementOptions} />
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3"
          >
            <ExclamationCircleIcon className="w-5 h-5" />
            <span className="text-sm">{error}</span>
          </motion.div>
        )}

        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <LockClosedIcon className="w-4 h-4" />
          <span>Paiement 100% sécurisé avec Stripe</span>
        </div>

        <button
          type="submit"
          disabled={!stripe || loading || !clientSecret}
          className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Paiement en cours...</span>
            </>
          ) : (
            <>
              <LockClosedIcon className="w-5 h-5" />
              <span>Payer {booking.totalAmount}€</span>
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-gray-500">
        Développé par msylla01 • Paiements sécurisés Stripe • 2025-10-01 15:34:57
      </div>
    </motion.div>
  )
}

// Composant principal avec Stripe Provider
export default function PaymentForm({ booking, onPaymentSuccess, onPaymentError }) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm 
        booking={booking}
        onPaymentSuccess={onPaymentSuccess}
        onPaymentError={onPaymentError}
      />
    </Elements>
  )
}
