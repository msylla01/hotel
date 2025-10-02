import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  XMarkIcon,
  CreditCardIcon,
  DevicePhoneMobileIcon,
  BanknotesIcon,
  BuildingLibraryIcon
} from '@heroicons/react/24/outline'

export default function PaymentModal({ booking, isOpen, onClose, onSuccess }) {
  const [activeTab, setActiveTab] = useState('mobile')
  const [loading, setLoading] = useState(false)
  const [paymentMethods, setPaymentMethods] = useState(null)
  
  // États pour chaque type de paiement
  const [mobileData, setMobileData] = useState({
    phoneNumber: '',
    operator: 'ORANGE'
  })
  
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: ''
  })
  
  const [otherData, setOtherData] = useState({
    paymentMethod: 'BANK_TRANSFER',
    reference: '',
    notes: ''
  })

  useEffect(() => {
    if (isOpen) {
      fetchPaymentMethods()
    }
  }, [isOpen])

  const fetchPaymentMethods = async () => {
    try {
      const token = localStorage.getItem('hotel_token')
      const response = await fetch('http://localhost:5000/api/payments/methods', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setPaymentMethods(data.paymentMethods)
        }
      }
    } catch (error) {
      console.error('❌ Erreur récupération moyens paiement [msylla01]:', error)
    }
  }

  const handleMobilePayment = async () => {
    try {
      setLoading(true)
      
      const token = localStorage.getItem('hotel_token')
      const response = await fetch('http://localhost:5000/api/payments/mobile/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bookingId: booking.id,
          phoneNumber: mobileData.phoneNumber,
          operator: mobileData.operator,
          amount: booking.totalAmount
        })
      })

      const data = await response.json()

      if (data.success) {
        alert(`💰 Paiement ${mobileData.operator} initié !\n\n${data.instructions.ussdCodes}\n\nNuméro Hotel: ${data.payment.hotelNumber}\nMontant: ${data.payment.amount} XOF\n\nVotre paiement sera confirmé par notre équipe.`)
        onSuccess(data.payment)
      } else {
        alert(`❌ ${data.message}`)
      }

    } catch (error) {
      console.error('❌ Erreur paiement mobile [msylla01]:', error)
      alert('Erreur lors du paiement mobile')
    } finally {
      setLoading(false)
    }
  }

  const handleCardPayment = async () => {
    try {
      setLoading(true)
      
      const token = localStorage.getItem('hotel_token')
      const response = await fetch('http://localhost:5000/api/payments/card/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bookingId: booking.id,
          cardNumber: cardData.cardNumber,
          cardHolder: cardData.cardHolder,
          expiryDate: cardData.expiryDate,
          cvv: cardData.cvv,
          amount: booking.totalAmount
        })
      })

      const data = await response.json()

      if (data.success) {
        alert(`✅ Paiement par carte réussi !\n\nTransaction: ${data.payment.transactionId}\nMontant: ${data.payment.amount}€\n\nVotre réservation est confirmée !`)
        onSuccess(data.payment)
      } else {
        alert(`❌ Paiement refusé: ${data.message}`)
      }

    } catch (error) {
      console.error('❌ Erreur paiement carte [msylla01]:', error)
      alert('Erreur lors du paiement par carte')
    } finally {
      setLoading(false)
    }
  }

  const handleOtherPayment = async () => {
    try {
      setLoading(true)
      
      const token = localStorage.getItem('hotel_token')
      const response = await fetch('http://localhost:5000/api/payments/other/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bookingId: booking.id,
          paymentMethod: otherData.paymentMethod,
          amount: booking.totalAmount,
          reference: otherData.reference,
          notes: otherData.notes
        })
      })

      const data = await response.json()

      if (data.success) {
        const instructions = data.instructions.instructions.join('\n')
        alert(`📋 ${data.instructions.title} initié !\n\n${instructions}\n\nRéférence: ${data.payment.transactionId}`)
        onSuccess(data.payment)
      } else {
        alert(`❌ ${data.message}`)
      }

    } catch (error) {
      console.error('❌ Erreur autre paiement [msylla01]:', error)
      alert('Erreur lors du paiement')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">💳 Paiement</h2>
              <p className="text-gray-600">Réservation #{booking.id} • {booking.totalAmount}€</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            {[
              { id: 'mobile', label: 'Mobile Money', icon: DevicePhoneMobileIcon },
              { id: 'card', label: 'Carte Bancaire', icon: CreditCardIcon },
              { id: 'other', label: 'Autres Moyens', icon: BuildingLibraryIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 py-4 px-6 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-6">
            
            {/* Mobile Money Tab */}
            {activeTab === 'mobile' && (
              <div className="space-y-6">
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-orange-900 mb-2">📱 Numéros Hotel Luxe</h3>
                  <div className="space-y-1 text-sm text-orange-800">
                    <div>🟠 Orange Money: <strong>0703033133</strong></div>
                    <div>🌊 Wave: <strong>0703033133</strong></div>
                    <div>🆓 Free Money: <strong>0703033133</strong></div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Opérateur
                    </label>
                    <select
                      value={mobileData.operator}
                      onChange={(e) => setMobileData({...mobileData, operator: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="ORANGE">🟠 Orange Money</option>
                      <option value="WAVE">🌊 Wave</option>
                      <option value="FREE">🆓 Free Money</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Votre numéro
                    </label>
                    <input
                      type="tel"
                      value={mobileData.phoneNumber}
                      onChange={(e) => setMobileData({...mobileData, phoneNumber: e.target.value})}
                      placeholder="77 123 45 67"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Instructions</h4>
                  <ol className="text-sm text-blue-800 space-y-1">
                    <li>1. Cliquez sur "Initier le paiement"</li>
                    <li>2. Suivez les instructions reçues</li>
                    <li>3. Envoyez {booking.totalAmount} XOF au <strong>0703033133</strong></li>
                    <li>4. Notez le code de confirmation</li>
                    <li>5. Notre équipe validera sous 24h</li>
                  </ol>
                </div>

                <button
                  onClick={handleMobilePayment}
                  disabled={loading || !mobileData.phoneNumber}
                  className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 font-semibold"
                >
                  {loading ? 'Traitement...' : `💰 Initier paiement ${mobileData.operator}`}
                </button>
              </div>
            )}

            {/* Card Tab */}
            {activeTab === 'card' && (
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">💳 Paiement Sécurisé</h3>
                  <p className="text-sm text-blue-800">
                    Paiement immédiat avec confirmation automatique. Cartes acceptées: Visa, Mastercard, American Express.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Numéro de carte
                    </label>
                    <input
                      type="text"
                      value={cardData.cardNumber}
                      onChange={(e) => setCardData({...cardData, cardNumber: e.target.value.replace(/\D/g, '')})}
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom du titulaire
                    </label>
                    <input
                      type="text"
                      value={cardData.cardHolder}
                      onChange={(e) => setCardData({...cardData, cardHolder: e.target.value.toUpperCase()})}
                      placeholder="JOHN DOE"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date d'expiration
                    </label>
                    <input
                      type="text"
                      value={cardData.expiryDate}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, '')
                        if (value.length >= 2) {
                          value = value.slice(0, 2) + '/' + value.slice(2, 4)
                        }
                        setCardData({...cardData, expiryDate: value})
                      }}
                      placeholder="MM/YY"
                      maxLength="5"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      value={cardData.cvv}
                      onChange={(e) => setCardData({...cardData, cvv: e.target.value.replace(/\D/g, '')})}
                      placeholder="123"
                      maxLength="4"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-green-800 font-semibold">Montant à payer:</span>
                    <span className="text-2xl font-bold text-green-600">{booking.totalAmount}€</span>
                  </div>
                </div>

                <button
                  onClick={handleCardPayment}
                  disabled={loading || !cardData.cardNumber || !cardData.cardHolder || !cardData.expiryDate || !cardData.cvv}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold"
                >
                  {loading ? 'Traitement...' : `💳 Payer ${booking.totalAmount}€ par carte`}
                </button>
              </div>
            )}

            {/* Other Tab */}
            {activeTab === 'other' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Moyen de paiement
                  </label>
                  <select
                    value={otherData.paymentMethod}
                    onChange={(e) => setOtherData({...otherData, paymentMethod: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="BANK_TRANSFER">🏦 Virement bancaire</option>
                    <option value="PAYPAL">🟦 PayPal</option>
                    <option value="CASH">💵 Espèces à l'hôtel</option>
                    <option value="CHECK">📝 Chèque</option>
                    <option value="CRYPTO">₿ Cryptomonnaie</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Référence (optionnel)
                  </label>
                  <input
                    type="text"
                    value={otherData.reference}
                    onChange={(e) => setOtherData({...otherData, reference: e.target.value})}
                    placeholder="Votre référence..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (optionnel)
                  </label>
                  <textarea
                    value={otherData.notes}
                    onChange={(e) => setOtherData({...otherData, notes: e.target.value})}
                    rows={3}
                    placeholder="Informations complémentaires..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-900 mb-2">ℹ️ Important</h4>
                  <p className="text-sm text-yellow-800">
                    Vous recevrez les instructions détaillées après validation. 
                    Certains moyens de paiement nécessitent une validation manuelle.
                  </p>
                </div>

                <button
                  onClick={handleOtherPayment}
                  disabled={loading}
                  className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 font-semibold"
                >
                  {loading ? 'Traitement...' : 'Initier le paiement'}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
