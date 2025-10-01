import { useState } from 'react'

export function useBookings() {
  const [loading, setLoading] = useState(false)

  const createBooking = async (bookingData) => {
    try {
      setLoading(true)
      const token = localStorage.getItem('hotel_token')
      
      console.log('🆕 Création réservation [msylla01]:', bookingData)
      
      const response = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookingData)
      })

      const data = await response.json()

      if (data.success) {
        console.log('✅ Réservation créée [msylla01]:', data.booking.id)
        return { success: true, booking: data.booking }
      } else {
        console.error('❌ Erreur création réservation [msylla01]:', data.message)
        return { success: false, error: data.message, field: data.field }
      }
    } catch (error) {
      console.error('❌ Erreur réseau réservation [msylla01]:', error)
      return { success: false, error: 'Erreur de connexion' }
    } finally {
      setLoading(false)
    }
  }

  const fetchBookings = async (filters = {}) => {
    try {
      setLoading(true)
      const token = localStorage.getItem('hotel_token')
      
      const queryParams = new URLSearchParams(filters).toString()
      const url = `http://localhost:5000/api/bookings${queryParams ? `?${queryParams}` : ''}`
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (data.success) {
        console.log(`✅ ${data.bookings.length} réservations récupérées [msylla01]`)
        return { success: true, bookings: data.bookings, pagination: data.pagination }
      } else {
        return { success: false, error: data.message }
      }
    } catch (error) {
      console.error('❌ Erreur récupération réservations [msylla01]:', error)
      return { success: false, error: 'Erreur de connexion' }
    } finally {
      setLoading(false)
    }
  }

  const cancelBooking = async (bookingId) => {
    try {
      setLoading(true)
      const token = localStorage.getItem('hotel_token')
      
      console.log('🚫 Annulation réservation [msylla01]:', bookingId)
      
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (data.success) {
        console.log('✅ Réservation annulée [msylla01]:', bookingId)
        return { success: true, booking: data.booking }
      } else {
        console.error('❌ Erreur annulation [msylla01]:', data.message)
        return { success: false, error: data.message }
      }
    } catch (error) {
      console.error('❌ Erreur réseau annulation [msylla01]:', error)
      return { success: false, error: 'Erreur de connexion' }
    } finally {
      setLoading(false)
    }
  }

  const checkAvailability = async (roomId, checkIn, checkOut) => {
    try {
      const response = await fetch('http://localhost:5000/api/bookings/check-availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ roomId, checkIn, checkOut })
      })

      const data = await response.json()

      if (data.success) {
        return { success: true, available: data.available, message: data.message }
      } else {
        return { success: false, error: data.message }
      }
    } catch (error) {
      console.error('❌ Erreur vérification disponibilité [msylla01]:', error)
      return { success: false, error: 'Erreur de connexion' }
    }
  }

  return {
    createBooking,
    fetchBookings,
    cancelBooking,
    checkAvailability,
    loading
  }
}
