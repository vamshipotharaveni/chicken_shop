const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  shopOpen:       { type: Boolean, default: true },
  shopPhone:      { type: String, default: '917993996127' },
  orderPhone:     { type: String, default: '919160726658' },
  shopAddress:    { type: String, default: process.env.SHOP_ADDRESS || 'Near canal, Saidhapur Road, Huzurabad, Karimnagar, Telangana' },
  shopMessage:    { type: String, default: '' },
  shopNameTelugu: { type: String, default: 'జ్యోతి ఫ్రెష్ చికెన్' }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
