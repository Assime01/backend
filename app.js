const express = require('express');
// Administrateur
const adminRoutes = require('./routes/admin/adminRoutes');
const categoryRoutes = require('./routes/admin/categoryRoutes');
const settingsRoute = require('./routes/admin/settingsRoutes');

//Partenaires
const authPartnerRoutes = require('./routes/partenaire/authPartnerRoutes');
const partnerRequestRoutes = require('./routes/partenaire/partnerRequestRoutes');
const productRoutes = require('./routes/partenaire/productRoutes');


//Public
const authUserRoutes = require('./routes/public/authRoutes');
const cartRoutes = require('./routes/public/cartRoutes');
const orderRoutes = require('./routes/public/orderRoutes');
const paymentRoutes = require('./routes/public/paymentRoutes');


const app = express();
const cookieParser = require('cookie-parser');

// Middleware pour parser le corps des requêtes en JSON
app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});


// Utilisation des routes Admin
app.use('/api/admin', adminRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/settings', settingsRoute);



//Utilisation des routes Partenaires
app.use('/api/authPartner', authPartnerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/partnerRequestRoutes', partnerRequestRoutes);


// Utilisation des routes Users
app.use('/api/auth', authUserRoutes);
app.use('/api/cart', cartRoutes);



// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({ message: "Route non trouvée!!!!!" });
});

module.exports = app ;