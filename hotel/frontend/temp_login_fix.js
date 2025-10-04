// Correction de la redirection après connexion réussie
// À ajouter/remplacer dans la fonction handleSubmit après une connexion réussie

if (response.ok && data.success) {
  // Sauvegarder les données de connexion
  localStorage.setItem('hotel_token', data.token)
  localStorage.setItem('hotel_user', JSON.stringify(data.user))

  console.log('✅ Connexion réussie [msylla01] - 2025-10-04 02:02:12')
  console.log('👤 Utilisateur:', data.user.email)
  console.log('🎭 Rôle:', data.user.role)

  // LOGIQUE DE REDIRECTION CORRIGÉE
  if (data.user.role === 'ADMIN') {
    console.log('🔀 Redirection ADMIN vers /admin')
    router.push('/admin')
  } else if (data.user.role === 'MANAGER') {
    console.log('🔀 Redirection MANAGER vers /manager')
    router.push('/manager')
  } else {
    console.log('🔀 Redirection CLIENT vers /dashboard')
    router.push('/dashboard')
  }
} else {
  throw new Error(data.message || 'Erreur de connexion')
}
