const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema pour les catégories
const categorySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'Admin', // Référence vers l'admin qui a créé la catégorie
    required: true,
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'Admin', // Référence vers l'admin qui a mis à jour la catégorie
  },
  deletedBy: {
    type: Schema.Types.ObjectId,
    ref: 'Admin', // Référence vers l'admin qui a supprimé la catégorie
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Category', categorySchema);
