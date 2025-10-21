const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema pour les produits
const productSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
  },
  
  categoryId: {  // Catégorie gérée par un autre backend
    type: String,
    required: true,
  },
   images: [
    { type: String, required: true } // ✅ tableau d’images
  ],
}, {
  timestamps: true,
});

// 🔹 Ajout de l'index full-text
productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);


