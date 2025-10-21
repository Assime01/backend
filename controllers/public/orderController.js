const Cart = require('../../models/public/cart');
const Order = require('../../models/public/order');
const OrderItem = require('../../models/public/orderItem');
const Product = require('../../models/partenaire/product');
const { successResponse, errorResponse } = require('../../utils/apiReponse');
const validateFields = require('../../utils/validateFiled');

// ➕ Créer une commande depuis le panier
const createOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;
    const userId = req.user.id;

    const cart = await Cart.findOne({ userId });
    if (!cart || cart.products.length === 0)
      return errorResponse(res, "Panier vide.", [], 400);

    // Calcul du total
    const totalPrice = cart.products.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const order = new Order({
      userId,
      totalPrice,
      shippingAddress,
      paymentMethod,
    });
    await order.save();

    // Créer les OrderItems et mettre à jour le stock
    for (const item of cart.products) {
      const product = await Product.findById(item.productId);
      if (!product)
        return errorResponse(res, `Produit ${item.productId} non trouvé`, [], 404);

      if (product.stock < item.quantity)
        return errorResponse(res, `Stock insuffisant pour ${product.name}`, [], 400);

      product.stock -= item.quantity;
      await product.save();

      await OrderItem.create({
        orderId: order._id,
        productId: item.productId,
        quantity: item.quantity,
        priceAtOrder: item.price,
      });
    }

    // Vider le panier
    cart.products = [];
    await cart.save();

    return successResponse(res, "Commande créée avec succès.", order);
  } catch (err) {
    return errorResponse(res, "Erreur lors de la création de la commande.", [{ message: err.message }], 500);
  }
};

// 🔹 Récupérer commandes de l’utilisateur
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    return successResponse(res, "Commandes récupérées.", orders);
  } catch (err) {
    return errorResponse(res, "Erreur lors de la récupération des commandes.", [{ message: err.message }], 500);
  }
};

// 🔹 Récupérer toutes les commandes (admin)
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    return successResponse(res, "Toutes les commandes récupérées.", orders);
  } catch (err) {
    return errorResponse(res, "Erreur lors de la récupération.", [{ message: err.message }], 500);
  }
};

// 🔹 Détails d’une commande
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return errorResponse(res, "Commande introuvable", [], 404);

    const items = await OrderItem.find({ orderId: order._id }).populate('productId');
    return successResponse(res, "Détails de la commande récupérés.", { order, items });
  } catch (err) {
    return errorResponse(res, "Erreur lors de la récupération.", [{ message: err.message }], 500);
  }
};

// 🔹 Mettre à jour une commande (admin)
const updateOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!order) return errorResponse(res, "Commande introuvable", [], 404);
    return successResponse(res, "Commande mise à jour.", order);
  } catch (err) {
    return errorResponse(res, "Erreur lors de la mise à jour.", [{ message: err.message }], 500);
  }
};

// 🔹 Supprimer une commande (admin)
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return errorResponse(res, "Commande introuvable", [], 404);

    await OrderItem.deleteMany({ orderId: order._id });
    return successResponse(res, "Commande supprimée.");
  } catch (err) {
    return errorResponse(res, "Erreur lors de la suppression.", [{ message: err.message }], 500);
  }
};

module.exports = { createOrder, getMyOrders, getAllOrders, getOrderById, updateOrder, deleteOrder };
