const PartnerRequest = require('../../models/partenaire/partnerRequest');
const { successResponse, errorResponse } = require('../../utils/apiReponse');
const validateFields = require('../../utils/validateFiled');

// 🔹 Créer une demande d’adhésion
const createRequest = async (req, res) => {
  try {
    const { partnerId, message } = req.body;

    const errors = validateFields(['partnerId', 'message'], req.body);
    if (errors.length > 0) {
      return errorResponse(res, "Champs obligatoires manquants.", errors, 422);
    }

    const request = new PartnerRequest({ partnerId, message });
    await request.save();

    return successResponse(res, "Demande créée avec succès.", request, 201);
  } catch (err) {
    console.error('Erreur création :', err);
    return errorResponse(res, "Erreur serveur.", [{ message: err.message }], 500);
  }
};

// 🔁 Récupérer toutes les demandes + infos partenaire
const getAllRequests = async (req, res) => {
  try {
    const requests = await PartnerRequest.find().populate('partnerId');
    return successResponse(res, "Liste des demandes récupérée avec succès.", requests);
  } catch (err) {
    console.error('Erreur récupération :', err);
    return errorResponse(res, "Erreur récupération des demandes.", [{ message: err.message }], 500);
  }
};

// 🔄 Mettre à jour le statut d’une demande
const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['en_attente', 'approuvee', 'rejetee'];
    if (!validStatuses.includes(status)) {
      return errorResponse(res, "Statut invalide. Statuts possibles : en_attente, approuvee, rejetee.", [], 400);
    }

    const updated = await PartnerRequest.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('partnerId');

    if (!updated) {
      return errorResponse(res, "Demande non trouvée.", [], 404);
    }

    return successResponse(res, "Statut de la demande mis à jour.", updated);
  } catch (err) {
    console.error('Erreur mise à jour statut :', err);
    return errorResponse(res, "Erreur serveur lors de la mise à jour du statut.", [{ message: err.message }], 500);
  }
};

module.exports = { createRequest, getAllRequests, updateStatus };
