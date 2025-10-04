// pages/manager/debug.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function ManagerDebug() {
  const router = useRouter()
  const [debugInfo, setDebugInfo] = useState(null)
  const [testResults, setTestResults] = useState({})

  useEffect(() => {
    runFullDiagnostic()
  }, [])

  const runFullDiagnostic = async () => {
    const token = localStorage.getItem('hotel_token')
    const userData = localStorage.getItem('hotel_user')
    
    const info = {
      timestamp: new Date().toISOString(),
      localStorage: {
        hasToken: !!token,
        hasUserData: !!userData,
        token: token ? token.substring(0, 30) + '...' : null
      },
      user: null,
      canAccessManager: false
    }
    
    if (userData) {
      try {
        const user = JSON.parse(userData)
        info.user = {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          isActive: user.isActive
        }
        info.canAccessManager = ['MANAGER', 'ADMIN'].includes(user.role) && user.isActive
      } catch (err) {
        info.parseError = err.message
      }
    }
    
    setDebugInfo(info)
    
    if (token) {
      await runBackendTests(token)
    }
  }

  const runBackendTests = async (token) => {
    const results = {}
    
    // Test 1: Health check
    try {
      const response = await fetch('http://localhost:5000/health')
      results.health = {
        success: response.ok,
        status: response.status
      }
    } catch (error) {
      results.health = { success: false, error: error.message }
    }

    // Test 2: Manager dashboard
    try {
      const response = await fetch('http://localhost:5000/api/manager/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      results.managerDashboard = {
        success: response.ok,
        status: response.status,
        message: data.message || 'OK',
        hasData: !!data.data
      }
    } catch (error) {
      results.managerDashboard = { success: false, error: error.message }
    }

    setTestResults(results)
  }

  const createManagerAccount = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'gerant@hotelluxe.com',
          password: 'manager123',
          firstName: 'Jean',
          lastName: 'GERANT',
          role: 'MANAGER'
        })
      })
      
      const data = await response.json()
      alert(data.success ? '✅ Compte créé !' : '❌ ' + data.message)
    } catch (error) {
      alert('❌ Erreur: ' + error.message)
    }
  }

  const testLogin = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'gerant@hotelluxe.com',
          password: 'manager123'
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        localStorage.setItem('hotel_token', data.token)
        localStorage.setItem('hotel_user', JSON.stringify(data.user))
        alert('✅ Connexion réussie ! Rôle: ' + data.user.role)
        router.push('/manager')
      } else {
        alert('❌ Erreur: ' + data.message)
      }
    } catch (error) {
      alert('❌ Erreur: ' + error.message)
    }
  }

  if (!debugInfo) return <div>Chargement...</div>

  return (
    <>
      <Head>
        <title>Debug Manager - Hotel Luxe</title>
      </Head>

      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold mb-6">🔍 Debug Espace Gérant</h1>
          
          {/* Token info */}
          <div className="mb-6 p-4 bg-blue-50 rounded">
            <h3 className="font-bold mb-2">🔑 Authentification</h3>
            <p><strong>Token présent:</strong> {debugInfo.localStorage.hasToken ? '✅ Oui' : '❌ Non'}</p>
            <p><strong>Données utilisateur:</strong> {debugInfo.localStorage.hasUserData ? '✅ Oui' : '❌ Non'}</p>
            {debugInfo.localStorage.token && (
              <p className="text-xs font-mono mt-2">{debugInfo.localStorage.token}</p>
            )}
          </div>

          {/* User info */}
          {debugInfo.user && (
            <div className="mb-6 p-4 bg-green-50 rounded">
              <h3 className="font-bold mb-2">👤 Utilisateur</h3>
              <p><strong>Email:</strong> {debugInfo.user.email}</p>
              <p><strong>Rôle:</strong> <span className={debugInfo.user.role === 'MANAGER' ? 'text-green-600 font-bold' : 'text-red-600'}>{debugInfo.user.role}</span></p>
              <p><strong>Nom:</strong> {debugInfo.user.firstName} {debugInfo.user.lastName}</p>
              <p><strong>Actif:</strong> {debugInfo.user.isActive ? '✅' : '❌'}</p>
              <p><strong>Peut accéder espace gérant:</strong> {debugInfo.canAccessManager ? '✅ Oui' : '❌ Non'}</p>
            </div>
          )}

          {/* Backend tests */}
          <div className="mb-6">
            <h3 className="font-bold mb-2">🧪 Tests Backend</h3>
            {Object.entries(testResults).map(([test, result]) => (
              <div key={test} className={`p-3 mb-2 rounded ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
                <p><strong>{test}:</strong> {result.success ? '✅ OK' : '❌ Erreur'}</p>
                {result.status && <p className="text-xs">Status: {result.status}</p>}
                {result.message && <p className="text-xs">Message: {result.message}</p>}
                {result.error && <p className="text-xs text-red-600">Erreur: {result.error}</p>}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <button
              onClick={createManagerAccount}
              className="bg-green-600 text-white px-4 py-2 rounded mr-4"
            >
              Créer compte gérant
            </button>
            
            <button
              onClick={testLogin}
              className="bg-blue-600 text-white px-4 py-2 rounded mr-4"
            >
              Test connexion gérant
            </button>
            
            <button
              onClick={() => {
                localStorage.clear()
                window.location.reload()
              }}
              className="bg-red-600 text-white px-4 py-2 rounded mr-4"
            >
              Reset localStorage
            </button>

            {debugInfo.canAccessManager && (
              <button
                onClick={() => router.push('/manager')}
                className="bg-purple-600 text-white px-4 py-2 rounded"
              >
                Aller au dashboard
              </button>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-8 p-4 bg-yellow-50 rounded">
            <h3 className="font-bold text-yellow-800">📋 Instructions</h3>
            <ol className="text-sm text-yellow-700 mt-2 space-y-1">
              <li>1. Créer le compte gérant avec le bouton ci-dessus</li>
              <li>2. Tester la connexion avec gerant@hotelluxe.com / manager123</li>
              <li>3. Vérifier que le rôle est MANAGER</li>
              <li>4. Aller au dashboard si tout est vert</li>
            </ol>
          </div>
        </div>
      </div>
    </>
  )
}