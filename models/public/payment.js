const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema pour les paiements
const paymentSchema = new Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ['carte de crédit', 'PayPal'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  paymentDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['réussi', 'échec'],
    required: true,
  },
});

module.exports = mongoose.model('Payment', paymentSchema);
