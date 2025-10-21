const jwt = require('jsonwebtoken');
const Partner = require('../../models/partenaire/partner');

// 🔐 Middleware d'authentification des partenaires
const authPartnerMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "Token non fourni ou format invalide." });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Vérifier le token JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Vérifier si le partenaire existe
        const partner = await Partner.findById(decoded.id).select('-password');
        if (!partner) {
            return res.status(404).json({ message: "Partenaire non trouvé." });
        }

        req.partner = partner;
        next();
    } catch (error) {
        console.error('❌ Erreur JWT :', error.message);
        return res.status(401).json({ message: "Token invalide ou expiré." });
    }
};

// 🎯 Middleware pour s'assurer que seul un "partner" peut accéder à certaines routes
const isPartnerMiddleware = (req, res, next) => {
    if (!req.partner || req.partner.role !== 'partner') {
        return res.status(403).json({ message: "Accès refusé : réservé aux partenaires." });
    }
    next();
};

module.exports = { authPartnerMiddleware, isPartnerMiddleware };
