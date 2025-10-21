const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['en cours', 'expédiée', 'livrée'],
    default: 'en cours',
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  shippingAddress: {
    type: String,
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ['carte de crédit', 'PayPal', 'Mobile Money'],
    required: true,
  },
  trackingNumber: {
    type: String,
    default: null,
  },
  deliveredAt: {
    type: Date,
    default: null,
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
