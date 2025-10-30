// utils/getSetting.js
const Settings = require('../../models/admin/settings')

const getSettingRate = async () => {
  // On suppose qu’il n’existe qu’un seul document Setting
  const setting = await Settings.findOne();
  return setting.rate;
};

module.exports = getSettingRate;
