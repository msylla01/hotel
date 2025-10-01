import Link from 'next/link'
import Head from 'next/head'

export default function PaymentTest() {
  const testBookingId = 'test-booking-123'
  
  return (
    <>
      <Head>
        <title>Test Paiement - Hotel Luxe</title>
      </Head>

      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Test du Système de Paiement 💳
          </h1>
          
          <p className="text-gray-600 mb-8">
            Développé par msylla01 • 2025-10-01 15:34:57
          </p>
          
          <div className="space-y-4">
            <Link
              href={`/payment/${testBookingId}`}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-block"
            >
              Tester le Paiement Stripe
            </Link>
            
            <Link
              href="/"
              className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors inline-block"
            >
              Retour à l'accueil
            </Link>
          </div>
          
          <div className="mt-6 text-xs text-gray-500">
            <p>Carte de test Stripe :</p>
            <p className="font-mono">4242 4242 4242 4242</p>
            <p>Toute date future, tout CVC</p>
          </div>
        </div>
      </div>
    </>
  )
}
