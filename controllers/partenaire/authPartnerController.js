const Partner = require('../../models/partenaire/partner');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { successResponse, errorResponse } = require('../../utils/apiReponse');
const validateFields = require('../../utils/validateFiled');


// 📌 Inscription partenaire
const registerPartner = async (req, res) => {
  try {
    const requiredFields = ['enterpriseName', 'latitude', 'longitude', 'password', 'email', 'phoneNumber', 'address', 'country', 'contrat'];
    const errors = validateFields(requiredFields, req.body);

    const {enterpriseName, latitude, longitude, password, email, phoneNumber, address, country, contrat} = req.body

    if (errors.length > 0) {
    return errorResponse(res, 'Champs obligatoires manquants.', errors, 400);
    }

    const existingPartner = await Partner.findOne({ email: req.body.email });
    if (existingPartner) {
      return errorResponse(
        res,
        'Un compte existe déjà avec cet email.',
        [{ field: 'email', message: 'Cet email est déjà utilisé.' }],
        400
      );
    }
    
     const partner = new Partner({
      enterpriseName, 
      latitude, 
      longitude, 
      password, 
      email, 
      phoneNumber, 
      address, 
      country, 
      contrat,
      authType: "password"
    });
    await partner.save();
  

    return successResponse(res, 'Partenaire inscrit avec succès.', {}, 201);
  } catch (error) {
    console.error('❌ Erreur lors de l’inscription :', error);
    return errorResponse(res, "Erreur interne du serveur.", [], 500);
  }
};

const loginPartner = async (req, res) => {
  try {
    // ✅ Validation des champs obligatoires
    const requiredFields = ['email', 'password'];
    const errors = validateFields(requiredFields, req.body);

    if (errors.length > 0) {
      return errorResponse(res, 'Champs obligatoires manquants.', errors, 400);
    }

    const { email, password } = req.body;

    // ✅ Vérifier si le partenaire existe
    const partner = await Partner.findOne({ email });
    if (!partner) {
      return errorResponse(
        res,
        'Identifiants incorrects.',
        [{ field: 'email', message: 'Aucun compte trouvé avec cet email.' }],
        401
      );
    }

    // ✅ Vérifier le mot de passe
    const isMatch = await partner.matchPassword(password);
    if (!isMatch) {
      return errorResponse(
        res,
        'Identifiants incorrects.',
        [{ field: 'password', message: 'Mot de passe invalide.' }],
        401
      );
    }

    // ✅ Générer le token JWT
    const token = partner.generateToken();

    // ✅ Retourner token + informations du partenaire pour le front
    return successResponse(res, 'Connexion réussie.', {
      token,
      partner: {
        _id: partner._id,
        enterpriseName: partner.enterpriseName,
        email: partner.email,
        phoneNumber: partner.phoneNumber,
        address: partner.address,
        country: partner.country,
        productDescription: partner.productDescription,
      }
    });
  } catch (error) {
    console.error('❌ Erreur lors de la connexion :', error);
    return errorResponse(res, "Erreur interne du serveur.", [], 500);
  }
};


// 🔵 Connexion via Google OAuth
const googleAuth = async (req, res) => {
  try {
    const requiredFields = ['email', 'googleOAuth'];
    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
      return errorResponse(
        res,
        'Champs Google OAuth manquants.',
        missingFields.map(field => ({
          field,
          message: `Le champ "${field}" est requis pour Google OAuth.`
        })),
        400
      );
    }

    const { email, googleOAuth } = req.body;

    let partner = await Partner.findOne({ email });

    if (!partner) {
      partner = new Partner({ email, authType: 'google', googleOAuth });
      await partner.save();
    }

    const token = partner.generateToken();
    return successResponse(res, 'Connexion via Google réussie.', { token });
  } catch (error) {
    console.error('❌ Erreur Google OAuth :', error);
    return errorResponse(res, "Erreur interne du serveur.", [], 500);
  }
};

// 👤 Récupération du profil partenaire
const getPartnerProfile = async (req, res) => {
try {
    // On récupère tous les partenaires (sans mot de passe)
    const partners = await Partner.find().select('-password -googleOAuth');

    return successResponse(res, 'Liste des partenaires récupérée avec succès.', partners);
  } catch (error) {
    console.error('Erreur récupération partenaires :', error);
    return errorResponse(res, 'Erreur lors de la récupération.', [{ message: error.message }], 500);
  }
};


module.exports = { registerPartner, loginPartner, googleAuth, getPartnerProfile };
