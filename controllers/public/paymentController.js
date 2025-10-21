const Payment = require('../../models/public/payment');
const Order = require('../../models/public/order');
const User = require('../../models/public/user');
const generateInvoicePDF = require('../../utils/public/pdfGenerator');
const sendInvoiceEmail = require('../../utils/public/sendEmail');
const { successResponse, errorResponse } = require('../../utils/apiReponse');
const validateFields = require('../../utils/validateFiled');

// 🔁 Créer un paiement
const createPayment = async (req, res) => {
  const requiredFields = ['orderId', 'paymentMethod', 'amount', 'status'];
  const errors = validateFields(requiredFields, req.body);
  if (errors.length > 0) return errorResponse(res, 'Champs requis manquants.', errors, 422);

  try {
    const { orderId, paymentMethod, amount, status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return errorResponse(res, 'Commande non trouvée.', [], 404);

    const payment = new Payment({
      orderId,
      paymentMethod,
      amount,
      status,
    });

    await payment.save();

    // 🔄 Mise à jour de la commande si paiement réussi
    if (status === 'réussi') {
      order.status = 'expédiée';
      await order.save();

      // 🧾 Génération et envoi de la facture
      const user = await User.findById(order.userId);
      const invoicePath = await generateInvoicePDF(payment, order, user);
      await sendInvoiceEmail(
        user.email,
        'Confirmation de paiement',
        `Bonjour ${user.name},\n\nVotre paiement de ${payment.amount} FCFA a été reçu.\nVeuillez trouver votre facture en pièce jointe.`,
        invoicePath
      );
    }

    return successResponse(res, 'Paiement enregistré avec succès.', payment, 201);
  } catch (error) {
    return errorResponse(res, 'Erreur lors de l\'enregistrement du paiement.', [{ message: error.message }], 500);
  }
};

// 👤 Obtenir les paiements d’un utilisateur
const getPaymentsByUser = async (req, res) => {
  const userId = req.params.userId;

  try {
    const payments = await Payment.find()
      .populate({
        path: 'orderId',
        match: { userId },
        select: 'totalPrice status',
      });

    const filteredPayments = payments.filter(p => p.orderId !== null);

    return successResponse(res, "Paiements récupérés avec succès.", filteredPayments);
  } catch (error) {
    return errorResponse(res, 'Erreur lors de la récupération des paiements.', [{ message: error.message }], 500);
  }
};

// 🔍 Paiement lié à une commande
const getPaymentByOrder = async (req, res) => {
  const { orderId } = req.params;

  try {
    const payment = await Payment.findOne({ orderId });

    if (!payment) return errorResponse(res, 'Aucun paiement trouvé pour cette commande.', [], 404);

    return successResponse(res, "Paiement trouvé.", payment);
  } catch (error) {
    return errorResponse(res, 'Erreur lors de la récupération du paiement.', [{ message: error.message }], 500);
  }
};

module.exports = {
  createPayment,
  getPaymentsByUser,
  getPaymentByOrder,
};
