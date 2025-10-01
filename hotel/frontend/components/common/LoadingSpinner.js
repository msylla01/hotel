import { motion } from 'framer-motion'

export default function LoadingSpinner({ 
  size = 'md', 
  color = 'primary', 
  text,
  className = '' 
}) {
  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6', 
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  const colorClasses = {
    primary: 'border-blue-600',
    white: 'border-white',
    gray: 'border-gray-600'
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <motion.div
        className={`${sizeClasses[size]} border-2 border-t-transparent rounded-full ${colorClasses[color]} border-opacity-20`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      {text && (
        <p className="mt-3 text-sm text-gray-600 font-medium">{text}</p>
      )}
    </div>
  )
}
