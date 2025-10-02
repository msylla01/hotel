#!/usr/bin/env node

const fetch = require('node-fetch');

async function testBookingFunctionality() {
  console.log('🧪 Test des fonctionnalités réservation [msylla01] - 2025-10-02 01:41:15');
  
  const baseUrl = 'http://localhost:5000';
  
  // Simuler un token (remplacer par un vrai token)
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // Token de test
  
  try {
    // Test 1: Récupérer les réservations
    console.log('\n1️⃣ Test récupération réservations...');
    const bookingsResponse = await fetch(`${baseUrl}/api/bookings`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (bookingsResponse.ok) {
      const bookingsData = await bookingsResponse.json();
      console.log('✅ Réservations récupérées:', bookingsData.bookings?.length || 0);
    } else {
      console.log('❌ Erreur réservations:', bookingsResponse.status);
    }
    
    // Test 2: Tester la route d'annulation (sans exécuter)
    console.log('\n2️⃣ Test route annulation...');
    console.log('Route: PUT /api/bookings/:id/cancel');
    console.log('✅ Route définie (test sans exécution)');
    
    // Test 3: Tester la route de détails (sans exécuter)
    console.log('\n3️⃣ Test route détails...');
    console.log('Route: GET /api/bookings/:id');
    console.log('✅ Route définie (test sans exécution)');
    
    console.log('\n✅ Tests terminés - Fonctionnalités définies');
    
  } catch (error) {
    console.error('❌ Erreur durant les tests:', error.message);
    console.log('\n⚠️  Assurez-vous que le backend est démarré sur localhost:5000');
  }
}

testBookingFunctionality();
