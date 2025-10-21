const Admin = require('../../models/admin/admin');
const bcrypt = require('bcryptjs');
const { successResponse, errorResponse } = require('../../utils/apiReponse');
const validateFields = require('../../utils/validateFiled');

// 🔹 Créer un administrateur
const createAdmin = async (req, res) => {
  try {
    const existingSuperAdmins = await Admin.countDocuments({ role: 'superadmin' });

    // ✅ Si un superadmin existe, on applique les règles normales
    if (existingSuperAdmins > 0 && req.admin?.role !== 'superadmin') {
      return errorResponse(res, 'Accès refusé : seuls les superadmins peuvent créer des administrateurs.', [], 403);
    }

    const { firstName, lastName, email, password, phoneNumber, role,  address } = req.body;

    const errors = validateFields(['firstName', 'lastName', 'email', 'password', 'phoneNumber', 'role'], req.body);
    if (errors.length > 0) {
      return errorResponse(res, 'Champs obligatoires manquants.', errors, 422);
    }

    // 🔐 Limite à 3 superadmins
    if (role === 'superadmin') {
      const count = await Admin.countDocuments({ role: 'superadmin' });
      if (count >= 3) {
        return errorResponse(res, 'Il ne peut y avoir que trois superadmins.', [], 400);
      }
    }

    // 🔎 Email déjà utilisé ?
    const existing = await Admin.findOne({ email });
    if (existing) {
      return errorResponse(res, 'Cet email est déjà utilisé.', [{ field: 'email', message: 'Cet email existe déjà.' }], 400);
    }

    const admin = new Admin({
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      address,
      role,
      authType: "password"
    });

    await admin.save();

    return successResponse(res, 'Administrateur créé avec succès.', admin, 201);
  } catch (error) {
    console.error('Erreur création admin :', error);
    return errorResponse(res, 'Erreur lors de la création.', [{ message: error.message }], 500);
  }
};

// 🔹 Connexion
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const errors = validateFields(['email', 'password'], req.body);
    if (errors.length > 0) {
      return errorResponse(res, 'Champs obligatoires manquants.', errors, 422);
    }

    const admin = await Admin.findOne({ email });

    if (!admin || admin.authType !== 'password') {
      return errorResponse(res, 'Identifiants invalides.', [], 401);
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return errorResponse(res, 'Mot de passe incorrect.', [], 401);
    }

    const token = admin.generateToken();
    return successResponse(res, 'Connexion réussie.', { token, admin: { ...admin.toObject(), password: undefined } });
  } catch (error) {
    console.error('Erreur connexion admin :', error);
    return errorResponse(res, 'Erreur lors de la connexion.', [{ message: error.message }], 500);
  }
};


// 🔹 Récupération de tous les admins sauf l'admin connecté
// 🔹 Récupération des administrateurs (réservé aux superadmins)
const getAdmins = async (req, res) => {
  try {
    // 🔐 Vérifie que le token appartient à un superadmin
    if (req.admin.role !== 'superadmin') {
      return errorResponse(res, 'Accès refusé : seuls les superadmins peuvent voir la liste des administrateurs.', [], 403);
    }

    // 🔎 Exclure tous les superadmins (y compris le connecté)
    const admins = await Admin.find({
      role: { $ne: 'superadmin' },
      _id: { $ne: req.admin._id }
    }).select('-password');

    return successResponse(res, 'Liste des administrateurs récupérée avec succès.', admins);
  } catch (error) {
    console.error('Erreur récupération admins :', error);
    return errorResponse(res, 'Erreur lors de la récupération.', [{ message: error.message }], 500);
  }
};


// 🔹 Mise à jour
const updateAdmin = async (req, res) => {
  try {
    if (req.admin.role !== 'superadmin') {
      return errorResponse(res, 'Accès refusé.', [], 403);
    }

    const { id } = req.params;
    const updates = { ...req.body };

    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const updatedAdmin = await Admin.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).select('-password');

    if (!updatedAdmin) {
      return errorResponse(res, 'Administrateur non trouvé.', [], 404);
    }

    return successResponse(res, 'Administrateur mis à jour avec succès.', updatedAdmin);
  } catch (error) {
    console.error('Erreur mise à jour admin :', error);
    return errorResponse(res, 'Erreur lors de la mise à jour.', [{ message: error.message }], 500);
  }
};

// 🔹 Suppression
const deleteAdmin = async (req, res) => {
  try {
    if (req.admin.role !== 'superadmin') {
      return errorResponse(res, 'Accès refusé.', [], 403);
    }

    const { id } = req.params;
    const deleted = await Admin.findByIdAndDelete(id);

    if (!deleted) {
      return errorResponse(res, 'Administrateur non trouvé.', [], 404);
    }

    return successResponse(res, 'Administrateur supprimé avec succès.', deleted);
  } catch (error) {
    console.error('Erreur suppression admin :', error);
    return errorResponse(res, 'Erreur lors de la suppression.', [{ message: error.message }], 500);
  }
};

module.exports = { createAdmin, loginAdmin, getAdmins, updateAdmin, deleteAdmin };
