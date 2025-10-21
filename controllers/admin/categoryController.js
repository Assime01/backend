const Category = require('../../models/admin/category');
const { successResponse, errorResponse } = require('../../utils/apiReponse');
const validateFields = require('../../utils/validateFiled');

// 📌 Vérifier si l'utilisateur est superadmin
const checkSuperAdmin = (admin) => {
    if (!admin || admin.role !== 'superadmin') {
        throw new Error('Accès refusé : seuls les superadmins peuvent gérer les catégories');
    }
};

// 🔹 Créer une catégorie
const createCategory = async (req, res) => {
    try {
        checkSuperAdmin(req.admin);

        const { name, description } = req.body;

        const errors = validateFields(['name', 'description'], req.body);
        if (errors.length > 0) {
            return errorResponse(res, 'Champs obligatoires manquants.', errors, 422);
        }

        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return errorResponse(res, 'Cette catégorie existe déjà.', [{ field: 'name', message: 'Le nom est déjà utilisé.' }], 400);
        }

        const category = new Category({ name, description, createdBy: req.admin._id });
        await category.save();

        return successResponse(res, 'Catégorie créée avec succès.', category, 201);
    } catch (error) {
        console.error('Erreur création catégorie :', error);
        return errorResponse(res, error.message, [{ message: error.message }], 500);
    }
};

// 🔹 Récupérer toutes les catégories
const getCategories = async (req, res) => {
    try {
        const categories = await Category.find().populate('createdBy', 'firstName lastName email');
        return successResponse(res, 'Liste des catégories récupérée.', categories);
    } catch (error) {
        console.error('Erreur récupération catégories :', error);
        return errorResponse(res, error.message, [{ message: error.message }], 500);
    }
};

// 🔹 Mettre à jour une catégorie
const updateCategory = async (req, res) => {
    try {
        checkSuperAdmin(req.admin);

        const { id } = req.params;
        const { name, description } = req.body;

        const errors = validateFields(['name', 'description'], req.body);
        if (errors.length > 0) {
            return errorResponse(res, 'Champs obligatoires manquants.', errors, 422);
        }

        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            { name, description, updatedBy: req.admin._id },
            { new: true, runValidators: true }
        );

        if (!updatedCategory) {
            return errorResponse(res, 'Catégorie non trouvée.', [], 404);
        }

        return successResponse(res, 'Catégorie mise à jour avec succès.', updatedCategory);
    } catch (error) {
        console.error('Erreur mise à jour catégorie :', error);
        return errorResponse(res, error.message, [{ message: error.message }], 500);
    }
};

// 🔹 Supprimer une catégorie
const deleteCategory = async (req, res) => {
    try {
        checkSuperAdmin(req.admin);

        const { id } = req.params;
        const deletedCategory = await Category.findByIdAndDelete(id);

        if (!deletedCategory) {
            return errorResponse(res, 'Catégorie non trouvée.', [], 404);
        }

        return successResponse(res, 'Catégorie supprimée avec succès.', deletedCategory);
    } catch (error) {
        console.error('Erreur suppression catégorie :', error);
        return errorResponse(res, error.message, [{ message: error.message }], 500);
    }
};

module.exports = { createCategory, getCategories, updateCategory, deleteCategory };
