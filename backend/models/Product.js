const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name:              { type: String, required: true },
  nameTelugu:        { type: String, default: '' },
  category:          { type: String, default: 'whole' },
  pricePerKg:        { type: Number, required: true, min: 0 },
  unit:              { type: String, default: 'kg', enum: ['kg', 'piece'] },
  image:             { type: String, default: '' },
  imagePublicId:     { type: String, default: '' },
  inStock:           { type: Boolean, default: true },
  description:       { type: String, default: '' },
  descriptionTelugu: { type: String, default: '' },
  displayOrder:      { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
