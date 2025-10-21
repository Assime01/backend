const express = require('express');
const router = express.Router();
const { createPayment, getPaymentsByUser, getPaymentByOrder} = require('../../controllers/public/paymentController');

// Créer un paiement
router.post('/', createPayment);

// Paiements d’un utilisateur
router.get('/user/:userId', getPaymentsByUser);

// Paiement d'une commande
router.get('/order/:orderId', getPaymentByOrder);

module.exports = router;
