//partnerRequest.js
const mongoose = require('mongoose');

const PartnerRequestSchema = new mongoose.Schema({
  partnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Partner',
    required: true
  },
  status: {
    type: String,
    enum: ['en_attente', 'approuvee', 'rejetee'],
    default: 'en_attente'
  },
  message: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PartnerRequest', PartnerRequestSchema);
