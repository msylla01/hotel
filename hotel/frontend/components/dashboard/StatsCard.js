import { motion } from 'framer-motion'

export default function StatsCard({ 
  title, 
  value, 
  change, 
  changeType = 'positive',
  icon: Icon, 
  color = 'from-blue-500 to-blue-600',
  index = 0 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-2xl shadow-sm overflow-hidden"
    >
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">
              {title}
            </p>
            <p className="text-3xl font-bold text-gray-900">
              {value}
            </p>
            {change && (
              <p className={`text-sm mt-1 ${
                changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {change}
              </p>
            )}
          </div>
          
          {Icon && (
            <div className={`p-3 rounded-xl bg-gradient-to-r ${color}`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
