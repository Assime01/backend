const express = require('express');
const { registerUser, loginUser, logoutUser, googleAuth, getUserProfile } = require('../../controllers/public/authController');
const { authMiddleware } = require('../../middlewares/public/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);   // 📌 Inscription classique
router.post('/login', loginUser);         // 🔐 Connexion classique
router.post('/logout', logoutUser);       //  Déconnexion
router.post('/google-auth', googleAuth);  // 🔵 Connexion via Google OAuth
router.get('/profile', authMiddleware, getUserProfile); // 👤 Profil utilisateur

module.exports = router;
