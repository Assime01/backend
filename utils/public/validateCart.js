/**
 * Valide les données envoyées pour le panier
 */
function validateCart(data) {
  const errors = [];

  if (!data.userId) {
    errors.push({ field: 'userId', message: "Le champ 'userId' est requis." });
  }

  if (!Array.isArray(data.products) || data.products.length === 0) {
    errors.push({ field: 'products', message: "Le panier doit contenir au moins un produit." });
  } else {
    data.products.forEach((p, index) => {
      if (!p.productId) {
        errors.push({ field: `products[${index}].productId`, message: "Le productId est requis." });
      }
      if (!p.quantity || p.quantity <= 0) {
        errors.push({ field: `products[${index}].quantity`, message: "La quantité doit être > 0." });
      }
    });
  }

  return errors;
}

module.exports = validateCart;
