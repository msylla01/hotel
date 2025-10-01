import Link from 'next/link'
import { useRouter } from 'next/router'
import { 
  HomeIcon,
  CalendarDaysIcon,
  UserIcon,
  CogIcon,
  HeartIcon,
  CreditCardIcon,
  BellIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

export default function Sidebar({ user }) {
  const router = useRouter()

  const navigation = [
    { 
      name: 'Tableau de bord', 
      href: '/dashboard', 
      icon: HomeIcon,
      current: router.pathname === '/dashboard'
    },
    { 
      name: 'Mes réservations', 
      href: '/dashboard/bookings', 
      icon: CalendarDaysIcon,
      current: router.pathname.startsWith('/dashboard/bookings')
    },
    { 
      name: 'Mon profil', 
      href: '/profile', 
      icon: UserIcon,
      current: router.pathname === '/profile'
    },
    { 
      name: 'Favoris', 
      href: '/dashboard/favorites', 
      icon: HeartIcon,
      current: router.pathname === '/dashboard/favorites'
    },
    { 
      name: 'Paiements', 
      href: '/dashboard/payments', 
      icon: CreditCardIcon,
      current: router.pathname === '/dashboard/payments'
    },
    { 
      name: 'Notifications', 
      href: '/dashboard/notifications', 
      icon: BellIcon,
      current: router.pathname === '/dashboard/notifications'
    },
    { 
      name: 'Paramètres', 
      href: '/dashboard/settings', 
      icon: CogIcon,
      current: router.pathname === '/dashboard/settings'
    }
  ]

  return (
    <div className="w-64 bg-white shadow-sm h-screen sticky top-0">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">H</span>
          </div>
          <div>
            <h2 className="font-bold text-gray-900">Hotel Luxe</h2>
            <p className="text-xs text-gray-500">Dashboard</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-900">{user?.firstName}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
        </div>

        <nav className="space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                item.current
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      <div className="absolute bottom-0 w-full p-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">
            Support 24h/24
          </h3>
          <p className="text-xs text-blue-700 mb-3">
            Besoin d'aide ? Notre équipe est là pour vous.
          </p>
          <Link
            href="/contact"
            className="text-blue-600 hover:text-blue-700 text-xs font-medium"
          >
            Nous contacter →
          </Link>
        </div>
      </div>
    </div>
  )
}
