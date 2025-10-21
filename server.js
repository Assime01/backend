const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

const app = require('./app')

dotenv.config(); // Charger les variables d'environnement


// ✅ Connexion à MongoDB avec logs améliorés
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connecté à MongoDB'))
  .catch(err => console.error('❌ Erreur de connexion à MongoDB :', err));


// Démarrer le serveur
const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port http://localhost:${PORT}`);
});
