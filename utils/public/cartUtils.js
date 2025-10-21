const axios = require('axios');

/**
 * Récupère le taux de change pour convertir depuis XOF
 */
async function getExchangeRate(to = 'USD') {
  try {
    const response = await axios.get('https://api.exchangerate.host/latest', {
      params: { base: 'XOF', symbols: to }
    });
    return response.data.rates[to];
  } catch (err) {
    throw new Error('Impossible de récupérer le taux de change.');
  }
}

/**
 * Convertit un montant selon un taux
 */
function convertPrice(amount, rate) {
  return amount * rate;
}

/**
 * Calcule le total du panier
 */
function calculateCartTotal(products) {
  return products.reduce((total, p) => total + (p.price * p.quantity), 0);
}

module.exports = { getExchangeRate, convertPrice, calculateCartTotal };
