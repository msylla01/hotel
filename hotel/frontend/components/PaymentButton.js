import { useState } from 'react'

export default function PaymentButton({ booking, onSuccess }) {
  const [showPayment, setShowPayment] = useState(false)
  const [paymentType, setPaymentType] = useState('mobile')
  const [loading, setLoading] = useState(false)
  
  // États mobile
  const [mobileData, setMobileData] = useState({
    phoneNumber: '',
    operator: 'ORANGE'
  })
  
  // États carte
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: ''
  })

  const handleMobilePayment = async () => {
    try {
      setLoading(true)
      
      const token = localStorage.getItem('hotel_token')
      const response = await fetch('http://localhost:5000/api/payments/mobile', {
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
      console.log('📱 Réponse paiement mobile [msylla01]:', data)

      if (data.success) {
        alert(`✅ Paiement ${mobileData.operator} initié !\n\n${data.instructions.ussd}\n\nEnvoyez ${data.payment.amount} XOF au ${data.payment.hotelNumber}\n\nNotre équipe validera votre paiement.`)
        setShowPayment(false)
        if (onSuccess) onSuccess(data.payment)
      } else {
        alert(`❌ Erreur: ${data.message}`)
      }

    } catch (error) {
      console.error('❌ Erreur paiement mobile [msylla01]:', error)
      alert('Erreur de connexion au serveur de paiement')
    } finally {
      setLoading(false)
    }
  }

  const handleCardPayment = async () => {
    try {
      setLoading(true)
      
      const token = localStorage.getItem('hotel_token')
      const response = await fetch('http://localhost:5000/api/payments/card', {
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
      console.log('💳 Réponse paiement carte [msylla01]:', data)

      if (data.success) {
        alert(`✅ Paiement par carte réussi !\n\nTransaction: ${data.payment.transactionId}\nMontant: ${data.payment.amount}€\n\nRéservation confirmée !`)
        setShowPayment(false)
        if (onSuccess) onSuccess(data.payment)
      } else {
        alert(`❌ Paiement refusé: ${data.message}`)
      }

    } catch (error) {
      console.error('❌ Erreur paiement carte [msylla01]:', error)
      alert('Erreur de connexion au serveur de paiement')
    } finally {
      setLoading(false)
    }
  }

  if (!showPayment) {
    return (
      <button
        onClick={() => setShowPayment(true)}
        className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
      >
        💳 Payer maintenant ({booking.totalAmount}€)
      </button>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">💳 Paiement</h3>
        <button
          onClick={() => setShowPayment(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      {/* Onglets */}
      <div className="flex space-x-2">
        <button
          onClick={() => setPaymentType('mobile')}
          className={`flex-1 py-2 px-4 rounded text-sm font-medium ${
            paymentType === 'mobile' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          📱 Mobile Money
        </button>
        <button
          onClick={() => setPaymentType('card')}
          className={`flex-1 py-2 px-4 rounded text-sm font-medium ${
            paymentType === 'card' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          💳 Carte
        </button>
      </div>

      {/* Contenu Mobile */}
      {paymentType === 'mobile' && (
        <div className="space-y-4">
          <div className="bg-orange-50 p-3 rounded text-sm">
            <strong>�� Numéros Hotel:</strong><br/>
            🟠 Orange: 0703033133<br/>
            🌊 Wave: 0703033133<br/>
            🆓 Free: 0703033133
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Opérateur</label>
            <select
              value={mobileData.operator}
              onChange={(e) => setMobileData({...mobileData, operator: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            >
              <option value="ORANGE">🟠 Orange Money</option>
              <option value="WAVE">🌊 Wave</option>
              <option value="FREE">🆓 Free Money</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Votre numéro</label>
            <input
              type="tel"
              value={mobileData.phoneNumber}
              onChange={(e) => setMobileData({...mobileData, phoneNumber: e.target.value})}
              placeholder="77 123 45 67"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <button
            onClick={handleMobilePayment}
            disabled={loading || !mobileData.phoneNumber}
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Traitement...' : `💰 Payer ${booking.totalAmount}€`}
          </button>
        </div>
      )}

      {/* Contenu Carte */}
      {paymentType === 'card' && (
        <div className="space-y-4">
          <div className="bg-blue-50 p-3 rounded text-sm">
            <strong>💳 Paiement sécurisé</strong><br/>
            Visa, Mastercard, American Express acceptées
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de carte</label>
            <input
              type="text"
              value={cardData.cardNumber}
              onChange={(e) => setCardData({...cardData, cardNumber: e.target.value.replace(/\D/g, '')})}
              placeholder="1234 5678 9012 3456"
              maxLength="16"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom du titulaire</label>
            <input
              type="text"
              value={cardData.cardHolder}
              onChange={(e) => setCardData({...cardData, cardHolder: e.target.value.toUpperCase()})}
              placeholder="JOHN DOE"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiration</label>
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
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
              <input
                type="text"
                value={cardData.cvv}
                onChange={(e) => setCardData({...cardData, cvv: e.target.value.replace(/\D/g, '')})}
                placeholder="123"
                maxLength="3"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <button
            onClick={handleCardPayment}
            disabled={loading || !cardData.cardNumber || !cardData.cardHolder || !cardData.expiryDate || !cardData.cvv}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Traitement...' : `💳 Payer ${booking.totalAmount}€`}
          </button>
        </div>
      )}

      <div className="text-xs text-gray-500 text-center">
        Paiement sécurisé • Hotel Luxe • msylla01 • 2025-10-02 02:07:10
      </div>
    </div>
  )
}
