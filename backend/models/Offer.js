const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  text:            { type: String, required: true },
  textTelugu:      { type: String, default: '' },
  description:     { type: String, default: '' },
  descriptionTelugu:{ type: String, default: '' },
  discount:        { type: String, default: '' },
  template:        { type: String, default: 'dussehra', enum: ['dussehra', 'diwali', 'ugadi', 'sankranti'] },
  emoji:           { type: String, default: '🔥' },
  active:          { type: Boolean, default: true },
  displayOrder:    { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Offer', offerSchema);
