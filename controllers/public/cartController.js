const Cart = require('../../models/public/cart');
const Product = require('../../models/partenaire/product');
const { successResponse, errorResponse } = require('../../utils/apiReponse');
const validateFields = require('../../utils/validateFiled');

// ➕ Ajouter au panier
const addToCart = async (req, res) => {
  try {
    const errors = validateCart(req.body);
    if (errors.length > 0) return errorResponse(res, 'Champs requis manquants.', errors, 422);

    const userId = req.user.id;
    const { products, currency = "XOF" } = req.body;

    let cart = await Cart.findOne({ userId });
    if (!cart) cart = new Cart({ userId, products: [] });

    for (const p of products) {
      const product = await Product.findById(p.productId);
      if (!product) return errorResponse(res, `Produit ${p.productId} non trouvé`, [], 404);
      if (p.quantity > product.stock) return errorResponse(res, `Quantité supérieure au stock disponible pour ${product.name}`, [], 400);

      const index = cart.products.findIndex(cp => cp.productId.toString() === p.productId.toString());
      if (index > -1) {
        cart.products[index].quantity += p.quantity;
      } else {
        cart.products.push({
          productId: p.productId,
          quantity: p.quantity,
          price: product.price,
          currency: "XOF"
        });
      }
    }

    await cart.save();

    const totalXOF = calculateCartTotal(cart.products);
    let totalConverted = totalXOF;

    if (currency !== "XOF") {
      const rate = await getExchangeRate(currency);
      totalConverted = convertPrice(totalXOF, rate);
    }

    return successResponse(res, "Produit ajouté au panier.", { 
      ...cart.toObject(), 
      total: totalXOF, 
      totalCurrency: currency, 
      totalConverted 
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

    const totalXOF = calculateCartTotal(cart.products);
    let totalConverted = totalXOF;
    const currency = req.query.currency || "XOF";

    if (currency !== "XOF") {
      const rate = await getExchangeRate(currency);
      totalConverted = convertPrice(totalXOF, rate);
    }

    return successResponse(res, "Panier récupéré avec succès.", { 
      ...cart.toObject(), 
      total: totalXOF, 
      totalCurrency: currency, 
      totalConverted 
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
