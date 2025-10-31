const express = require('express');
const router = express.Router();
const { createRequest, getAllRequests, updateStatus } = require('../../controllers/partenaire/partnerRequestController');
const { authPartnerMiddleware } = require('../../middlewares/partenaire/authPartnerMiddleware');
const { authAdminMiddleware } = require('../../middlewares/admin/authAdminMiddleware')

// Créer une nouvelle demande
router.post('/request', authPartnerMiddleware, createRequest);

// Récupérer toutes les demandes avec infos partenaire
router.get('/requests', getAllRequests);

// Mettre à jour le statut d'une demande
router.put('/request/:id/status', authAdminMiddleware, updateStatus);

//router.put('/request/:id/status', authPartnerMiddleware, updateStatus);

module.exports = router;
