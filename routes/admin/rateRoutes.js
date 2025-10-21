const express = require('express');
const router = express.Router();
const { setRate, getRate } = require('../../controllers/admin/rateController');
const { authAdminMiddleware } = require('../../middlewares/admin/authAdminMiddleware');


// 🔐 Seul un superadmin authentifié peut définir le taux
router.post('/set', authAdminMiddleware, setRate);

// 📖 Accessible à tous les utilisateurs connectés
router.get('/', authAdminMiddleware, getRate);

module.exports = router;
