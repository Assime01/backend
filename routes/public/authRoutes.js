const express = require('express');
const { registerUser, loginUser, logoutUser, googleAuth, getUserProfile, getAllUsers, getUserById, updateUser, deleteUser } = require('../../controllers/public/authController');
const { authMiddleware } = require('../../middlewares/public/authMiddleware');
const { authAdminMiddleware } = require('../../middlewares/admin/authAdminMiddleware');

const router = express.Router();

router.post('/register', registerUser);   // 📌 Inscription classique
router.post('/login', loginUser);         // 🔐 Connexion classique
router.post('/logout', logoutUser);       //  Déconnexion
router.put('/update', authMiddleware, updateUser); 
router.delete('/deleteUser', authAdminMiddleware,  deleteUser); 
router.post('/google-auth', googleAuth);  // 🔵 Connexion via Google OAuth
router.get('/profile',  authMiddleware,  getUserProfile); // 👤 Profil utilisateur
router.get('/AllUsers', authAdminMiddleware, getAllUsers);

module.exports = router;
