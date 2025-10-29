const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const partnerSchema = new mongoose.Schema({
    enterpriseName: { 
        type: String,
        required: true, 
        trim: true
     },
    latitude: { 
        type: Number, 
        required: true 
    },
    longitude: { 
        type: Number, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        trim: true },
    password: { 
        type: String, 
        required: function() { return this.authType === 'password'; } 
    },
    phoneNumber: { 
        type: String, 
        required: true 
    },
    address: { 
        type: String, 
        required: true 
    },
    country: { 
        type: String, 
        required: true 
    },
    productDescription: { 
        type: String 
    },
    contrat: { 
        type: Boolean, 
        default: false, 
        required: true 
    },
    authType: { type: String, enum: ['password', 'google'],  default: 'google', required: true },
    googleOAuth: { type: String, required: function() { return this.authType === 'google'; } }
}, { timestamps: true });

// 🔐 Hash du mot de passe avant sauvegarde
partnerSchema.pre('save', async function (next) {
    if (!this.isModified('password') || this.authType === 'google') return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// 🔍 Comparer le mot de passe
partnerSchema.methods.matchPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// 🔑 Générer un token JWT
partnerSchema.methods.generateToken = function () {
    return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

module.exports = mongoose.model('Partner', partnerSchema);
