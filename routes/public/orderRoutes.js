const express = require('express');
const router = express.Router();
const {createOrder, getAllOrders, getMyOrders, getOrderById, updateOrder, deleteOrder,} = require('../../controllers/public/orderController');

const authMiddleware = require('../../middlewares/public/authMiddleware');



// Créer une commande
router.post('/', createOrder);

// Mes commandes
router.get('/my-orders', getMyOrders);

// Toutes les commandes (admin)
router.get('/', getAllOrders);

// Détails d'une commande
router.get('/:id', getOrderById);

// Modifier une commande
router.put('/:id', updateOrder);

// Supprimer une commande
router.delete('/:id', deleteOrder);

module.exports = router;
