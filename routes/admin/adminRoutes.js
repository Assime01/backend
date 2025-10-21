const express = require('express');
const { createAdmin, loginAdmin, getAdmins, updateAdmin, deleteAdmin } = require('../../controllers/admin/authAdminController');
const { authAdminMiddleware } = require('../../middlewares/admin/authAdminMiddleware');
const router = express.Router();

router.post('/register', authAdminMiddleware, createAdmin);
router.post('/login', loginAdmin);
router.get('/profile', authAdminMiddleware, getAdmins);
router.put('/:id', authAdminMiddleware, updateAdmin);
router.delete('/:id', authAdminMiddleware, deleteAdmin);

module.exports = router;