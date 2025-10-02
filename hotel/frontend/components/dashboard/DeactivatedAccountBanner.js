import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  ExclamationTriangleIcon,
  ArrowPathIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import QuickReactivateButton from './QuickReactivateButton'

export default function DeactivatedAccountBanner({ user, onReactivate }) {
  if (user?.isActive) return null

  const deactivationInfo = user?.preferences?.deactivation
  const canReactivate = deactivationInfo?.type === 'temporary'

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-6"
    >
      <div className="flex items-start space-x-3">
        <ExclamationTriangleIcon className="w-6 h-6 text-orange-600 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-orange-900 font-semibold mb-2">
            🚧 Compte temporairement désactivé
          </h3>
          
          <p className="text-orange-700 text-sm mb-3">
            Votre compte a été désactivé le{' '}
            <strong>
              {deactivationInfo?.date ? new Date(deactivationInfo.date).toLocaleDateString('fr-FR') : 'récemment'}
            </strong>.
            Vous pouvez consulter vos informations mais certaines actions sont limitées.
          </p>

          {deactivationInfo?.reason && (
            <div className="bg-orange-100 rounded-lg p-3 mb-4">
              <p className="text-orange-800 text-sm">
                <strong>Raison de la désactivation :</strong> {deactivationInfo.reason}
              </p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-start space-x-2">
              <InformationCircleIcon className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-blue-700 text-sm">
                <p className="font-medium mb-2">Pendant la désactivation :</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <p className="font-medium text-green-700 mb-1">✅ Autorisé :</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Consulter vos informations</li>
                      <li>• Modifier votre profil</li>
                      <li>• Voir vos réservations passées</li>
                      <li>• Accéder au support</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-red-700 mb-1">❌ Bloqué :</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Nouvelles réservations</li>
                      <li>• Paiements</li>
                      <li>• Emails promotionnels</li>
                      <li>• Notifications automatiques</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {canReactivate ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-green-800 text-sm font-medium mb-2">
                  🎉 Bonne nouvelle ! Vous pouvez réactiver votre compte instantanément.
                </p>
                <p className="text-green-700 text-xs">
                  Choisissez l'option qui vous convient le mieux ci-dessous :
                </p>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <QuickReactivateButton user={user} onSuccess={onReactivate} />
                
                <Link
                  href="/auth/reactivate"
                  className="border border-blue-300 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors flex items-center space-x-2 text-sm"
                >
                  <ArrowPathIcon className="w-4 h-4" />
                  <span>Page de réactivation</span>
                </Link>
              </div>
              
              <p className="text-orange-600 text-xs bg-orange-50 p-2 rounded">
                💡 <strong>Astuce :</strong> Utilisez "Réactiver maintenant" pour une réactivation instantanée sans quitter cette page !
              </p>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">
                ⚠️ Ce compte ne peut pas être réactivé automatiquement. 
                Veuillez contacter notre support pour obtenir de l'aide.
              </p>
              <div className="mt-2">
                <Link
                  href="/contact"
                  className="text-red-600 hover:text-red-700 text-sm font-medium underline"
                >
                  Contacter le support →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
