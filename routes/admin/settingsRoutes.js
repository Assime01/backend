const express = require('express');
const router = express.Router();
const { setSettings, getSettings } = require('../../controllers/admin/settingsController');
const { authAdminMiddleware } = require('../../middlewares/admin/authAdminMiddleware');


// 🔐 Seul un superadmin authentifié peut définir le taux
router.put('/set', authAdminMiddleware, setSettings);

// 📖 Accessible à tous les utilisateurs connectés
router.get('/', getSettings);

module.exports = router;
