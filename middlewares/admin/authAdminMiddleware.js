const jwt = require('jsonwebtoken');
const Admin = require('../../models/admin/admin');
const { errorResponse } = require('../../utils/apiReponse');
const validateFields = require('../../utils/validateFiled');

// 🔐 Middleware d'authentification des admins (avec bypass pour le premier superadmin)
const authAdminMiddleware = async (req, res, next) => {
  try {
    // Vérifie s'il existe au moins un superadmin
    const superadminCount = await Admin.countDocuments({ role: 'superadmin' });

    // ✅ Aucun superadmin : on laisse passer (permet de créer le premier superadmin)
    if (superadminCount === 0) {
      return next();
    }

    // 🔎 Vérifie la présence du token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Token manquant ou invalide.', [], 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔍 Vérifie que l'admin existe toujours dans la base
    const admin = await Admin.findById(decoded.id).select('-password');
    if (!admin) {
      return errorResponse(res, 'Administrateur introuvable.', [], 401);
    }

    // 🧩 Ajoute l’admin connecté à la requête
    req.admin = admin;

    next();
  } catch (error) {
    console.error('Erreur middleware auth :', error);
    return errorResponse(res, 'Token invalide ou expiré.', [{ message: error.message }], 401);
  }
};

module.exports = { authAdminMiddleware };
