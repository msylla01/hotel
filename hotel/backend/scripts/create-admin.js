const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('👑 Création compte administrateur [msylla01] - 2025-10-04 00:22:28');

    // Vérifier si cet admin existe déjà
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admino@hotel.com' }
    });

    if (existingAdmin) {
      console.log('✅ Le compte admin admino@hotel.com existe déjà');
      console.log('🔑 Informations de connexion:');
      console.log('   Email:', existingAdmin.email);
      console.log('   Rôle:', existingAdmin.role);
      console.log('   Nom:', existingAdmin.firstName, existingAdmin.lastName);
      console.log('   Statut:', existingAdmin.isActive ? 'Actif' : 'Inactif');
      
      // Mettre à jour le mot de passe si nécessaire
      const hashedPassword = await bcrypt.hash('admino123', 10);
      await prisma.user.update({
        where: { email: 'admino@hotel.com' },
        data: { 
          password: hashedPassword,
          isActive: true,
          emailVerified: true
        }
      });
      console.log('🔄 Mot de passe mis à jour: admino123');
      return;
    }

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash('admino123', 10);

    // Créer le compte administrateur
    const admin = await prisma.user.create({
      data: {
        email: 'admino@hotel.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'Hotel',
        phone: '+221 33 123 45 67',
        address: 'Direction Hotel Luxe, Dakar',
        role: 'ADMIN',
        isActive: true,
        emailVerified: true
      }
    });

    console.log('✅ Compte administrateur créé avec succès [msylla01]:');
    console.log('   ID:', admin.id);
    console.log('   Email:', admin.email);
    console.log('   Nom:', admin.firstName, admin.lastName);
    console.log('   Rôle:', admin.role);
    console.log('   Téléphone:', admin.phone);
    console.log('');
    console.log('🔑 INFORMATIONS DE CONNEXION ADMIN:');
    console.log('   📧 Email: admino@hotel.com');
    console.log('   🔒 Mot de passe: admino123');
    console.log('');
    console.log('🌐 ACCÈS ADMINISTRATION:');
    console.log('   👑 Dashboard Admin: http://localhost:3000/admin');
    console.log('   🏨 Gestion Chambres: http://localhost:3000/admin/rooms');
    console.log('   📅 Gestion Réservations: http://localhost:3000/admin/bookings');
    console.log('   ⭐ Gestion Avis: http://localhost:3000/admin/reviews');
    console.log('   👥 Gestion Utilisateurs: http://localhost:3000/admin/users');
    console.log('   💰 Revenus & CA: http://localhost:3000/admin/revenue');
    console.log('   👨‍💼 Espace Gérant: http://localhost:3000/manager');
    console.log('');
    console.log('⚡ PRIVILÈGES ADMINISTRATEUR:');
    console.log('   ✅ Accès complet dashboard admin');
    console.log('   ✅ Gestion utilisateurs (voir/modifier/désactiver)');
    console.log('   ✅ CRUD complet chambres');
    console.log('   ✅ Gestion réservations clients');
    console.log('   ✅ Modération avis clients');
    console.log('   ✅ Rapports revenus et statistiques');
    console.log('   ✅ Accès espace gérant (séjours physiques)');

  } catch (error) {
    console.error('❌ Erreur création administrateur [msylla01]:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
