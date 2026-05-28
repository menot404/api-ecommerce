

// Importer dns package
const dns = require('dns')
dns.setServers(['1.1.1.1', '1.0.0.1']);



const express = require('express');
require('dotenv').config();
const connectDB = require('./config/database');
const logger = require('./middleware/logger');
const { errorHandler, notFound } = require('./middleware/errorHandler')

// Importer les routes
const usersRoute = require('./routes/usersRoute');
const categoriesRoute = require('./routes/categoriesRoutes');
const productsRoute = require('./routes/productsRoute');
const ordersRoute = require('./routes/ordersRoute');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globaux
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);

// Route d'accueil
app.get('/', (req, res) => {
    res.json({
        message: '🛍️ API E-commerce avec MongoDB',
        version: '1.0.0',
        endpoints: {
            users: '/api/users',
            products: '/api/products',
            categories: '/api/categories',
            orders: '/api/orders'
        },
        documentation: {
            users: 'GET /api/users?page=1&limit=10&search=alice&role=admin',
            products: 'GET /api/products?category=xxx&minPrice=100&maxPrice=1000',
            featured: 'GET /api/products/featured',
            orders: 'GET /api/orders?status=pending&userId=xxx'
        }
    });
});

// Monter les routes
app.use('/api/users', usersRoute);
app.use('/api/categories', categoriesRoute);
app.use('/api/products', productsRoute);
app.use('/api/orders', ordersRoute);



// Middlewares d'erreur
app.use(notFound);
app.use(errorHandler);

// Connexion à la base de données avantde demarrer le serveur
connectDB()
    .then(() => {
        app.listen(PORT, () =>
            console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`))
    })
    .catch((error) => {
        console.error('❌ Échec du démarrage du serveur:', error.message);
    })