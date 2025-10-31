const User = require('../../models/public/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const { successResponse, errorResponse } = require('../../utils/apiReponse');
const validateFields = require('../../utils/validateFiled');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ✅ Inscription
const registerUser = async (req, res) => {
  const errors = validateFields(['firstName', 'lastName', 'phoneNumber', 'password'], req.body);
  if (errors.length > 0) return errorResponse(res, 'Champs requis manquants.', errors, 422);

  const { firstName, lastName, email, password, currencyPref, phoneNumber, address } = req.body;

  try {
    // Vérifier si l'email ou le numéro est déjà utilisé
    const existingUser = await User.findOne({ $or: [{ email }, { phoneNumber }] });
    if (existingUser) return errorResponse(res, "Email ou numéro déjà utilisé.", [], 400);

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      currencyPref,
      phoneNumber,
      address,
      authType: "password"
    });

    const token = user.generateToken();
    const { password: _, ...userData } = user.toObject();
    return successResponse(res, "Utilisateur créé avec succès.", { user: userData, token }, 201);

  } catch (error) {
    return errorResponse(res, "Erreur lors de l'inscription.", [{ message: error.message }], 500);
  }
};

// ✅ Connexion (email ou téléphone)
const loginUser = async (req, res) => {
  const errors = validateFields(['identifier', 'password'], req.body);
  if (errors.length > 0) return errorResponse(res, 'Champs requis manquants.', errors, 422);

  const { identifier, password } = req.body; // "identifier" = email ou téléphone

  try {
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    const query = isEmail ? { email: identifier } : { phoneNumber: identifier };

    const user = await User.findOne(query);
    if (!user || user.authType !== "password") {
      return errorResponse(res, "Identifiant ou mot de passe incorrect.", [], 401);
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return errorResponse(res, "Identifiant ou mot de passe incorrect.", [], 401);
    }

    const token = user.generateToken();
    const { password: _, ...userData } = user.toObject();

    return successResponse(res, "Connexion réussie.", { user: userData, token }, 200);

  } catch (error) {
    return errorResponse(res, "Erreur lors de la connexion.", [{ message: error.message }], 500);
  }
};

// 🔵 Connexion Google
const googleAuth = async (req, res) => {
  const { tokenId } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const { email, given_name, family_name, sub } = ticket.getPayload();

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        firstName: given_name,
        lastName: family_name,
        email,
        googleOAuth: sub,
        authType: "google"
      });
    }

    const token = user.generateToken();
    const { password: _, ...userData } = user.toObject();
    return successResponse(res, "Connexion réussie avec Google.", { user: userData, token });

  } catch (error) {
    return errorResponse(res, "Erreur d'authentification Google.", [{ message: error.message }], 500);
  }
};

// 👤 Récupérer profil
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return errorResponse(res, "Utilisateur non trouvé.", [], 404);

    return successResponse(res, "Profil utilisateur récupéré.", user);
  } catch (error) {
    return errorResponse(res, "Erreur lors de la récupération du profil.", [{ message: error.message }], 500);
  }
};

const logoutUser = (req, res) => {
  // Supposons que le token soit stocké dans un cookie nommé 'token'
  res.clearCookie('token'); // Facultatif si tu utilises des cookies

  return successResponse(res, "Déconnexion réussie.", {});
};

// ✅ Récupérer tous les utilisateurs (ADMIN uniquement)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    return successResponse(res, "Liste des utilisateurs récupérée avec succès.", users);
  } catch (error) {
    return errorResponse(res, "Erreur lors de la récupération des utilisateurs.", [{ message: error.message }], 500);
  }
};

// ✅ Récupérer un utilisateur spécifique (ADMIN ou profil)
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return errorResponse(res, "Utilisateur non trouvé.", [], 404);

    return successResponse(res, "Utilisateur récupéré avec succès.", user);
  } catch (error) {
    return errorResponse(res, "Erreur lors de la récupération de l'utilisateur.", [{ message: error.message }], 500);
  }
};

// ✅ Mettre à jour un utilisateur (profil ou ADMIN)
const updateUser = async (req, res) => {
  try {
    const allowedFields = ['firstName', 'lastName', 'email', 'phoneNumber', 'address', 'currencyPref', 'password'];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field]) updates[field] = req.body[field];
    }

    // Si le mot de passe est mis à jour, le hacher
    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
    if (!user) return errorResponse(res, "Utilisateur non trouvé.", [], 404);

    return successResponse(res, "Utilisateur mis à jour avec succès.", user);
  } catch (error) {
    return errorResponse(res, "Erreur lors de la mise à jour de l'utilisateur.", [{ message: error.message }], 500);
  }
};

// ✅ Supprimer un utilisateur (ADMIN)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return errorResponse(res, "Utilisateur non trouvé.", [], 404);

    return successResponse(res, "Utilisateur supprimé avec succès.", {});
  } catch (error) {
    return errorResponse(res, "Erreur lors de la suppression de l'utilisateur.", [{ message: error.message }], 500);
  }
};




module.exports = { registerUser, loginUser, logoutUser, googleAuth, getUserProfile, getAllUsers, getUserById, updateUser, deleteUser };
