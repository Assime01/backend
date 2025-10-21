const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const rateSchema = new Schema({
  rate: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Rate', rateSchema);


