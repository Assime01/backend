const express = require('express');
const { addToCart, getCart, removeFromCart, clearCart } = require('../../controllers/public/cartController');
const { authMiddleware } = require('../../middlewares/public/authMiddleware');

const router = express.Router();

router.post('/add', authMiddleware, addToCart);
router.get('/', authMiddleware, getCart);
router.delete('/remove', authMiddleware, removeFromCart);
router.delete('/clear', authMiddleware, clearCart);

module.exports = router
