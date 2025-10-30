const Settings = require('../../models/admin/settings');
const { successResponse, errorResponse } = require('../../utils/apiReponse');
const validateFields = require('../../utils/validateFiled');

// 🔹 Définir ou mettre à jour un taux
const setSettings = async (req, res) => {
  try {
    if (req.admin.role !== 'superadmin') {
      return errorResponse(res, "Accès refusé. Seul un superadmin peut définir le taux.", [], 403);
    }

    const { rate, description } = req.body;

    const errors = validateFields(['rate', 'description'], req.body);
    if (errors.length > 0) {
      return errorResponse(res, "Champs obligatoires manquants.", errors, 422);
    }

    // Vérifie si un paramètre existe déjà
    let existingSettings = await Settings.findOne();

    if (existingSettings) {
      existingSettings.rate = rate;
      existingSettings.description = description;
      existingSettings.updatedBy = req.admin._id;
      await existingSettings.save();
      return successResponse(res, "Taux mis à jour avec succès.", existingSettings);
    } else {
      const newSettings = new Settings({
        rate,
        description,
        updatedBy: req.admin._id
      });
      await newSettings.save();
      return successResponse(res, "Taux défini avec succès.", newSettings, 201);
    }
  } catch (error) {
    console.error('Erreur setSettings :', error);
    return errorResponse(res, "Erreur serveur", [{ message: error.message }], 500);
  }
};

// 🔹 Récupérer le taux actuel
const getSettings = async (req, res) => {
  try {
    const settings = await Settings.findOne().populate('updatedBy', 'firstName lastName role');

    if (!settings) {
      return errorResponse(res, "Aucun taux défini pour l'instant.", [], 404);
    }

    return successResponse(res, "Taux récupéré avec succès.", settings);
  } catch (error) {
    console.error('Erreur getSettings :', error);
    return errorResponse(res, "Erreur serveur", [{ message: error.message }], 500);
  }
};

module.exports = { setSettings, getSettings };
