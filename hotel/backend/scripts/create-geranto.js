const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createGeranto() {
  try {
    console.log('👨‍💼 Création compte GERANTO [msylla01] - 2025-10-04 01:37:37');
    console.log('📧 Email: geranto@hotelluxe.com');
    console.log('🔒 Mot de passe: manager123');

    // Vérifier si le compte existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: 'geranto@hotelluxe.com' }
    });

    if (existingUser) {
      console.log('🔄 Compte existant trouvé, mise à jour...');
      
      // Mettre à jour le compte existant
      const updatedUser = await prisma.user.update({
        where: { email: 'geranto@hotelluxe.com' },
        data: {
          role: 'MANAGER',
          isActive: true,
          emailVerified: true,
          firstName: 'Antonio',
          lastName: 'GERANTO',
          phone: '+221 77 987 65 43'
        }
      });

      console.log('✅ Compte GERANTO mis à jour avec succès !');
      console.log('   ID:', updatedUser.id);
      console.log('   Email:', updatedUser.email);
      console.log('   Rôle:', updatedUser.role);
      console.log('   Actif:', updatedUser.isActive);
      
      return updatedUser;
    }

    // Hash du mot de passe
    console.log('🔐 Hachage du mot de passe...');
    const hashedPassword = await bcrypt.hash('manager123', 12);

    // Créer le nouveau compte GERANTO
    console.log('👨‍💼 Création nouveau compte GERANTO...');
    const geranto = await prisma.user.create({
      data: {
        email: 'geranto@hotelluxe.com',
        password: hashedPassword,
        firstName: 'Antonio',
        lastName: 'GERANTO',
        phone: '+221 77 987 65 43',
        address: '456 Boulevard de l\'Hôtellerie, Dakar',
        role: 'MANAGER',
        isActive: true,
        emailVerified: true,
        preferences: {
          language: 'fr',
          timezone: 'Africa/Dakar',
          notifications: {
            email: true,
            booking: true,
            revenue: true
          }
        }
      }
    });

    console.log('✅ Compte GERANTO créé avec succès !');
    console.log('');
    console.log('📋 DÉTAILS DU COMPTE :');
    console.log('   ID:', geranto.id);
    console.log('   Email:', geranto.email);
    console.log('   Nom complet:', geranto.firstName, geranto.lastName);
    console.log('   Téléphone:', geranto.phone);
    console.log('   Rôle:', geranto.role);
    console.log('   Actif:', geranto.isActive);
    console.log('   Email vérifié:', geranto.emailVerified);
    console.log('');
    console.log('🔑 IDENTIFIANTS DE CONNEXION :');
    console.log('   📧 Email : geranto@hotelluxe.com');
    console.log('   🔒 Mot de passe : manager123');
    console.log('   👤 Rôle : MANAGER');
    console.log('');
    console.log('�� PAGES D\'ACCÈS :');
    console.log('   🔐 Connexion : http://localhost:3000/auth/login');
    console.log('   🏨 Dashboard : http://localhost:3000/manager');
    console.log('   🧪 Test API : http://localhost:5000/api/manager/test');
    console.log('   🔍 Debug : http://localhost:3000/manager/debug');

    // Test de vérification du compte créé
    console.log('');
    console.log('🧪 Vérification du compte créé...');
    const verification = await prisma.user.findUnique({
      where: { email: 'geranto@hotelluxe.com' },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        firstName: true,
        lastName: true
      }
    });

    if (verification && verification.role === 'MANAGER' && verification.isActive) {
      console.log('✅ VÉRIFICATION RÉUSSIE - Compte GERANTO opérationnel');
      console.log('   ✓ Email:', verification.email);
      console.log('   ✓ Rôle:', verification.role);
      console.log('   ✓ Actif:', verification.isActive);
      console.log('   ✓ Nom:', verification.firstName, verification.lastName);
    } else {
      console.log('❌ ERREUR VÉRIFICATION - Problème avec le compte');
      console.log('Compte trouvé:', !!verification);
      console.log('Détails:', verification);
    }

    return geranto;

  } catch (error) {
    console.error('❌ ERREUR création GERANTO [msylla01]:', error);
    console.error('Détails:', error.message);
    
    if (error.code === 'P2002') {
      console.log('');
      console.log('⚠️ Email déjà utilisé par un autre compte.');
      console.log('Solutions:');
      console.log('1. Utiliser un autre email');
      console.log('2. Supprimer l\'ancien compte d\'abord');
      console.log('3. Mettre à jour l\'ancien compte');
    }
    
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  createGeranto()
    .then(() => {
      console.log('');
      console.log('🎉 CRÉATION GERANTO TERMINÉE AVEC SUCCÈS !');
      console.log('');
      console.log('📋 PROCHAINES ÉTAPES :');
      console.log('1. Aller sur http://localhost:3000/auth/login');
      console.log('2. Se connecter avec geranto@hotelluxe.com / manager123');
      console.log('3. Accéder au dashboard gérant: http://localhost:3000/manager');
      console.log('');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 ÉCHEC CRÉATION GERANTO:', error.message);
      process.exit(1);
    });
}

module.exports = createGeranto;
