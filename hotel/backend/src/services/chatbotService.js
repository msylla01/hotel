class ChatbotService {
  constructor() {
    this.responses = this.initializeResponses();
    this.context = new Map();
    console.log('🤖 Chatbot IA initialisé [msylla01] - 2025-10-01 15:44:57');
  }

  initializeResponses() {
    return {
      greeting: [
        "Bonjour ! Je suis votre assistant virtuel Hotel Luxe 🏨 Développé par msylla01. Comment puis-je vous aider ?",
        "Salut ! Bienvenue chez Hotel Luxe ! En quoi puis-je vous assister aujourd'hui ? 😊",
        "Hello ! Assistant IA à votre service ! Que souhaitez-vous savoir sur Hotel Luxe ?"
      ],
      
      rooms: [
        "🏨 Nos chambres : Simple (120€), Double (180€), Suite (350€), Familiale (280€), Deluxe (450€). Laquelle vous intéresse ?",
        "Toutes nos chambres incluent WiFi gratuit, TV, climatisation ! Vos dates de séjour ?",
        "Je peux vérifier les disponibilités ! Donnez-moi vos dates et le nombre de personnes 📅"
      ],

      booking: [
        "Pour réserver : connectez-vous ou créez un compte, choisissez vos dates, sélectionnez une chambre, et payez par carte ! Simple non ? 😊",
        "Réservation en 3 étapes : 1️⃣ Dates 2️⃣ Chambre 3️⃣ Paiement. Besoin d'aide ?",
        "Je vous guide ! Quelles sont vos dates d'arrivée et départ ?"
      ],

      payment: [
        "💳 Paiement 100% sécurisé par Stripe ! Cartes Visa, Mastercard, CB acceptées. Test avec 4242 4242 4242 4242",
        "Système de paiement développé par msylla01 ! Totalement sécurisé et crypté 🔒",
        "Paiement instantané ! Une fois validé, vous recevez immédiatement votre confirmation par email ✉️"
      ],

      contact: [
        "📞 +33 1 23 45 67 89 | ✉️ contact@hotel-luxe.com | 📍 123 Avenue de l'Élégance, Paris",
        "Équipe disponible 24h/24 ! Chat, téléphone, email - comme vous voulez ! 😊",
        "Urgence ? Appelez directement ! Questions générales ? Email ou continuez ici avec moi ! 🤖"
      ],

      developer: [
        "👨‍💻 Système développé par msylla01 ! Stack : React/Next.js + Express.js + PostgreSQL + Stripe",
        "Code source : Full-stack moderne, API REST, paiements sécurisés, emails automatiques, et moi, votre IA ! 🚀",
        "Architecture : Frontend React, Backend Express, DB PostgreSQL, Paiements Stripe, Emails Nodemailer, IA Chatbot. Du pro ! ✨"
      ],

      help: [
        "🤖 Je peux aider avec : Réservations, Paiements, Chambres, Services, Contact, Infos développeur !",
        "Commands : 'chambres', 'réserver', 'paiement', 'contact', 'développeur', 'test email'",
        "IA développée par msylla01 ! Je comprends le français naturel. Posez vos questions ! 💬"
      ],

      thanks: [
        "De rien ! Plaisir d'aider ! 😊 Autre chose ?",
        "Avec plaisir ! Hotel Luxe & msylla01 à votre service ! ✨",
        "Toujours ravi d'aider ! Questions supplémentaires ? 🤖"
      ],

      default: [
        "🤔 Je ne comprends pas encore... Essayez : 'chambres', 'réservation', 'paiement', 'contact' !",
        "IA en apprentissage ! Réformulez ou tapez 'aide' pour voir ce que je sais faire 🤖",
        "Pas encore dans ma base ! Mais je connais : chambres, réservations, paiements, contact. Quoi d'autre ?"
      ]
    };
  }

  analyzeIntent(message) {
    const msg = message.toLowerCase().trim();
    
    if (/(bonjour|salut|hello|hey)/i.test(msg)) return 'greeting';
    if (/(chambre|room|prix|tarif|disponib)/i.test(msg)) return 'rooms';
    if (/(réserv|book|dispo)/i.test(msg)) return 'booking';
    if (/(paiement|pay|carte|stripe|4242)/i.test(msg)) return 'payment';
    if (/(contact|téléphone|email|adresse)/i.test(msg)) return 'contact';
    if (/(développeur|msylla01|code|tech)/i.test(msg)) return 'developer';
    if (/(aide|help|commande)/i.test(msg)) return 'help';
    if (/(merci|thanks)/i.test(msg)) return 'thanks';
    
    return 'default';
  }

  async generateResponse(message, userId = null) {
    try {
      const intent = this.analyzeIntent(message);
      const sessionKey = userId || 'anonymous';
      
      console.log(`🤖 Chat [msylla01]: Intent=${intent}, User=${userId || 'anonymous'}`);

      let response = this.getRandomResponse(intent);
      let suggestedActions = [];

      switch (intent) {
        case 'greeting':
          suggestedActions = [
            { text: "Voir les chambres", action: "rooms" },
            { text: "Comment réserver", action: "booking" },
            { text: "Contact", action: "contact" }
          ];
          break;

        case 'rooms':
          suggestedActions = [
            { text: "Réserver maintenant", action: "booking" },
            { text: "Voir les prix", action: "pricing" },
            { text: "Services inclus", action: "services" }
          ];
          break;

        case 'booking':
          suggestedActions = [
            { text: "Créer un compte", action: "register" },
            { text: "Se connecter", action: "login" },
            { text: "Aide paiement", action: "payment" }
          ];
          break;

        case 'payment':
          suggestedActions = [
            { text: "Tester un paiement", action: "test-payment" },
            { text: "Sécurité", action: "security" },
            { text: "Cartes acceptées", action: "cards" }
          ];
          break;

        case 'developer':
          suggestedActions = [
            { text: "Technologies utilisées", action: "tech-stack" },
            { text: "GitHub", action: "github" },
            { text: "Contact développeur", action: "dev-contact" }
          ];
          break;

        default:
          suggestedActions = [
            { text: "Aide", action: "help" },
            { text: "Chambres", action: "rooms" },
            { text: "Contact", action: "contact" }
          ];
      }

      // Ajouter infos personnalisées si utilisateur connecté
      if (userId && intent === 'greeting') {
        response += "\n\nVous êtes connecté ! Je peux vous aider plus spécifiquement. 😊";
      }

      return {
        success: true,
        response,
        intent,
        suggestedActions,
        timestamp: new Date().toISOString(),
        developer: 'msylla01',
        aiVersion: '1.0.0'
      };

    } catch (error) {
      console.error('❌ Erreur chatbot [msylla01]:', error);
      return {
        success: false,
        response: "Oups ! Problème technique. Contactez +33 1 23 45 67 89 📞",
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  getRandomResponse(category) {
    const responses = this.responses[category] || this.responses.default;
    return responses[Math.floor(Math.random() * responses.length)];
  }

  getStats() {
    return {
      activeConversations: this.context.size,
      responsesCategories: Object.keys(this.responses).length,
      version: '1.0.0',
      developer: 'msylla01',
      timestamp: new Date().toISOString(),
      status: 'active'
    };
  }
}

module.exports = new ChatbotService();
