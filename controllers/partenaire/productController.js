// controllers/productController.js
const Product = require('../../models/partenaire/product');
const { successResponse, errorResponse } = require('../../utils/apiReponse');
const validateFields = require('../../utils/validateFiled');
const getSettingRate = require('../../utils/admin/settingsUtils')

// 🔹 Ajouter un produit (lié au partenaire connecté)
const createProduct = async (req, res) => {
  try {
    const requiredFields = ['name', 'description', 'price', 'stock', 'categoryId'];
    const errors = validateFields(requiredFields, req.body);

    if (errors.length > 0) {
      return errorResponse(res, 'Champs obligatoires manquants ou vides.', errors, 400);
    }

    const { name, description, price, stock, categoryId } = req.body;

    // Vérifier doublon produit pour le même partenaire
    const existingProduct = await Product.findOne({ name, partnerId: req.partner._id });
    if (existingProduct) {
      return errorResponse(res, 'Vous avez déjà créé un produit avec ce nom.', [], 400);
    }

    // Gestion des images uploadées
    const imagePaths = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    const newProduct = new Product({
      name,
      description,
      price,
      stock,
      categoryId,
      images: imagePaths,
      partnerId: req.partner._id, // ✅ Lien avec le partenaire connecté
    });

    const savedProduct = await newProduct.save();
    return successResponse(res, 'Produit créé avec succès', savedProduct, 201);

  } catch (err) {
    return errorResponse(res, 'Erreur lors de la création du produit', [{ message: err.message }], 500);
  }
};

// 🔹 Obtenir tous les produits (usage admin)
// const getAllProducts = async (req, res) => {
//   try {
//     const products = await Product.find();
//     return successResponse(res, 'Liste des produits récupérée avec succès', products);
//   } catch (err) {
//     return errorResponse(res, 'Erreur lors de la récupération des produits', [{ message: err.message }], 500);
//   }
// };

// 🔹 Obtenir tous les produits (avec prix modifié temporairement)
const getAllProducts = async (req, res) => {
  rate = await getSettingRate();
  try {
    // Récupération de tous les produits
    const products = await Product.find();

    // Exemple : on augmente ou réduit les prix avant de les renvoyer
    const modifiedProducts = products.map(product => {
      // Cloner l’objet (pour ne pas toucher à Mongoose directement)
      const p = product.toObject();
      console.log('-------------1-----------------------');
      console.log(p.price);
      // Exemple : appliquer une réduction de 10 %
      console.log('-------------2-----------------------');
      p.price = p.price + p.price * rate;

      console.log(p.price);

      // Tu peux aussi arrondir :
      // p.price = Math.round(p.price * 0.9 * 100) / 100;

      return p;
    });

    return successResponse(res, 'Liste des produits (prix modifié) récupérée avec succès', modifiedProducts);
  } catch (err) {
    return errorResponse(
      res,
      'Erreur lors de la récupération des produits',
      [{ message: err.message }],
      500
    );
  }
};



// 🔹 Obtenir les produits du partenaire connecté
const getAllProductsOfOnePartner = async (req, res) => {
  try {
    const partnerId = req.partner._id;
    const products = await Product.find({ partnerId });
  
    return successResponse(res, 'Liste de vos produits récupérée avec succès', products);
  } catch (err) {
    return errorResponse(res, 'Erreur lors de la récupération des produits', [{ message: err.message }], 500);
  }
};

// 🔹 Mettre à jour un produit (seulement si propriétaire)
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const product = await Product.findById(id);
    if (!product) return errorResponse(res, 'Produit non trouvé', [], 404);

    if (product.partnerId.toString() !== req.partner._id.toString()) {
      return errorResponse(res, "Vous n'avez pas le droit de modifier ce produit.", [], 403);
    }

    // Ajouter de nouvelles images uploadées
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/${file.filename}`);
      product.images = [...product.images, ...newImages];
    }

    // Supprimer des images existantes
    if (updates.removeImages) {
      const toRemove = Array.isArray(updates.removeImages) ? updates.removeImages : [updates.removeImages];
      product.images = product.images.filter(img => !toRemove.includes(img));
    }

    // Mise à jour des autres champs
    product.name = updates.name || product.name;
    product.description = updates.description || product.description;
    product.price = updates.price || product.price;
    product.stock = updates.stock || product.stock;
    product.categoryId = updates.categoryId || product.categoryId;

    const updatedProduct = await product.save();
    return successResponse(res, 'Produit mis à jour avec succès', updatedProduct);

  } catch (err) {
    return errorResponse(res, 'Erreur lors de la mise à jour du produit', [{ message: err.message }], 500);
  }
};

// 🔹 Supprimer un ou plusieurs produits (seulement propriétaire)
const deleteProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const { productIds } = req.body;

    if (id) {
      const product = await Product.findById(id);
      if (!product) return errorResponse(res, 'Produit non trouvé', [], 404);
      if (product.partnerId.toString() !== req.partner._id.toString()) {
        return errorResponse(res, "Vous n'avez pas le droit de supprimer ce produit.", [], 403);
      }
      await product.remove();
      return successResponse(res, 'Produit supprimé avec succès', product);
    }

    if (productIds && Array.isArray(productIds) && productIds.length > 0) {
      const products = await Product.find({ _id: { $in: productIds }, partnerId: req.partner._id });
      if (products.length === 0) return errorResponse(res, 'Aucun produit trouvé pour la suppression', [], 404);

      const result = await Product.deleteMany({ _id: { $in: products.map(p => p._id) } });
      return successResponse(res, 'Produits supprimés avec succès', { deletedCount: result.deletedCount });
    }

    return errorResponse(res, 'Aucun ID fourni pour la suppression', [], 400);

  } catch (err) {
    return errorResponse(res, 'Erreur lors de la suppression', [{ message: err.message }], 500);
  }
};

// 🔹 Recherche de produits
const searchProduct = async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return errorResponse(res, 'Veuillez fournir un terme de recherche (q)', [], 400);

    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    });

    return successResponse(res, 'Résultats de la recherche', products);
  } catch (err) {
    return errorResponse(res, 'Erreur lors de la recherche', [{ message: err.message }], 500);
  }
};

module.exports = { createProduct, getAllProducts, getAllProductsOfOnePartner, updateProduct, deleteProducts, searchProduct};
