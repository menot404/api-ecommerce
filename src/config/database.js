const mongoose = require('mongoose')
const {DB_NAME, DB_HOST, DB_PROTOCOL, DB_PORT} = process.env;
const MONGO_URI = `${DB_PROTOCOL}://${DB_HOST}:${DB_PORT}/${DB_NAME}`;

const connectDB = async()=>{
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI_CLUSTER || MONGO_URI);
        console.log(` ✅ Connexion MongoDB reussie: ${conn.connection.host}`);
        console.log(`📊 Base de données: ${conn.connection.name}`);
    } catch (error) {
        console.error(`❌ Erreur de connexion MongoDB: ${error.message}`);
        process.exit(1); // Arrêter l'app si connexion échoue
    }
}

// Gestion des événements de connexion
mongoose.connection.on('disconnected', ()=>{
    console.log('⚠️  MongoDB déconnecté');
})

mongoose.connection.on('error', (err)=>{
    console.error(`❌ Erreur MongoDB: ${err.message}`);
})

// Gestion propre de l'arrêt
process.on('SIGINT', async()=>{
    await mongoose.connection.close();
    console.log(`🛑 Connexion MongoDB fermée à cause de l'arrêt de l'application`);
    process.exit(0);
})

module.exports = connectDB;