const express = require('express');
const { registerPartner, loginPartner, googleAuth, getPartnerProfile } = require('../../controllers/partenaire/authPartnerController');
const { authPartnerMiddleware } = require('../../middlewares/partenaire/authPartnerMiddleware');
const { authAdminMiddleware } = require('../../middlewares/admin/authAdminMiddleware');

const router = express.Router();

router.post('/register', registerPartner);   // 📌 Inscription classique
router.post('/login', loginPartner);         // 🔐 Connexion classique
router.post('/google-auth', googleAuth);  // 🔵 Connexion via Google OAuth
router.get('/profile', authAdminMiddleware, getPartnerProfile); // 👤 Profil utilisateur
 
module.exports = router;
 

