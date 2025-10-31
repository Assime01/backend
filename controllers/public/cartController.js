const Cart = require('../../models/public/cart');
const Product = require('../../models/partenaire/product');
const { successResponse, errorResponse } = require('../../utils/apiReponse');
const validateFields = require('../../utils/validateFiled');

const getSettingRate = require('../../utils/admin/settingsUtils')
rate = await getSettingRate();

// 🧮 Fonction de calcul du total
const calculateCartTotal = (products) => {
  return products.reduce((total, item) => total + item.price * item.quantity, 0);
};

// ➕ Ajouter au panier
const addToCart = async (req, res) => {
  try {
    const errors = validateFields(['products'], req.body);
    if (errors.length > 0) return errorResponse(res, 'Champs requis manquants.', errors, 422);

    const userId = req.user.id;
    const { products, currency = "XOF" } = req.body;

    // 🔹 Récupération du taux courant
    const rate = await getSettingRate();

    let cart = await Cart.findOne({ userId });
    if (!cart) cart = new Cart({ userId, products: [] });

    for (const p of products) {
      const product = await Product.findById(p.productId);
      if (!product) return errorResponse(res, `Produit ${p.productId} non trouvé`, [], 404);
      if (p.quantity > product.stock) return errorResponse(res, `Quantité supérieure au stock disponible pour ${product.name}`, [], 400);

      const index = cart.products.findIndex(cp => cp.productId.toString() === p.productId.toString());

      // 🔹 Application du taux courant (sans modifier la DB)
      const adjustedPrice = product.price * rate;

      if (index > -1) {
        cart.products[index].quantity += p.quantity;
        cart.products[index].price = adjustedPrice;
      } else {
        cart.products.push({
          productId: p.productId,
          quantity: p.quantity,
          price: adjustedPrice,
          currency: "XOF"
        });
      }
    }

    await cart.save();

    const totalXOF = calculateCartTotal(cart.products);

    return successResponse(res, "Produit ajouté au panier.", { 
      ...cart.toObject(), 
      total: totalXOF,
      appliedRate: rate
    });

  } catch (err) {
    return errorResponse(res, "Erreur serveur lors de l'ajout au panier.", [{ message: err.message }], 500);
  }
};

// 🛒 Voir le panier
const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id }).populate('products.productId');
    if (!cart || cart.products.length === 0) return errorResponse(res, "Panier vide", [], 404);

    // 🔹 Récupération du taux courant
    const rate = await getSettingRate();

    // 🔹 Recalcul dynamique des prix
    const updatedProducts = cart.products.map(p => ({
      ...p.toObject(),
      price: p.productId.price * rate
    }));

    const totalXOF = updatedProducts.reduce((total, p) => total + p.price * p.quantity, 0);

    return successResponse(res, "Panier récupéré avec succès.", { 
      ...cart.toObject(), 
      products: updatedProducts,
      total: totalXOF,
      appliedRate: rate
    });

  } catch (err) {
    return errorResponse(res, "Erreur serveur lors de la récupération du panier.", [{ message: err.message }], 500);
  }
};
// ❌ Supprimer un produit
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id;

    const cart = await Cart.findOne({ userId });
    if (!cart) return errorResponse(res, "Panier non trouvé", [], 404);

    cart.products = cart.products.filter(p => p.productId.toString() !== productId.toString());
    await cart.save();

    const totalXOF = calculateCartTotal(cart.products);

    return successResponse(res, "Produit retiré du panier.", { ...cart.toObject(), total: totalXOF });

  } catch (err) {
    return errorResponse(res, "Erreur serveur lors de la suppression du produit.", [{ message: err.message }], 500);
  }
};

// 🧹 Vider le panier
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart || cart.products.length === 0) return errorResponse(res, "Panier déjà vide.", [], 404);

    cart.products = [];
    await cart.save();

    return successResponse(res, "Panier vidé.", cart);

  } catch (err) {
    return errorResponse(res, "Erreur serveur lors du vidage du panier.", [{ message: err.message }], 500);
  }
};

module.exports = { addToCart, getCart, removeFromCart, clearCart };
