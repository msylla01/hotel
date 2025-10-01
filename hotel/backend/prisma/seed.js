const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Démarrage du seed [msylla01] - 2025-10-01 17:11:02...');

  // Nettoyer les données existantes
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.review.deleteMany();
  await prisma.room.deleteMany();
  await prisma.user.deleteMany();

  // Créer les utilisateurs de test avec tous les champs
  const hashedPassword = await bcrypt.hash('password123', 12);
  const adminPassword = await bcrypt.hash('admin123', 12);
  const clientPassword = await bcrypt.hash('client123', 12);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@hotel.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'Hotel',
      phone: '+33123456789',
      address: '123 Admin Street, Paris',
      birthDate: new Date('1990-01-01'),
      preferences: {
        newsletter: true,
        smsNotifications: true,
        roomType: 'SUITE',
        specialRequests: 'Chambre non fumeur'
      },
      role: 'ADMIN',
      emailVerified: true
    }
  });

  const client = await prisma.user.create({
    data: {
      email: 'client@hotel.com',
      password: clientPassword,
      firstName: 'Client',
      lastName: 'Test',
      phone: '+33987654321',
      address: '456 Client Avenue, Lyon',
      birthDate: new Date('1985-05-15'),
      preferences: {
        newsletter: false,
        smsNotifications: false,
        roomType: 'DOUBLE',
        specialRequests: 'Vue sur mer si possible'
      },
      role: 'CLIENT',
      emailVerified: true
    }
  });

  const testUser = await prisma.user.create({
    data: {
      email: 'msylla01@test.com',
      password: hashedPassword,
      firstName: 'MSylla',
      lastName: 'Developer',
      phone: '+33555666777',
      address: '789 Developer Road, Marseille',
      birthDate: new Date('1995-10-01'),
      preferences: {
        newsletter: true,
        smsNotifications: true,
        roomType: 'DELUXE',
        specialRequests: 'Développeur système - accès WiFi prioritaire'
      },
      role: 'CLIENT',
      emailVerified: true
    }
  });

  // Créer des chambres
  const rooms = await Promise.all([
    prisma.room.create({
      data: {
        name: 'Chambre Simple Économique',
        description: 'Chambre confortable pour une personne avec tout le nécessaire.',
        type: 'SINGLE',
        price: 120,
        capacity: 1,
        size: 20,
        images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'],
        amenities: ['WiFi gratuit', 'TV écran plat', 'Climatisation', 'Salle de bain privée']
      }
    }),
    prisma.room.create({
      data: {
        name: 'Chambre Double Classique',
        description: 'Chambre spacieuse pour deux personnes avec balcon.',
        type: 'DOUBLE',
        price: 180,
        capacity: 2,
        size: 30,
        images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800'],
        amenities: ['WiFi gratuit', 'TV écran plat', 'Climatisation', 'Balcon', 'Minibar']
      }
    }),
    prisma.room.create({
      data: {
        name: 'Suite Junior',
        description: 'Suite élégante avec salon séparé et vue panoramique.',
        type: 'SUITE',
        price: 350,
        capacity: 2,
        size: 50,
        images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'],
        amenities: ['WiFi gratuit', 'TV écran plat', 'Climatisation', 'Salon séparé', 'Vue panoramique', 'Service en chambre']
      }
    }),
    prisma.room.create({
      data: {
        name: 'Chambre Familiale',
        description: 'Chambre spacieuse parfaite pour les familles avec enfants.',
        type: 'FAMILY',
        price: 280,
        capacity: 4,
        size: 45,
        images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'],
        amenities: ['WiFi gratuit', 'TV écran plat', 'Climatisation', 'Lits superposés', 'Espace jeux']
      }
    }),
    prisma.room.create({
      data: {
        name: 'Suite Deluxe Présidentielle',
        description: 'Notre suite la plus luxueuse avec jacuzzi et terrasse privée.',
        type: 'DELUXE',
        price: 450,
        capacity: 2,
        size: 80,
        images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800'],
        amenities: ['WiFi gratuit', 'TV écran plat', 'Climatisation', 'Jacuzzi', 'Terrasse privée', 'Butler service']
      }
    })
  ]);

  // Créer quelques réservations de test
  await prisma.booking.create({
    data: {
      userId: client.id,
      roomId: rooms[1].id, // Chambre Double
      checkIn: new Date('2025-12-15'),
      checkOut: new Date('2025-12-18'),
      guests: 2,
      totalAmount: 540, // 3 nuits * 180€
      status: 'CONFIRMED',
      specialRequests: 'Arrivée tardive prévue'
    }
  });

  console.log('✅ Seed terminé [msylla01]:');
  console.log(`👤 Admin: admin@hotel.com / admin123`);
  console.log(`👤 Client: client@hotel.com / client123`);
  console.log(`👤 Developer: msylla01@test.com / password123`);
  console.log(`🏨 ${rooms.length} chambres créées`);
  console.log(`📅 1 réservation de test créée`);
}

main()
  .catch((e) => {
    console.error('❌ Erreur seed [msylla01]:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
