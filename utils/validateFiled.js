// utils/validateFields.js
// utils/validateFields.js

module.exports = function validateFields(requiredFields, data) {
    const errors = [];
  
    requiredFields.forEach(field => {
      if (!data[field] || data[field].toString().trim() === '') {
        errors.push({
          field, // 🔍 ajoute le nom du champ concerné
          message: `Le champ '${field}' est requis.`
        });
      }
    });
  
    return errors;
  };
  
