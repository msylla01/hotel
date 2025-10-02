const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  console.log('🔍 Vérification base de données [msylla01] - 2025-10-02 00:43:12...');

  try {
    // Vérifier les utilisateurs
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        createdAt: true
      }
    });

    console.log(`👥 ${users.length} utilisateurs trouvés:`);
    users.forEach(user => {
      console.log(`  - ${user.firstName} ${user.lastName} (${user.email}) - Active: ${user.isActive}`);
    });

    // Vérifier les chambres
    const rooms = await prisma.room.findMany({
      select: {
        id: true,
        name: true,
        type: true,
        price: true,
        isActive: true
      }
    });

    console.log(`\n🏨 ${rooms.length} chambres trouvées:`);
    rooms.forEach(room => {
      console.log(`  - ${room.name} (${room.type}) - ${room.price}€ - Active: ${room.isActive}`);
    });

    // Vérifier les réservations
    const bookings = await prisma.booking.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        room: {
          select: {
            name: true,
            type: true,
            price: true
          }
        }
      }
    });

    console.log(`\n📋 ${bookings.length} réservations trouvées:`);
    bookings.forEach(booking => {
      console.log(`  - ${booking.id} - ${booking.user.firstName} ${booking.user.lastName} - ${booking.room.name} - ${booking.status} - ${booking.totalAmount}€`);
      console.log(`    Du ${booking.checkIn.toLocaleDateString()} au ${booking.checkOut.toLocaleDateString()}`);
    });

    // Vérifier les paiements
    const payments = await prisma.payment.findMany({
      include: {
        booking: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            },
            room: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    console.log(`\n💳 ${payments.length} paiements trouvés:`);
    payments.forEach(payment => {
      console.log(`  - ${payment.id} - ${payment.amount}€ - ${payment.status} - ${payment.method}`);
    });

  } catch (error) {
    console.error('❌ Erreur vérification base [msylla01]:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
