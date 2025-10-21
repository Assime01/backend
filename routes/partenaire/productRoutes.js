// productRoutes.js
const express = require('express');
const router = express.Router();
const upload = require('../../config/multer');
const { createProduct, getAllProducts, getAllProductsOfOnePartner, updateProduct, deleteProducts, searchProduct } = require('../../controllers/partenaire/productController');
const { authPartnerMiddleware } = require('../../middlewares/partenaire/authPartnerMiddleware');

router.get('/searchProduct', searchProduct);

// 🔹 Création : accepter plusieurs images
router.post('/', authPartnerMiddleware, upload.array('images', 5), createProduct);

router.get('/', getAllProducts);

//Get products by partner

router.get('/partnerProducts', authPartnerMiddleware, getAllProductsOfOnePartner);


// 🔹 Mise à jour : possibilité d’ajouter/supprimer des images
router.put('/:id', authPartnerMiddleware, upload.array('images', 5), updateProduct);


// 🔹 Suppression simple ou multiple
router.delete('/:id', authPartnerMiddleware, deleteProducts);


module.exports = router;
