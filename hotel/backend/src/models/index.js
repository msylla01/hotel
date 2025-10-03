const { Sequelize, DataTypes } = require('sequelize');

// Configuration de la base de données
const sequelize = new Sequelize(
  process.env.DB_NAME || 'hotel_management',
  process.env.DB_USER || 'postgres', 
  process.env.DB_PASSWORD || 'password',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgresql',
    logging: console.log,
    define: {
      freezeTableName: true,
      timestamps: true
    }
  }
);

// Modèle User
const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  role: {
    type: DataTypes.ENUM('CLIENT', 'ADMIN'),
    defaultValue: 'CLIENT'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'users',
  timestamps: true
});

// Modèle Room
const Room = sequelize.define('Room', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  type: {
    type: DataTypes.ENUM('SINGLE', 'DOUBLE', 'SUITE', 'FAMILY', 'DELUXE'),
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  size: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  amenities: {
    type: DataTypes.JSON,
    allowNull: true
  },
  images: {
    type: DataTypes.JSON,
    allowNull: true
  },
  available: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true
  },
  reviewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'rooms',
  timestamps: true
});

// Modèle Booking
const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  checkIn: {
    type: DataTypes.DATE,
    allowNull: false
  },
  checkOut: {
    type: DataTypes.DATE,
    allowNull: false
  },
  guests: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'),
    defaultValue: 'PENDING'
  },
  paymentStatus: {
    type: DataTypes.ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED'),
    defaultValue: 'PENDING'
  },
  specialRequests: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  cancellationReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  nights: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  canCancel: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'bookings',
  timestamps: true
});

// Relations (SANS Review)
User.hasMany(Booking, { 
  foreignKey: 'userId', 
  as: 'bookings',
  onDelete: 'CASCADE'
});

Booking.belongsTo(User, { 
  foreignKey: 'userId', 
  as: 'user'
});

Room.hasMany(Booking, { 
  foreignKey: 'roomId', 
  as: 'bookings',
  onDelete: 'CASCADE'
});

Booking.belongsTo(Room, { 
  foreignKey: 'roomId', 
  as: 'room'
});

// Synchronisation
async function syncDatabase() {
  try {
    console.log('🔄 Synchronisation base de données [msylla01] - 2025-10-03 12:38:57');
    await sequelize.sync({ alter: true });
    console.log('✅ Base de données synchronisée (SANS Reviews)');
  } catch (error) {
    console.error('❌ Erreur synchronisation [msylla01]:', error);
  }
}

// Appeler la synchronisation
syncDatabase();

module.exports = { 
  sequelize, 
  User, 
  Room, 
  Booking 
};
