const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 [msylla01] Début du seeding - 2025-10-01 13:49:00 UTC...')

  try {
    // Nettoyer TOUTES les données existantes
    console.log('🧹 Nettoyage de la base de données...')
    await prisma.review.deleteMany()
    await prisma.payment.deleteMany()
    await prisma.booking.deleteMany()
    await prisma.room.deleteMany()
    await prisma.user.deleteMany()

    console.log('✅ Base de données nettoyée')

    // Créer l'utilisateur ADMIN avec mot de passe hashé
    console.log('👤 Création de l\'admin...')
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@hotel.com',
        firstName: 'Admin',
        lastName: 'Hotel',
        password: await bcrypt.hash('admin123', 12),
        role: 'ADMIN',
        phone: '+33123456789',
        isActive: true
      }
    })
    console.log('✅ Admin créé:', adminUser.email)

    // Créer l'utilisateur CLIENT avec mot de passe hashé
    console.log('👤 Création du client...')
    const clientUser = await prisma.user.create({
      data: {
        email: 'client@hotel.com',
        firstName: 'Jean',
        lastName: 'Dupont',
        password: await bcrypt.hash('client123', 12),
        role: 'CLIENT',
        phone: '+33987654321',
        isActive: true
      }
    })
    console.log('✅ Client créé:', clientUser.email)

    // Créer des utilisateurs supplémentaires
    const testUsers = []
    for (let i = 1; i <= 3; i++) {
      const user = await prisma.user.create({
        data: {
          email: `test${i}@hotel.com`,
          firstName: `Test${i}`,
          lastName: 'User',
          password: await bcrypt.hash('test123', 12),
          role: 'CLIENT',
          phone: `+3312345678${i}`,
          isActive: true
        }
      })
      testUsers.push(user)
    }
    console.log('✅ Utilisateurs de test créés')

    // Créer des chambres complètes avec toutes les informations
    console.log('🏨 Création des chambres...')
    const rooms = []

    // Chambres SINGLE
    const singleRooms = [
      {
        name: 'Chambre Confort Simple',
        type: 'SINGLE',
        price: 120,
        description: 'Chambre élégante et confortable pour une personne avec vue sur la cour intérieure. Parfaite pour les voyageurs d\'affaires avec bureau et connexion WiFi haut débit.',
        capacity: 1,
        size: 20,
        amenities: ['WiFi gratuit', 'TV écran plat', 'Climatisation', 'Bureau', 'Coffre-fort', 'Minibar', 'Salle de bain privée'],
        images: ['/images/room-single-1.jpg', '/images/room-single-2.jpg'],
        isActive: true
      },
      {
        name: 'Chambre Premium Simple',
        type: 'SINGLE',
        price: 150,
        description: 'Chambre simple haut de gamme avec vue sur le jardin et équipements premium. Idéale pour un séjour d\'affaires de luxe.',
        capacity: 1,
        size: 25,
        amenities: ['WiFi gratuit', 'TV écran plat', 'Climatisation', 'Bureau ergonomique', 'Coffre-fort', 'Minibar', 'Machine à café Nespresso', 'Peignoir'],
        images: ['/images/room-single-premium.jpg'],
        isActive: true
      }
    ]

    // Chambres DOUBLE
    const doubleRooms = [
      {
        name: 'Chambre Double Classique',
        type: 'DOUBLE',
        price: 180,
        description: 'Chambre spacieuse avec lit double king-size et salon. Vue magnifique sur la ville avec balcon privé.',
        capacity: 2,
        size: 30,
        amenities: ['WiFi gratuit', 'TV écran plat', 'Climatisation', 'Salon', 'Coffre-fort', 'Minibar', 'Balcon privé', 'Salle de bain avec baignoire'],
        images: ['/images/room-double-1.jpg', '/images/room-double-2.jpg'],
        isActive: true
      },
      {
        name: 'Chambre Double Supérieure',
        type: 'DOUBLE',
        price: 220,
        description: 'Chambre double élégante avec équipements de luxe et vue panoramique. Service personnalisé inclus.',
        capacity: 2,
        size: 35,
        amenities: ['WiFi gratuit', 'TV écran plat', 'Climatisation', 'Salon', 'Coffre-fort', 'Minibar', 'Balcon panoramique', 'Machine à café', 'Peignoirs', 'Service étage'],
        images: ['/images/room-double-superior.jpg'],
        isActive: true
      }
    ]

    // Suites
    const suites = [
      {
        name: 'Suite Junior',
        type: 'SUITE',
        price: 350,
        description: 'Suite élégante avec salon séparé, chambre spacieuse et salle de bain en marbre. Vue imprenable sur la ville.',
        capacity: 2,
        size: 50,
        amenities: ['WiFi gratuit', 'TV écran plat', 'Climatisation', 'Salon séparé', 'Coffre-fort', 'Minibar', 'Balcon', 'Machine à café', 'Peignoirs', 'Service étage', 'Salle de bain marbre'],
        images: ['/images/suite-junior-1.jpg', '/images/suite-junior-2.jpg'],
        isActive: true
      },
      {
        name: 'Suite Présidentielle',
        type: 'SUITE',
        price: 800,
        description: 'La suite la plus luxueuse de l\'hôtel avec terrasse privée, jacuzzi et services personnalisés 24h/24.',
        capacity: 4,
        size: 120,
        amenities: ['WiFi gratuit', 'TV écran plat', 'Climatisation', 'Salon séparé', 'Coffre-fort', 'Minibar', 'Terrasse privée', 'Machine à café', 'Peignoirs', 'Service étage', 'Butler privé', 'Jacuzzi', 'Champagne d\'accueil'],
        images: ['/images/suite-presidential.jpg'],
        isActive: true
      }
    ]

    // Chambres familiales
    const familyRooms = [
      {
        name: 'Chambre Familiale Standard',
        type: 'FAMILY',
        price: 280,
        description: 'Chambre spacieuse pour toute la famille avec lits superposés et espace de jeu pour les enfants.',
        capacity: 4,
        size: 45,
        amenities: ['WiFi gratuit', 'TV écran plat', 'Climatisation', 'Lits superposés', 'Coffre-fort', 'Minibar', 'Espace jeu enfants', 'Machine à café', 'Salle de bain familiale'],
        images: ['/images/room-family-1.jpg', '/images/room-family-2.jpg'],
        isActive: true
      },
      {
        name: 'Chambre Familiale Premium',
        type: 'FAMILY',
        price: 350,
        description: 'Chambre familiale haut de gamme avec deux chambres séparées et salon commun. Parfaite pour les familles exigeantes.',
        capacity: 6,
        size: 60,
        amenities: ['WiFi gratuit', 'TV écran plat', 'Climatisation', 'Chambres séparées', 'Salon commun', 'Coffre-fort', 'Minibar', 'Espace jeu', 'Machine à café', 'Balcon'],
        images: ['/images/room-family-premium.jpg'],
        isActive: true
      }
    ]

    // Chambres deluxe
    const deluxeRooms = [
      {
        name: 'Chambre Deluxe avec Vue Mer',
        type: 'DELUXE',
        price: 450,
        description: 'Chambre de luxe avec vue imprenable sur la mer et équipements haut de gamme. Expérience inoubliable garantie.',
        capacity: 2,
        size: 40,
        amenities: ['WiFi gratuit', 'TV écran plat', 'Climatisation', 'Vue mer panoramique', 'Coffre-fort', 'Minibar', 'Balcon privé', 'Machine à café', 'Peignoirs', 'Service étage', 'Champagne d\'accueil', 'Surclassement spa'],
        images: ['/images/room-deluxe-sea.jpg'],
        isActive: true
      }
    ]

    // Créer toutes les chambres
    const allRoomData = [...singleRooms, ...doubleRooms, ...suites, ...familyRooms, ...deluxeRooms]
    
    for (const roomData of allRoomData) {
      const room = await prisma.room.create({ data: roomData })
      rooms.push(room)
      console.log(`✅ Chambre créée: ${room.name} - ${room.price}€`)
    }

    console.log(`🏨 ${rooms.length} chambres créées avec succès`)

    // Créer quelques réservations de test
    console.log('📅 Création de réservations de test...')
    
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const nextWeek = new Date(now)
    nextWeek.setDate(nextWeek.getDate() + 7)

    // Réservation pour le client
    const booking1 = await prisma.booking.create({
      data: {
        userId: clientUser.id,
        roomId: rooms[0].id, // Chambre Confort Simple
        checkIn: tomorrow,
        checkOut: new Date(tomorrow.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 jours
        guests: 1,
        totalAmount: 360, // 120 * 3
        status: 'CONFIRMED',
        notes: 'Réservation de test pour démonstration'
      }
    })

    // Réservation pour un utilisateur test
    const booking2 = await prisma.booking.create({
      data: {
        userId: testUsers[0].id,
        roomId: rooms[4].id, // Suite Junior
        checkIn: nextWeek,
        checkOut: new Date(nextWeek.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 jours
        guests: 2,
        totalAmount: 700, // 350 * 2
        status: 'PENDING',
        notes: 'Suite pour anniversaire de mariage'
      }
    })

    console.log('✅ Réservations de test créées')

    // Créer des avis de test
    console.log('⭐ Création d\'avis...')
    
    const reviews = [
      {
        userId: testUsers[1].id,
        roomId: rooms[0].id,
        rating: 5,
        comment: 'Séjour parfait ! Chambre très propre et confortable. Le personnel était très accueillant. Je recommande vivement cet hôtel.',
        isApproved: true
      },
      {
        userId: testUsers[2].id,
        roomId: rooms[2].id,
        rating: 4,
        comment: 'Très bon hôtel avec un excellent service. La vue depuis la chambre était magnifique. Seul petit bémol : le WiFi était un peu lent.',
        isApproved: true
      },
      {
        userId: clientUser.id,
        roomId: rooms[4].id,
        rating: 5,
        comment: 'Suite exceptionnelle ! Le service en chambre était irréprochable. Une expérience de luxe inoubliable.',
        isApproved: true
      }
    ]

    for (const reviewData of reviews) {
      await prisma.review.create({ data: reviewData })
    }

    console.log('✅ Avis créés')

    // Statistiques finales
    const stats = {
      users: await prisma.user.count(),
      rooms: await prisma.room.count(),
      bookings: await prisma.booking.count(),
      reviews: await prisma.review.count()
    }

    console.log('\n🎉 ===== SEEDING TERMINÉ [msylla01] =====')
    console.log(`📊 Statistiques:`)
    console.log(`   👥 Utilisateurs: ${stats.users}`)
    console.log(`   🏨 Chambres: ${stats.rooms}`)
    console.log(`   📅 Réservations: ${stats.bookings}`)
    console.log(`   ⭐ Avis: ${stats.reviews}`)
    console.log('\n🔑 COMPTES DE TEST:')
    console.log('   🔴 Admin: admin@hotel.com / admin123')
    console.log('   🔵 Client: client@hotel.com / client123')
    console.log('   🟡 Test1: test1@hotel.com / test123')
    console.log('   🟡 Test2: test2@hotel.com / test123')
    console.log('   🟡 Test3: test3@hotel.com / test123')
    console.log('=====================================\n')

  } catch (error) {
    console.error('❌ Erreur lors du seeding [msylla01]:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
