import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckCircleIcon,
  ExclamationCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

const Toast = ({ type = 'info', title, message, show, onClose, duration = 5000 }) => {
  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [show, duration, onClose])

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50 border-green-200',
          text: 'text-green-800',
          icon: CheckCircleIcon,
          iconColor: 'text-green-600'
        }
      case 'error':
        return {
          bg: 'bg-red-50 border-red-200',
          text: 'text-red-800',
          icon: XCircleIcon,
          iconColor: 'text-red-600'
        }
      case 'warning':
        return {
          bg: 'bg-yellow-50 border-yellow-200',
          text: 'text-yellow-800',
          icon: ExclamationCircleIcon,
          iconColor: 'text-yellow-600'
        }
      default:
        return {
          bg: 'bg-blue-50 border-blue-200',
          text: 'text-blue-800',
          icon: InformationCircleIcon,
          iconColor: 'text-blue-600'
        }
    }
  }

  const config = getToastConfig()
  const Icon = config.icon

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className={`fixed top-4 right-4 z-50 max-w-sm w-full ${config.bg} border rounded-lg shadow-lg`}
        >
          <div className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Icon className={`h-5 w-5 ${config.iconColor}`} />
              </div>
              <div className="ml-3 flex-1">
                {title && (
                  <p className={`text-sm font-medium ${config.text}`}>
                    {title}
                  </p>
                )}
                {message && (
                  <p className={`text-sm ${title ? 'mt-1' : ''} ${config.text} opacity-90`}>
                    {message}
                  </p>
                )}
              </div>
              <div className="ml-4 flex-shrink-0">
                <button
                  onClick={onClose}
                  className={`inline-flex rounded-md ${config.text} opacity-60 hover:opacity-100 focus:outline-none`}
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Hook pour utiliser les toasts
export const useToast = () => {
  const [toasts, setToasts] = useState([])

  const addToast = (toast) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, ...toast }])
  }

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const showSuccess = (title, message) => addToast({ type: 'success', title, message })
  const showError = (title, message) => addToast({ type: 'error', title, message })
  const showWarning = (title, message) => addToast({ type: 'warning', title, message })
  const showInfo = (title, message) => addToast({ type: 'info', title, message })

  const ToastContainer = () => (
    <>
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          {...toast}
          show={true}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  )

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    ToastContainer
  }
}

export default Toast
