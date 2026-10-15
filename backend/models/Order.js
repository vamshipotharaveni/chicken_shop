const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerName:    { type: String, default: '' },
  customerPhone:   { type: String, default: '' },
  deliveryAddress: { type: String, default: '' },
  coordinates: {
    lat: { type: Number },
    lng: { type: Number }
  },
  items: [{
    productId:  { type: String },
    name:       { type: String },
    nameTelugu: { type: String },
    pricePerKg: { type: Number },
    quantity:   { type: Number },
    unit:       { type: String },
    subtotal:   { type: Number }
  }],
  specifications: [String],
  notes:          { type: String, default: '' },
  totalAmount:    { type: Number, default: 0 },
  status:         { type: String, default: 'pending', enum: ['pending', 'confirmed', 'cancelled'] }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
