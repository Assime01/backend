// routes/categoryRoutes.js
const express = require('express');
const { createCategory, getCategories, updateCategory, deleteCategory } = require('../../controllers/admin/categoryController');
const { authAdminMiddleware } = require('../../middlewares/admin/authAdminMiddleware');

const router = express.Router();

router.post('/', authAdminMiddleware, createCategory);
router.get('/', getCategories);
router.put('/:id', authAdminMiddleware, updateCategory);
router.delete('/:id', authAdminMiddleware, deleteCategory);

module.exports = router;