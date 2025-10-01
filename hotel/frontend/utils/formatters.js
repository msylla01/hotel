// Formatage des dates
export const formatDate = (date, locale = 'fr-FR') => {
  if (!date) return ''
  return new Date(date).toLocaleDateString(locale)
}

export const formatDateTime = (date, locale = 'fr-FR') => {
  if (!date) return ''
  return new Date(date).toLocaleString(locale)
}

export const formatTimeAgo = (date) => {
  if (!date) return ''
  
  const now = new Date()
  const past = new Date(date)
  const diffInSeconds = Math.floor((now - past) / 1000)
  
  if (diffInSeconds < 60) return 'À l\'instant'
  if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`
  if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)}h`
  if (diffInSeconds < 604800) return `Il y a ${Math.floor(diffInSeconds / 86400)} jour(s)`
  
  return formatDate(date)
}

// Formatage des prix
export const formatPrice = (price, currency = 'EUR') => {
  if (typeof price !== 'number') return '0€'
  
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(price)
}

// Formatage des noms
export const formatFullName = (firstName, lastName) => {
  if (!firstName && !lastName) return 'Utilisateur'
  return `${firstName || ''} ${lastName || ''}`.trim()
}

export const getInitials = (firstName, lastName) => {
  const first = firstName?.[0]?.toUpperCase() || ''
  const last = lastName?.[0]?.toUpperCase() || ''
  return `${first}${last}` || 'U'
}

// Formatage des statuts
export const getStatusLabel = (status) => {
  const statusLabels = {
    'PENDING': 'En attente',
    'CONFIRMED': 'Confirmée',
    'CANCELLED': 'Annulée', 
    'COMPLETED': 'Terminée',
    'CHECKED_IN': 'Arrivé',
    'CHECKED_OUT': 'Parti',
    'PAID': 'Payé',
    'REFUNDED': 'Remboursé'
  }
  return statusLabels[status] || status
}

export const getStatusColor = (status) => {
  const statusColors = {
    'PENDING': 'bg-yellow-100 text-yellow-800',
    'CONFIRMED': 'bg-green-100 text-green-800',
    'CANCELLED': 'bg-red-100 text-red-800',
    'COMPLETED': 'bg-blue-100 text-blue-800',
    'CHECKED_IN': 'bg-purple-100 text-purple-800',
    'CHECKED_OUT': 'bg-gray-100 text-gray-800',
    'PAID': 'bg-green-100 text-green-800',
    'REFUNDED': 'bg-orange-100 text-orange-800'
  }
  return statusColors[status] || 'bg-gray-100 text-gray-800'
}

// Formatage des types de chambres
export const getRoomTypeLabel = (type) => {
  const types = {
    'SINGLE': 'Simple',
    'DOUBLE': 'Double',
    'SUITE': 'Suite',
    'FAMILY': 'Familiale',
    'DELUXE': 'Deluxe'
  }
  return types[type] || type
}

export const getRoomTypeColor = (type) => {
  const colors = {
    'SINGLE': 'bg-green-100 text-green-800',
    'DOUBLE': 'bg-blue-100 text-blue-800',
    'SUITE': 'bg-purple-100 text-purple-800',
    'FAMILY': 'bg-orange-100 text-orange-800',
    'DELUXE': 'bg-red-100 text-red-800'
  }
  return colors[type] || 'bg-gray-100 text-gray-800'
}

// Formatage des numéros de téléphone
export const formatPhoneNumber = (phone) => {
  if (!phone) return ''
  // Format français +33 1 23 45 67 89
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5')
  }
  if (cleaned.length === 11 && cleaned.startsWith('33')) {
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(7, 9)} ${cleaned.slice(9)}`
  }
  return phone
}

// Calcul de durée de séjour
export const calculateStayDuration = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0
  
  const start = new Date(checkIn)
  const end = new Date(checkOut)
  const diffTime = Math.abs(end - start)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays
}

// Validation email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Génération d'ID de réservation
export const generateBookingId = () => {
  const prefix = 'BOOK'
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.random().toString(36).substr(2, 3).toUpperCase()
  return `${prefix}_${timestamp}_${random}`
}

// Développé par msylla01 - 2025-10-01 16:38:01
export const getDeveloperInfo = () => ({
  developer: 'msylla01',
  version: '1.0.0',
  buildDate: '2025-10-01 16:38:01 UTC',
  project: 'Hotel Luxe Management System'
})
