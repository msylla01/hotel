import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  ArrowLeftIcon,
  ClockIcon,
  HomeIcon,
  BanknotesIcon,
  PrinterIcon,
  CheckCircleIcon,
  FireIcon,
  CloudIcon
} from '@heroicons/react/24/outline'

export default function HourlyBooking() {
  const router = useRouter()
  const { roomId } = router.query
  const [user, setUser] = useState(null)
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(null)
  const [formData, setFormData] = useState({
    roomId: roomId || '',
    climateType: '', // NOUVEAU: type climatisation obligatoire
    checkIn: '',
    duration: 2,
    notes: ''
  })

  const hourlyRates = {
    'SINGLE_VENTILE': 15,
    'SINGLE_CLIMATISE': 18,
    'DOUBLE_VENTILE': 20,
    'DOUBLE_CLIMATISE': 25,
    'SUITE_VENTILE': 35,
    'SUITE_CLIMATISE': 40,
    'FAMILY_VENTILE': 25,
    'FAMILY_CLIMATISE': 30,
    'DELUXE_VENTILE': 45,
    'DELUXE_CLIMATISE': 50
  }

  useEffect(() => {
    const token = localStorage.getItem('hotel_token')
    const userData = localStorage.getItem('hotel_user')
    
    if (!token || !userData) {
      router.push('/auth/login')
      return
    }

    try {
      const user = JSON.parse(userData)
      console.log("🔐 Auth gérant hourly:", user.email, user.role);
      
      if (user.role !== "MANAGER" && user.role !== "ADMIN") {
        router.push('/dashboard')
        return
      }

      setUser(user)
      fetchAvailableRooms()

      const now = new Date()
      now.setMinutes(Math.ceil(now.getMinutes() / 15) * 15)
      setFormData(prev => ({
        ...prev,
        checkIn: now.toISOString().slice(0, 16),
        roomId: roomId || prev.roomId
      }))
    } catch (err) {
      console.error('❌ Erreur auth gérant [msylla01]:', err)
      router.push('/auth/login')
    }
  }, [router, roomId])

  const fetchAvailableRooms = async () => {
    try {
      console.log("🔐 Récupération chambres hourly [msylla01]");
      
      const token = localStorage.getItem('hotel_token')
      const response = await fetch('http://localhost:5000/api/manager/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      const data = await response.json()
      if (data.success) {
        // Filtrer les chambres disponibles et créer options climatisation
        const availableRooms = data.data.rooms.filter(room => !room.isOccupied)
        
        // Créer une liste avec toutes les combinaisons chambre + climatisation
        const roomOptions = []
        availableRooms.forEach(room => {
          const roomCode = room.name.match(/^(CH\d+)/) ? room.name.match(/^(CH\d+)/)[1] : room.name;
          
          roomOptions.push({
            id: room.id + '_VENTILE',
            roomId: room.id,
            name: roomCode,
            type: room.type,
            climateType: 'VENTILE',
            displayName: `${roomCode} - ${room.type} Ventilé`,
            rate: hourlyRates[`${room.type}_VENTILE`] || 20
          })
          
          roomOptions.push({
            id: room.id + '_CLIMATISE',
            roomId: room.id,
            name: roomCode,
            type: room.type,
            climateType: 'CLIMATISE',
            displayName: `${roomCode} - ${room.type} Climatisé`,
            rate: hourlyRates[`${room.type}_CLIMATISE`] || 25
          })
        })
        
        setRooms(roomOptions)
      }
    } catch (error) {
      console.error('❌ Erreur récupération chambres [msylla01]:', error)
      // Fallback avec codes CH1, CH2...
      const fallbackRooms = []
      for (let i = 1; i <= 5; i++) {
        const types = ['SINGLE', 'DOUBLE', 'SUITE']
        const type = types[i % 3]
        
        fallbackRooms.push({
          id: `${i}_VENTILE`,
          roomId: `${i}`,
          name: `CH${i}`,
          type: type,
          climateType: 'VENTILE',
          displayName: `CH${i} - ${type} Ventilé`,
          rate: hourlyRates[`${type}_VENTILE`] || 20
        })
        
        fallbackRooms.push({
          id: `${i}_CLIMATISE`,
          roomId: `${i}`,
          name: `CH${i}`,
          type: type,
          climateType: 'CLIMATISE',
          displayName: `CH${i} - ${type} Climatisé`,
          rate: hourlyRates[`${type}_CLIMATISE`] || 25
        })
      }
      setRooms(fallbackRooms)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation avec climatisation obligatoire
    if (!formData.roomId || !formData.climateType || !formData.checkIn || !formData.duration) {
      setError('Veuillez remplir tous les champs obligatoires y compris le type de climatisation')
      return
    }

    try {
      console.log("🔐 Création réservation horaire [msylla01]");
      setLoading(true)
      setError('')

      const token = localStorage.getItem('hotel_token')
      
      // Préparer les données avec climatisation
      const bookingData = {
        ...formData,
        roomType: getSelectedRoom()?.type,
        climateType: formData.climateType
      }

      const response = await fetch('http://localhost:5000/api/manager/booking/hourly', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingData)
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSuccess(data)
        console.log('✅ Réservation horaire créée [msylla01]:', data.booking.id)
      } else {
        throw new Error(data.message || 'Erreur création réservation')
      }
    } catch (error) {
      console.error('❌ Erreur création réservation horaire [msylla01]:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const getSelectedRoom = () => {
    return rooms.find(r => r.id === (formData.roomId + '_' + formData.climateType))
  }

  const calculateTotal = () => {
    const selectedRoom = getSelectedRoom()
    if (!selectedRoom || !formData.duration) return 0
    
    return selectedRoom.rate * formData.duration
  }

  const getCheckOutTime = () => {
    if (!formData.checkIn || !formData.duration) return ''
    
    const checkIn = new Date(formData.checkIn)
    const checkOut = new Date(checkIn.getTime() + (formData.duration * 60 * 60 * 1000))
    return checkOut.toLocaleString('fr-FR')
  }

  if (success) {
    return (
      <>
        <Head>
          <title>Réservation Créée - Espace Gérant</title>
        </Head>

        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full mx-4"
          >
            <div className="text-center mb-6">
              <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Réservation Créée !
              </h2>
              <p className="text-gray-600">
                Séjour horaire avec climatisation enregistré
              </p>
            </div>

            <div className="space-y-3 mb-6 bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between">
                <span className="text-gray-600">Reçu N°:</span>
                <span className="font-mono text-sm">{success.receipt?.number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Chambre:</span>
                <span className="font-medium">{getSelectedRoom()?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="flex items-center space-x-1">
                  <span>{getSelectedRoom()?.type}</span>
                  {formData.climateType === 'CLIMATISE' ? 
                    <CloudIcon className="w-4 h-4 text-blue-500" /> : 
                    <FireIcon className="w-4 h-4 text-orange-500" />
                  }
                  <span className="text-xs">
                    {formData.climateType === 'CLIMATISE' ? 'Climatisé' : 'Ventilé'}
                  </span>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Durée:</span>
                <span>{formData.duration} heure(s)</span>
              </div>
              <div className="flex justify-between border-t pt-3">
                <span className="font-bold">TOTAL:</span>
                <span className="font-bold text-green-600">{calculateTotal()}€</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  const receiptWindow = window.open('', '_blank')
                  receiptWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                    <head><title>Reçu - Hotel Luxe</title></head>
                    <body style="font-family: Arial; max-width: 300px; margin: 20px auto;">
                      <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px;">
                        <h2>HOTEL LUXE</h2>
                        <p>SÉJOUR HORAIRE</p>
                        <p>Reçu N° ${success.receipt?.number}</p>
                      </div>
                      
                      <div style="margin: 5px 0;">Chambre: ${getSelectedRoom()?.name}</div>
                      <div style="margin: 5px 0;">Type: ${getSelectedRoom()?.type} ${formData.climateType === 'CLIMATISE' ? 'Climatisé' : 'Ventilé'}</div>
                      <div style="margin: 5px 0;">Durée: ${formData.duration} heure(s)</div>
                      <div style="margin: 5px 0;">Tarif: ${getSelectedRoom()?.rate}€/heure</div>
                      
                      <div style="border-top: 2px solid #000; padding-top: 10px; font-weight: bold; margin-top: 15px;">
                        <div>TOTAL: ${calculateTotal()}€</div>
                      </div>
                      
                      <div style="text-align: center; margin-top: 15px; font-size: 12px;">
                        <p>Gérant: ${user?.firstName} ${user?.lastName}</p>
                        <p>Merci de votre visite !</p>
                        <p>Hotel Luxe - 2025-10-04 03:22:14</p>
                      </div>
                    </body>
                    </html>
                  `)
                  receiptWindow.document.close()
                  receiptWindow.print()
                }}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <PrinterIcon className="w-5 h-5" />
                <span>Imprimer Reçu</span>
              </button>
              
              <Link
                href="/manager"
                className="block w-full bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition-colors text-center"
              >
                Retour Dashboard
              </Link>
              
              <Link
                href="/manager/booking/hourly"
                className="block w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors text-center"
              >
                Nouvelle Réservation
              </Link>
            </div>
          </motion.div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Réservation Horaire - Espace Gérant</title>
        <meta name="description" content="Créer une réservation horaire avec choix climatisation" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <Link href="/manager" className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                  <ArrowLeftIcon className="w-5 h-5 mr-2" />
                  Espace Gérant
                </Link>
                <div className="text-gray-300">•</div>
                <h1 className="text-xl font-bold text-gray-900">Réservation Horaire</h1>
              </div>

              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  🏨 {user?.firstName} {user?.lastName}
                </span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Gérant</span>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm p-8"
          >
            {/* En-tête */}
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                <ClockIcon className="w-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Séjour Horaire</h2>
                <p className="text-gray-600">1h à 5h • Choisir climatisation obligatoire</p>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800">❌ {error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Sélection chambre + climatisation OBLIGATOIRE */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chambre disponible *
                  </label>
                  <select
                    value={formData.roomId}
                    onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  >
                    <option value="">Sélectionner une chambre</option>
                    {rooms.filter(room => room.climateType === 'VENTILE').map(room => (
                      <option key={room.roomId} value={room.roomId}>
                        {room.name} - {room.type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type climatisation * {formData.roomId && (
                      <span className="text-red-600">(OBLIGATOIRE)</span>
                    )}
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-orange-50 transition-colors">
                      <input
                        type="radio"
                        name="climateType"
                        value="VENTILE"
                        checked={formData.climateType === 'VENTILE'}
                        onChange={(e) => setFormData({ ...formData, climateType: e.target.value })}
                        className="mr-3"
                        required
                      />
                      <FireIcon className="w-5 h-5 text-orange-500 mr-2" />
                      <div>
                        <div className="font-medium">Chambre Ventilée</div>
                        <div className="text-sm text-gray-600">
                          Tarif standard
                          {formData.roomId && ` - ${rooms.find(r => r.roomId === formData.roomId && r.climateType === 'VENTILE')?.rate || 20}€/h`}
                        </div>
                      </div>
                    </label>

                    <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
                      <input
                        type="radio"
                        name="climateType"
                        value="CLIMATISE"
                        checked={formData.climateType === 'CLIMATISE'}
                        onChange={(e) => setFormData({ ...formData, climateType: e.target.value })}
                        className="mr-3"
                        required
                      />
                      <CloudIcon className="w-5 h-5 text-blue-500 mr-2" />
                      <div>
                        <div className="font-medium">Chambre Climatisée</div>
                        <div className="text-sm text-gray-600">
                          Supplément climatisation
                          {formData.roomId && ` - ${rooms.find(r => r.roomId === formData.roomId && r.climateType === 'CLIMATISE')?.rate || 25}€/h`}
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Heure d'entrée */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heure d'entrée *
                </label>
                <input
                  type="datetime-local"
                  value={formData.checkIn}
                  onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              {/* Durée */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durée du séjour *
                </label>
                <div className="grid grid-cols-5 gap-3">
                  {[1, 2, 3, 4, 5].map(hours => (
                    <button
                      key={hours}
                      type="button"
                      onClick={() => setFormData({ ...formData, duration: hours })}
                      className={`p-3 text-center border-2 rounded-lg transition-colors ${
                        formData.duration === hours
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-300 hover:border-green-300'
                      }`}
                    >
                      <div className="font-bold">{hours}h</div>
                      {getSelectedRoom() && (
                        <div className="text-xs text-gray-600">
                          {getSelectedRoom().rate * hours}€
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Résumé avec climatisation */}
              {formData.roomId && formData.climateType && formData.checkIn && formData.duration && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-3">📋 Résumé de la réservation</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Chambre:</span>
                      <span className="font-medium flex items-center space-x-1">
                        <span>{getSelectedRoom()?.name}</span>
                        {formData.climateType === 'CLIMATISE' ? 
                          <CloudIcon className="w-4 h-4 text-blue-500" /> : 
                          <FireIcon className="w-4 h-4 text-orange-500" />
                        }
                        <span className="text-xs">
                          {formData.climateType === 'CLIMATISE' ? 'Climatisé' : 'Ventilé'}
                        </span>
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span>{getSelectedRoom()?.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Entrée:</span>
                      <span>{new Date(formData.checkIn).toLocaleString('fr-FR')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sortie prévue:</span>
                      <span className="font-medium text-orange-600">{getCheckOutTime()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Durée:</span>
                      <span>{formData.duration} heure(s)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tarif:</span>
                      <span>{getSelectedRoom()?.rate}€/heure</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-bold">TOTAL:</span>
                      <span className="font-bold text-green-600 text-lg">
                        {calculateTotal()}€
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (optionnel)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Notes particulières pour ce séjour..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 resize-none"
                />
              </div>

              {/* Boutons */}
              <div className="flex space-x-4 pt-6 border-t">
                <Link
                  href="/manager"
                  className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors text-center"
                >
                  Annuler
                </Link>
                <button
                  type="submit"
                  disabled={loading || !formData.roomId || !formData.climateType || !formData.checkIn}
                  className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Création...</span>
                    </>
                  ) : (
                    <>
                      <BanknotesIcon className="w-5 h-5" />
                      <span>Enregistrer & Encaisser</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>

          {/* Footer info */}
          <div className="mt-6 text-center text-gray-500 text-sm">
            Réservation Horaire • Climatisation Obligatoire • msylla01 • 2025-10-04 03:22:14
          </div>
        </main>
      </div>
    </>
  )
}
