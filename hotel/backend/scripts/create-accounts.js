const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAccounts() {
  try {
    console.log('👑 Création comptes Admin & Gérant [msylla01] - 2025-10-04 00:17:23');

    // === CRÉATION ADMINISTRATEUR ===
    const existingAdmin = await prisma.user.findFirst({
      where: { 
        OR: [
          { email: 'admin@hotel.com' },
          { role: 'ADMIN' }
        ]
      }
    });

    let admin;
    if (existingAdmin && existingAdmin.email === 'admin@hotel.com') {
      console.log('✅ Compte admin existe déjà:', existingAdmin.email);
      admin = existingAdmin;
    } else {
      const hashedAdminPassword = await bcrypt.hash('admin123', 10);
      
      admin = await prisma.user.create({
        data: {
          email: 'admin@hotel.com',
          password: hashedAdminPassword,
          firstName: 'Super',
          lastName: 'Admin',
          phone: '+221 33 123 45 67',
          address: 'Direction Hotel Luxe, Dakar',
          role: 'ADMIN',
          isActive: true,
          emailVerified: true
        }
      });

      console.log('✅ Compte ADMIN créé avec succès:');
      console.log('   ID:', admin.id);
      console.log('   Email:', admin.email);
      console.log('   Nom:', admin.firstName, admin.lastName);
    }

    // === CRÉATION GÉRANT ===
    const existingManager = await prisma.user.findFirst({
      where: { 
        OR: [
          { email: 'gerant@hotelluxe.com' },
          { role: 'MANAGER' }
        ]
      }
    });

    let manager;
    if (existingManager && existingManager.email === 'gerant@hotelluxe.com') {
      console.log('✅ Compte gérant existe déjà:', existingManager.email);
      manager = existingManager;
    } else {
      const hashedManagerPassword = await bcrypt.hash('manager123', 10);
      
      manager = await prisma.user.create({
        data: {
          email: 'gerant@hotelluxe.com',
          password: hashedManagerPassword,
          firstName: 'Jean',
          lastName: 'Dupont',
          phone: '+221 77 123 45 67',
          address: '123 Avenue des Hôtels, Dakar',
          role: 'MANAGER',
          isActive: true,
          emailVerified: true
        }
      });

      console.log('✅ Compte GÉRANT créé avec succès:');
      console.log('   ID:', manager.id);
      console.log('   Email:', manager.email);
      console.log('   Nom:', manager.firstName, manager.lastName);
    }

    console.log('');
    console.log('🔑 INFORMATIONS DE CONNEXION:');
    console.log('');
    console.log('👑 ADMINISTRATEUR:');
    console.log('   📧 Email: admin@hotel.com');
    console.log('   🔒 Mot de passe: admin123');
    console.log('   🌐 Dashboard: http://localhost:3000/admin');
    console.log('   �� Revenus: http://localhost:3000/admin/revenue');
    console.log('   🏨 Espace Gérant: http://localhost:3000/manager');
    console.log('');
    console.log('👨‍💼 GÉRANT:');
    console.log('   📧 Email: gerant@hotelluxe.com');
    console.log('   🔒 Mot de passe: manager123');
    console.log('   🏨 Dashboard: http://localhost:3000/manager');
    console.log('   ⏰ Horaire: http://localhost:3000/manager/booking/hourly');
    console.log('   🌙 Nuitée: http://localhost:3000/manager/booking/nightly');
    console.log('   📅 Prolongé: http://localhost:3000/manager/booking/extended');
    console.log('   📊 Rapports: http://localhost:3000/manager/reports');
    console.log('');
    console.log('🎯 FONCTIONNALITÉS:');
    console.log('   ✅ Admin: Accès complet + revenus + espace gérant');
    console.log('   ✅ Gérant: Gestion séjours physiques + rapports');
    console.log('   ✅ Authentification sécurisée par rôle');
    console.log('   ✅ Dashboard temps réel');

  } catch (error) {
    console.error('❌ Erreur création comptes [msylla01]:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAccounts();
