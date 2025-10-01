import Link from 'next/link'
import { 
  CalendarDaysIcon,
  UserGroupIcon,
  CreditCardIcon,
  EyeIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import { formatDate, formatPrice, getStatusLabel, getStatusColor, calculateStayDuration } from '../../utils/formatters'

export default function BookingCard({ 
  booking, 
  onCancel, 
  showActions = true,
  compact = false 
}) {
  const handleCancel = () => {
    if (onCancel) {
      onCancel(booking.id)
    }
  }

  if (compact) {
    return (
      <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">{booking.roomName}</h3>
            <p className="text-sm text-gray-500">#{booking.id}</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
              {getStatusLabel(booking.status)}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Arrivée</span>
            <p className="font-medium">{formatDate(booking.checkIn)}</p>
          </div>
          <div>
            <span className="text-gray-500">Départ</span>
            <p className="font-medium">{formatDate(booking.checkOut)}</p>
          </div>
          <div>
            <span className="text-gray-500">Personnes</span>
            <p className="font-medium">{booking.guests}</p>
          </div>
          <div>
            <span className="text-gray-500">Total</span>
            <p className="font-medium text-blue-600">{formatPrice(booking.totalAmount)}</p>
          </div>
        </div>

        {showActions && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <div className="flex space-x-2">
              <Link
                href={`/dashboard/bookings/${booking.id}`}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Voir détails
              </Link>
              {booking.canCancel && (
                <button
                  onClick={handleCancel}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Annuler
                </button>
              )}
            </div>
            
            <div className="text-xs text-gray-500">
              {formatDate(booking.createdAt)}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start space-x-4">
          {/* Image de la chambre */}
          <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
            <img
              src={booking.roomImage || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'}
              alt={booking.roomName}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Détails */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  {booking.roomName}
                </h3>
                <p className="text-gray-600 text-sm mb-2">
                  Réservation #{booking.id}
                </p>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                    {getStatusLabel(booking.status)}
                  </span>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.paymentStatus)}`}>
                    {getStatusLabel(booking.paymentStatus)}
                  </span>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {formatPrice(booking.totalAmount)}
                </div>
                <div className="text-sm text-gray-500">
                  {calculateStayDuration(booking.checkIn, booking.checkOut)} nuit(s)
                </div>
              </div>
            </div>

            {/* Informations de séjour */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="flex items-center space-x-2">
                <CalendarDaysIcon className="w-4 h-4 text-gray-400" />
                <div>
                  <span className="text-sm text-gray-500">Arrivée</span>
                  <p className="font-medium">{formatDate(booking.checkIn)}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <CalendarDaysIcon className="w-4 h-4 text-gray-400" />
                <div>
                  <span className="text-sm text-gray-500">Départ</span>
                  <p className="font-medium">{formatDate(booking.checkOut)}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <UserGroupIcon className="w-4 h-4 text-gray-400" />
                <div>
                  <span className="text-sm text-gray-500">Personnes</span>
                  <p className="font-medium">{booking.guests}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            {showActions && (
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex space-x-3">
                  <Link
                    href={`/dashboard/bookings/${booking.id}`}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    <EyeIcon className="w-4 h-4" />
                    <span>Voir détails</span>
                  </Link>
                  
                  {booking.paymentStatus === 'PENDING' && (
                    <Link
                      href={`/payment/${booking.id}`}
                      className="flex items-center space-x-2 text-green-600 hover:text-green-700 text-sm font-medium"
                    >
                      <CreditCardIcon className="w-4 h-4" />
                      <span>Payer</span>
                    </Link>
                  )}
                  
                  {booking.canCancel && (
                    <button
                      onClick={handleCancel}
                      className="flex items-center space-x-2 text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      <XCircleIcon className="w-4 h-4" />
                      <span>Annuler</span>
                    </button>
                  )}
                </div>
                
                <div className="text-xs text-gray-500">
                  <div>Réservée le {formatDate(booking.createdAt)}</div>
                  {booking.canCancel && booking.cancellationDeadline && (
                    <div className="text-orange-600 mt-1">
                      Annulation gratuite jusqu'au {formatDate(booking.cancellationDeadline)}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
