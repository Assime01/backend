const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// 📦 Schéma Panier
const cartSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  currencyRate: {
    type: Number,
    default: 1,
  },
  products: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    price: {  // ✅ prix copié du produit au moment de l’ajout
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'XOF',
    }
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Cart', cartSchema);
