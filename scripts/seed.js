// scripts/seed.js
require('dotenv').config();
const connectDB = require('../config/database');

const Order = require('../models/Order');

const seedDatabase = async () => {
  try {
    await connectDB();
    
    console.log('🛒 Création des commandes...');
    const orders = await Order.create([
      {
        user: users[2]._id,
        items: [
          {
            product: products[1]._id,
            name: products[1].name,
            quantity: 1,
            price: products[1].price
          },
          {
            product: products[2]._id,
            name: products[2].name,
            quantity: 2,
            price: products[2].price
          }
        ],
        totalAmount: 1699.97,
        status: 'delivered',
        shippingAddress: {
          street: '456 Avenue des Champs',
          city: 'Lyon',
          country: 'France',
          zipCode: '69001'
        },
        paymentMethod: 'card',
        paymentStatus: 'paid',
        deliveredAt: new Date()
      },
      {
        user: users[2]._id,
        items: [
          {
            product: products[0]._id,
            name: products[0].name,
            quantity: 1,
            price: products[0].price
          }
        ],
        totalAmount: 2499.99,
        status: 'pending',
        shippingAddress: {
          street: '456 Avenue des Champs',
          city: 'Lyon',
          country: 'France',
          zipCode: '69001'
        },
        paymentMethod: 'card',
        paymentStatus: 'pending'
      }
    ]);
    console.log(`✅ ${orders.length} commandes créées`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
};

seedDatabase();