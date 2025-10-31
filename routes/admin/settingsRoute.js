const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  rate: {
    type: Number,
    required: true,
  },
  defaultCurrency: {
    type: String,
    default: 'XOF'
  },
  updatedBy: {
    type: String, // email or username of the admin
    default: null
  },

}, { timestamps: true });

module.exports = mongoose.model('Setting', settingSchema);
