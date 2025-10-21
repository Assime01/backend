const jwt = require('jsonwebtoken');
const User = require('../../models/public/user');

const authMiddleware = async (req, res, next) => {
  let token;

  // Vérification de l'en-tête Authorization
  if (!req.headers.authorization) {
   
    return res.status(401).json({ message: "Aucun token fourni." });
  }

  if (req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];

    try {
      // Vérifier le token JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Vérifier si l'utilisateur existe toujours en base de données
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        
        return res.status(401).json({ message: "Utilisateur non trouvé." });
      }

      // Ajouter l'utilisateur à `req.user`
      req.user = user;
      next();
    } catch (error) {
      console.error('❌ Erreur d’authentification JWT :', error.message);
      return res.status(401).json({ message: "Token invalide ou expiré." });
    }
  } else {
    console.log('Headers:', req.headers);
    return res.status(401).json({ message: "Format du token invalide." });
  }
};

module.exports = { authMiddleware };

