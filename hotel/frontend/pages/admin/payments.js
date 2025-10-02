import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  PhoneIcon,
  CreditCardIcon,
  UserIcon
} from '@heroicons/react/24/outline'

export default function AdminPayments() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [pendingPayments, setPendingPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('hotel_token')
    const userData = localStorage.getItem('hotel_user')
    
    if (!token || !userData) {
      router.push('/auth/login')
      return
    }

    const user = JSON.parse(userData)
    if (user.role !== 'ADMIN') {
      alert('Accès réservé aux administrateurs')
      router.push('/dashboard')
      return
    }
    
    setUser(user)
    fetchPendingPayments()
  }, [router])

  const fetchPendingPayments = async () => {
    try {
      setLoading(true)
      
      const token = localStorage.getItem('hotel_token')
      const response = await fetch('http://localhost:5000/api/mobile-payments/admin/pending', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setPendingPayments(data.payments)
          console.log(`✅ ${data.payments.length} paiements en attente [msylla01]`)
        }
      }

    } catch (error) {
      console.error('❌ Erreur récupération paiements [msylla01]:', error)
    } finally {
      setLoading(false)
    }
  }

  const confirmPayment = async (paymentId, confirmationCode, adminNotes) => {
    try {
      setActionLoading(paymentId)
      
      const token = localStorage.getItem('hotel_token')
      const response = await fetch(`http://localhost:5000/api/mobile-payments/admin/${paymentId}/confirm`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ confirmationCode, adminNotes })
      })

      const data = await response.json()

      if (data.success) {
        alert(`✅ Paiement confirmé pour ${data.booking.customerName}`)
        fetchPendingPayments() // Recharger
      } else {
        alert(`❌ ${data.message}`)
      }

    } catch (error) {
      console.error('❌ Erreur confirmation [msylla01]:', error)
      alert('Erreur lors de la confirmation')
    } finally {
      setActionLoading(null)
    }
  }

  const rejectPayment = async (paymentId, reason) => {
    try {
      setActionLoading(paymentId)
      
      const token = localStorage.getItem('hotel_token')
      const response = await fetch(`http://localhost:5000/api/mobile-payments/admin/${paymentId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      })

      const data = await response.json()

      if (data.success) {
        alert(`❌ Paiement rejeté`)
        fetchPendingPayments() // Recharger
      } else {
        alert(`❌ ${data.message}`)
      }

    } catch (error) {
      console.error('❌ Erreur rejet [msylla01]:', error)
      alert('Erreur lors du rejet')
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des paiements...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <>
      <Head>
        <title>Admin - Paiements en attente - Hotel Luxe</title>
        <meta name="description" content="Gestion des paiements mobiles en attente" />
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
                <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                  <CreditCardIcon className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-gray-900">Admin - Paiements</span>
              </div>

              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {user.firstName} {user.lastName} (Admin)
                </span>
                <div className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                  {pendingPayments.length} en attente
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              💳 Paiements en attente de validation
            </h1>
            <p className="text-gray-600">
              {pendingPayments.length} paiement(s) mobile(s) en attente de confirmation
            </p>
          </motion.div>

          {pendingPayments.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
              <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun paiement en attente
              </h3>
              <p className="text-gray-600">
                Tous les paiements mobiles ont été traités
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {pendingPayments.map((payment, index) => (
                <motion.div
                  key={payment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-sm p-6"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Informations client */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <UserIcon className="w-5 h-5 mr-2 text-blue-600" />
                        Informations client
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-500">Nom:</span>
                          <span className="ml-2 font-medium">
                            {payment.booking.user.firstName} {payment.booking.user.lastName}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Email:</span>
                          <span className="ml-2">{payment.booking.user.email}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Téléphone:</span>
                          <span className="ml-2">{payment.booking.user.phone || 'Non renseigné'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Informations réservation */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">
                        📋 Réservation & Paiement
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-500">Chambre:</span>
                          <span className="ml-2 font-medium">{payment.booking.room.name}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Dates:</span>
                          <span className="ml-2">
                            {new Date(payment.booking.checkIn).toLocaleDateString('fr-FR')} - 
                            {new Date(payment.booking.checkOut).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Montant:</span>
                          <span className="ml-2 font-bold text-green-600">{payment.amount}€</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Opérateur:</span>
                          <span className="ml-2 font-medium">{payment.provider}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Numéro:</span>
                          <span className="ml-2">{payment.phoneNumber}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Transaction:</span>
                          <span className="ml-2 font-mono text-xs">{payment.transactionId}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Initié le:</span>
                          <span className="ml-2">{new Date(payment.createdAt).toLocaleString('fr-FR')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions admin */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">
                        ⚡ Actions Admin
                      </h3>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Code de confirmation</label>
                          <input
                            type="text"
                            id={`confirmation-${payment.id}`}
                            placeholder="Code de confirmation..."
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Notes admin</label>
                          <textarea
                            id={`notes-${payment.id}`}
                            rows={2}
                            placeholder="Notes de validation..."
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                          />
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              const confirmationCode = document.getElementById(`confirmation-${payment.id}`).value
                              const adminNotes = document.getElementById(`notes-${payment.id}`).value
                              confirmPayment(payment.id, confirmationCode, adminNotes)
                            }}
                            disabled={actionLoading === payment.id}
                            className="flex-1 bg-green-600 text-white py-2 px-3 rounded text-sm hover:bg-green-700 disabled:opacity-50 flex items-center justify-center space-x-1"
                          >
                            <CheckCircleIcon className="w-4 h-4" />
                            <span>{actionLoading === payment.id ? 'En cours...' : 'Confirmer'}</span>
                          </button>
                          
                          <button
                            onClick={() => {
                              const reason = prompt('Raison du rejet:') || 'Non spécifiée'
                              if (reason) {
                                rejectPayment(payment.id, reason)
                              }
                            }}
                            disabled={actionLoading === payment.id}
                            className="flex-1 bg-red-600 text-white py-2 px-3 rounded text-sm hover:bg-red-700 disabled:opacity-50 flex items-center justify-center space-x-1"
                          >
                            <XCircleIcon className="w-4 h-4" />
                            <span>Rejeter</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {payment.adminNotes && (
                    <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
                      <strong>Notes:</strong> {payment.adminNotes}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-16 text-center text-gray-500"
          >
            <p className="text-sm">
              Admin Paiements Hotel Luxe • msylla01 • 2025-10-02 01:30:58 UTC
            </p>
          </motion.div>
        </main>
      </div>
    </>
  )
}
