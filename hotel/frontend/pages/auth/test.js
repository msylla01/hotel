import { useState } from 'react'
import { useUser } from '../../hooks/useUser'

export default function AuthTest() {
  const { user, login, logout, loading } = useUser()
  const [email, setEmail] = useState('admin@hotel.com')
  const [password, setPassword] = useState('admin123')
  const [message, setMessage] = useState('')

  const handleLogin = async () => {
    setMessage('Connexion en cours...')
    const result = await login(email, password)
    
    if (result.success) {
      setMessage(`✅ Connexion réussie ! Bonjour ${result.user.firstName}`)
    } else {
      setMessage(`❌ Erreur : ${result.error}`)
    }
  }

  const testProfileUpdate = async () => {
    try {
      const token = localStorage.getItem('hotel_token')
      
      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName: 'Test Updated',
          phone: '+33123456789',
          address: 'Test Address Updated'
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setMessage(`✅ Profil mis à jour ! ${JSON.stringify(data.user, null, 2)}`)
      } else {
        setMessage(`❌ Erreur mise à jour : ${data.message}`)
      }
    } catch (error) {
      setMessage(`❌ Erreur réseau : ${error.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold mb-6">Test Authentification - msylla01</h1>
        
        {user ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded p-4">
              <h2 className="font-semibold text-green-800">✅ Connecté</h2>
              <pre className="text-sm text-green-700 mt-2 overflow-auto">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
            
            <div className="space-x-2">
              <button
                onClick={testProfileUpdate}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Tester Mise à Jour Profil
              </button>
              
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Déconnexion
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </div>
        )}
        
        {message && (
          <div className="mt-4 p-4 bg-gray-50 border rounded">
            <pre className="text-sm whitespace-pre-wrap">{message}</pre>
          </div>
        )}
        
        <div className="mt-8 text-xs text-gray-500 text-center">
          Test Auth • msylla01 • 2025-10-01 17:27:03
        </div>
      </div>
    </div>
  )
}
