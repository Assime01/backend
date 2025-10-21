const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
dotenv.config();

// Récupérer l'URL de MongoDB depuis les variables d'environnement
const url = process.env.MONGODB_URI || 'mongodb://localhost:27017'; // Par défaut, MongoDB utilise le port 27017
const dbName = process.env.DB_NAME || 'bigEcommerceDB'; // Nom de la base de données

let db;

async function connectToMongoDB() {
  const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    console.log('Connecté à MongoDB');
    db = client.db(dbName); // Connexion à la base de données
  } catch (err) {
    console.error('Erreur de connexion MongoDB:', err);
    process.exit(1); // Arrêter l'application en cas d'échec de la connexion
  }
}

function getDB() {
  return db; // Retourner la référence à la base de données
}

module.exports = { connectToMongoDB, getDB };
