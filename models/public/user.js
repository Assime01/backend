const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String },
  password: { type: String },
  currencyPref: { type: String },
  phoneNumber: { type: String, required: true, unique: true  },
  address: { type: String },
  role: { type: String, enum: ['user', 'partner', 'admin', 'superadmin'], default: 'user' },
  authType: { type: String, enum: ['password', 'google'], required: true },
  googleOAuth: { type: String }, // ID Google si connexion via Google
}, { timestamps: true });

// 🔐 Hash du mot de passe avant sauvegarde (si mode password)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.authType === 'google') return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// 🔍 Comparer le mot de passe
userSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// 🔑 Générer un token JWT
userSchema.methods.generateToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

module.exports = mongoose.model('User', userSchema);


