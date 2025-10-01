const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class PaymentService {
  constructor() {
    this.stripeClient = stripe;
    console.log('✅ Service de paiement Stripe initialisé [msylla01]');
  }

  // Créer un Payment Intent Stripe
  async createPaymentIntent(amount, currency = 'eur', metadata = {}) {
    try {
      console.log(`💳 Création Payment Intent [msylla01]: ${amount}€`);
      
      const paymentIntent = await this.stripeClient.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe utilise les centimes
        currency: currency.toLowerCase(),
        payment_method_types: ['card'],
        metadata: {
          ...metadata,
          hotel: 'Hotel Luxe',
          developer: 'msylla01',
          created_at: new Date().toISOString()
        }
      });

      return {
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        status: paymentIntent.status
      };
    } catch (error) {
      console.error('❌ Erreur Stripe Payment Intent [msylla01]:', error);
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  // Confirmer un paiement Stripe
  async confirmPayment(paymentIntentId) {
    try {
      const paymentIntent = await this.stripeClient.paymentIntents.retrieve(paymentIntentId);
      
      console.log(`✅ Paiement confirmé [msylla01]: ${paymentIntentId}, status: ${paymentIntent.status}`);
      
      return {
        success: true,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        paymentMethod: paymentIntent.payment_method,
        charges: paymentIntent.charges.data
      };
    } catch (error) {
      console.error('❌ Erreur confirmation Stripe [msylla01]:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Webhook Stripe pour les événements
  async handleWebhook(payload, signature) {
    try {
      const event = this.stripeClient.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      console.log(`🔔 Stripe Webhook [msylla01]: ${event.type}`);

      switch (event.type) {
        case 'payment_intent.succeeded':
          console.log(`✅ Paiement réussi: ${event.data.object.id}`);
          return { 
            success: true, 
            event: 'payment_succeeded',
            paymentIntentId: event.data.object.id 
          };
          
        case 'payment_intent.payment_failed':
          console.log(`❌ Paiement échoué: ${event.data.object.id}`);
          return { 
            success: true, 
            event: 'payment_failed',
            paymentIntentId: event.data.object.id 
          };
          
        case 'payment_intent.canceled':
          console.log(`🚫 Paiement annulé: ${event.data.object.id}`);
          return { 
            success: true, 
            event: 'payment_canceled',
            paymentIntentId: event.data.object.id 
          };
          
        default:
          console.log(`ℹ️ Événement Stripe non géré: ${event.type}`);
          return { success: true, event: 'unhandled' };
      }
    } catch (error) {
      console.error('❌ Erreur Stripe Webhook [msylla01]:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Obtenir les détails d'un paiement
  async getPaymentDetails(paymentIntentId) {
    try {
      const paymentIntent = await this.stripeClient.paymentIntents.retrieve(paymentIntentId, {
        expand: ['payment_method', 'charges.data.balance_transaction']
      });

      return {
        success: true,
        payment: {
          id: paymentIntent.id,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
          status: paymentIntent.status,
          created: new Date(paymentIntent.created * 1000),
          paymentMethod: paymentIntent.payment_method,
          charges: paymentIntent.charges.data
        }
      };
    } catch (error) {
      console.error('❌ Erreur récupération paiement [msylla01]:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Rembourser un paiement
  async refundPayment(paymentIntentId, amount = null, reason = 'requested_by_customer') {
    try {
      const refund = await this.stripeClient.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined,
        reason
      });

      console.log(`💰 Remboursement créé [msylla01]: ${refund.id}`);

      return {
        success: true,
        refund: {
          id: refund.id,
          amount: refund.amount / 100,
          currency: refund.currency,
          status: refund.status,
          reason: refund.reason
        }
      };
    } catch (error) {
      console.error('❌ Erreur remboursement [msylla01]:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new PaymentService();
