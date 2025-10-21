const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const adminSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  phoneNumber: { type: String, required: true },
  //country: { type: String  },
  address: { type: String },
  role: { type: String, enum: ['admin', 'superadmin'], default: 'admin', required: true },
  authType: { type: String, enum: ['password', 'google'],  default: 'password' },
  googleOAuth: { type: String } // ID Google si connexion via Google
}, { timestamps: true });

// 🔐 Hash du mot de passe avant sauvegarde
adminSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.authType === 'google') return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// 🔍 Comparer le mot de passe fourni avec celui stocké
adminSchema.methods.matchPassword = function (password) {
  return bcrypt.compare(password, this.password);
};

// 🔑 Générer un token JWT
adminSchema.methods.generateToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

module.exports = mongoose.model('Admin', adminSchema);
