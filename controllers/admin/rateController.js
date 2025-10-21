const Rate = require('../../models/admin/admin');
const { successResponse, errorResponse } = require('../../utils/apiReponse');
const validateFields = require('../../utils/validateFiled');

// 🔹 Définir ou mettre à jour un taux
const setRate = async (req, res) => {
  try {
    if (req.admin.role !== 'superadmin') {
      return errorResponse(res, "Accès refusé. Seul un superadmin peut définir le taux.", [], 403);
    }

    const { rate, description } = req.body;

    const errors = validateFields(['rate', 'description'], req.body);
    if (errors.length > 0) {
      return errorResponse(res, "Champs obligatoires manquants.", errors, 422);
    }

    let existingRate = await Rate.findOne();

    if (existingRate) {
      existingRate.rate = rate;
      existingRate.description = description;
      existingRate.updatedBy = req.admin._id;
      await existingRate.save();
      return successResponse(res, "Taux mis à jour avec succès.", existingRate);
    } else {
      const newRate = new Rate({
        rate,
        description,
        updatedBy: req.admin._id
      });
      await newRate.save();
      return successResponse(res, "Taux défini avec succès.", newRate, 201);
    }
  } catch (error) {
    console.error('Erreur setRate :', error);
    return errorResponse(res, "Erreur serveur", [{ message: error.message }], 500);
  }
};

// 🔹 Récupérer le taux actuel
const getRate = async (req, res) => {
  try {
    const rate = await Rate.findOne().populate('updatedBy', 'firstName lastName role');

    if (!rate) {
      return errorResponse(res, "Aucun taux défini pour l'instant.", [], 404);
    }

    return successResponse(res, "Taux récupéré avec succès.", rate);
  } catch (error) {
    console.error('Erreur getRate :', error);
    return errorResponse(res, "Erreur serveur", [{ message: error.message }], 500);
  }
};

module.exports = { setRate, getRate };
