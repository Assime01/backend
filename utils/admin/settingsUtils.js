// utils/getSetting.js
const Settings = require('../../models/admin/settings')

const getSetting = async () => {
  // On suppose qu’il n’existe qu’un seul document Setting
  const setting = await Settings.findOne();
  return setting;
};

module.exports = getSetting;
