const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    // CORRECTION : createTransport (pas createTransporter)
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER || 'test@hotel.com',
        pass: process.env.EMAIL_PASS || 'test123'
      }
    });

    console.log('✅ Service email initialisé [msylla01] - 2025-10-01 15:56:14');
    
    // Vérification de connexion (optionnelle en développement)
    this.verifyConnection();
  }

  async verifyConnection() {
    try {
      // await this.transporter.verify();
      console.log('📧 Service email prêt (mode dev) [msylla01]');
    } catch (error) {
      console.log('⚠️ Email en mode simulation [msylla01]:', error.message);
    }
  }

  // Template HTML de base
  getEmailTemplate(title, content) {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${title} - Hotel Luxe</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .footer { background: #1f2937; color: #9ca3af; padding: 20px; text-align: center; font-size: 14px; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; }
        .highlight { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏨 Hotel Luxe</h1>
            <p>Excellence & Confort</p>
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            <p>Hotel Luxe - 123 Avenue de l'Élégance, 75001 Paris</p>
            <p>📞 +33 1 23 45 67 89 • ✉️ contact@hotel-luxe.com</p>
            <p style="margin-top: 15px; font-size: 12px;">
                Développé par msylla01 • 2025-10-01 15:56:14 UTC
            </p>
        </div>
    </div>
</body>
</html>
    `;
  }

  // Email de test (simulation en développement)
  async sendTestEmail(email) {
    try {
      const content = `
        <h2>🧪 Test Email Hotel Luxe</h2>
        <p>Bonjour !</p>
        <p>Ceci est un email de test pour vérifier que le système d'emails automatiques fonctionne.</p>
        
        <div class="highlight">
            <p><strong>✅ Service email opérationnel</strong></p>
            <p><strong>📅 Date :</strong> 2025-10-01 15:56:14 UTC</p>
            <p><strong>👨‍💻 Développeur :</strong> msylla01</p>
            <p><strong>📧 Destinataire :</strong> ${email}</p>
        </div>

        <p>Le système est prêt à envoyer :</p>
        <ul>
            <li>📧 Confirmations de réservation</li>
            <li>⏰ Rappels de séjour</li>
            <li>💳 Confirmations de paiement</li>
        </ul>

        <p><strong>Mode développement :</strong> Email simulé avec succès ! 🎉</p>
      `;

      const html = this.getEmailTemplate('Test Email System', content);

      // EN DÉVELOPPEMENT : Simuler l'envoi
      console.log(`📧 [SIMULATION] Email test pour: ${email} [msylla01]`);
      console.log(`📝 Contenu HTML généré: ${html.length} caractères`);
      
      // Simuler un délai d'envoi
      await new Promise(resolve => setTimeout(resolve, 1000));

      const simulatedMessageId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      return { 
        success: true, 
        messageId: simulatedMessageId,
        mode: 'simulation',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Erreur email test [msylla01]:', error);
      return { success: false, error: error.message };
    }
  }

  // Email de confirmation de réservation (simulation)
  async sendBookingConfirmation(booking, payment, user) {
    try {
      const content = `
        <h2>🎉 Réservation Confirmée et Payée !</h2>
        <p>Bonjour <strong>${user.firstName} ${user.lastName}</strong>,</p>
        <p>Félicitations ! Votre réservation à Hotel Luxe a été confirmée et votre paiement traité.</p>
        
        <div class="highlight">
            <h3>📋 Détails de votre séjour</h3>
            <p><strong>Réservation :</strong> #${booking.id}</p>
            <p><strong>Dates :</strong> ${new Date(booking.checkIn).toLocaleDateString('fr-FR')} - ${new Date(booking.checkOut).toLocaleDateString('fr-FR')}</p>
            <p><strong>Personnes :</strong> ${booking.guests}</p>
            <p><strong>Montant payé :</strong> ${payment.amount}€ via Carte Bancaire</p>
            <p><strong>Transaction :</strong> ${payment.transactionId}</p>
        </div>

        <h3>📍 Informations pratiques</h3>
        <ul>
            <li><strong>Check-in :</strong> À partir de 15h00</li>
            <li><strong>Check-out :</strong> Avant 11h00</li>
            <li><strong>WiFi :</strong> Gratuit dans tout l'hôtel</li>
            <li><strong>Contact :</strong> +33 1 23 45 67 89</li>
        </ul>

        <p>Nous avons hâte de vous accueillir !</p>
        <p><strong>L'équipe Hotel Luxe</strong></p>
      `;

      console.log(`📧 [SIMULATION] Email confirmation pour: ${user.email} [msylla01]`);
      
      const simulatedMessageId = `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      return { 
        success: true, 
        messageId: simulatedMessageId,
        mode: 'simulation'
      };

    } catch (error) {
      console.error('❌ Erreur envoi email confirmation [msylla01]:', error);
      return { success: false, error: error.message };
    }
  }

  // Email de rappel (simulation)
  async sendBookingReminder(booking, user) {
    try {
      console.log(`📧 [SIMULATION] Email rappel pour: ${user.email} [msylla01]`);
      
      const simulatedMessageId = `reminder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      return { 
        success: true, 
        messageId: simulatedMessageId,
        mode: 'simulation'
      };

    } catch (error) {
      console.error('❌ Erreur envoi rappel [msylla01]:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();
