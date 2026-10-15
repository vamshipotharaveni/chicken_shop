const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const verifyAdmin = require('../middleware/auth');
const upload = require('../middleware/upload');
const { isDbConnected } = require('../utils/db');

// Demo products fallback (when DB is unavailable)
const DEMO_PRODUCTS = [
  { _id: 'd1', name: 'Full Chicken', nameTelugu: 'పూర్తి కోడి', category: 'whole', pricePerKg: 220, unit: 'kg', image: '/images/full_chicken.svg', description: 'Fresh whole chicken with skin. Best for curries.', descriptionTelugu: 'తాజా పూర్తి కోడి. కర్రీలకు అనుకూలం.', inStock: true, displayOrder: 1 },
  { _id: 'd2', name: 'Skinless Chicken', nameTelugu: 'చర్మం లేని కోడి', category: 'skinless', pricePerKg: 240, unit: 'kg', image: '/images/full_chicken.svg', description: 'Chicken without skin. Healthy and lean.', descriptionTelugu: 'చర్మం తీసివేసిన కోడి. ఆరోగ్యకరం.', inStock: true, displayOrder: 2 },
  { _id: 'd3', name: 'Boneless Chicken', nameTelugu: 'ఎముక లేని కోడి', category: 'boneless', pricePerKg: 320, unit: 'kg', image: '/images/boneless.svg', description: 'Pure boneless chicken pieces. Easy to cook.', descriptionTelugu: 'స్వచ్ఛమైన ఎముక లేని చికెన్.', inStock: true, displayOrder: 3 },
  { _id: 'd4', name: 'Chicken Liver', nameTelugu: 'కోడి కాలేయం', category: 'liver', pricePerKg: 120, unit: 'kg', image: '/images/liver.svg', description: 'Fresh chicken liver. Rich in nutrients.', descriptionTelugu: 'తాజా కోడి కాలేయం. పోషకాలు అధికంగా.', inStock: true, displayOrder: 4 },
  { _id: 'd5', name: 'Chicken Wings', nameTelugu: 'కోడి రెక్కలు', category: 'wings', pricePerKg: 180, unit: 'kg', image: '/images/wings.svg', description: 'Juicy chicken wings. Perfect for fry.', descriptionTelugu: 'రుచికరమైన కోడి రెక్కలు.', inStock: true, displayOrder: 5 },
  { _id: 'd6', name: 'Chicken Legs', nameTelugu: 'కోడి కాళ్ళు', category: 'legs', pricePerKg: 200, unit: 'kg', image: '/images/legs.svg', description: 'Meaty chicken drumsticks.', descriptionTelugu: 'మాంసం అధికంగా ఉన్న కోడి కాళ్ళు.', inStock: true, displayOrder: 6 },
  { _id: 'd7', name: 'Chicken Keema', nameTelugu: 'కోడి కీమా', category: 'keema', pricePerKg: 340, unit: 'kg', image: '/images/keema.svg', description: 'Freshly minced chicken. Ready to cook.', descriptionTelugu: 'తాజాగా తయారైన కోడి కీమా.', inStock: true, displayOrder: 7 },
  { _id: 'd8', name: 'Chicken Gizzard', nameTelugu: 'కోడి గిజ్జర్డ్', category: 'gizzard', pricePerKg: 100, unit: 'kg', image: '/images/liver.svg', description: 'Cleaned chicken gizzard pieces.', descriptionTelugu: 'శుభ్రం చేసిన కోడి గిజ్జర్డ్.', inStock: true, displayOrder: 8 },
  { _id: 'd9', name: 'Chicken Curry Cut', nameTelugu: 'కోడి కర్రీ కట్', category: 'currycut', pricePerKg: 230, unit: 'kg', image: '/images/full_chicken.svg', description: 'Chicken cut in curry pieces.', descriptionTelugu: 'కర్రీ ముక్కలుగా కట్ చేసిన కోడి.', inStock: true, displayOrder: 9 },
  { _id: 'd10', name: 'Chicken Breast', nameTelugu: 'కోడి రొమ్ము', category: 'breast', pricePerKg: 360, unit: 'kg', image: '/images/boneless.svg', description: 'Premium chicken breast. High protein.', descriptionTelugu: 'ప్రీమియం కోడి రొమ్ము. అధిక ప్రోటీన్.', inStock: true, displayOrder: 10 },
  { _id: 'd11', name: 'Chicken Feet', nameTelugu: 'కోడి పాదాలు', category: 'feet', pricePerKg: 80, unit: 'kg', image: '/images/legs.svg', description: 'Cleaned chicken feet.', descriptionTelugu: 'శుభ్రం చేసిన కోడి పాదాలు.', inStock: false, displayOrder: 11 },
  { _id: 'd12', name: 'Chicken Heart', nameTelugu: 'కోడి గుండె', category: 'heart', pricePerKg: 110, unit: 'kg', image: '/images/liver.svg', description: 'Fresh chicken heart.', descriptionTelugu: 'తాజా కోడి గుండె.', inStock: true, displayOrder: 12 }
];

// GET all products (public)
router.get('/', async (req, res) => {
  try {
    if (isDbConnected()) {
      const products = await Product.find().sort({ displayOrder: 1, createdAt: 1 });
      if (products && products.length > 0) return res.json(products);
    }
    res.json(DEMO_PRODUCTS);
  } catch (e) {
    res.json(DEMO_PRODUCTS);
  }
});

// POST new product (admin)
router.post('/', verifyAdmin, upload.single('image'), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.image = req.file.secure_url || ('/uploads/' + req.file.filename);
      data.imagePublicId = req.file.public_id || '';
    }
    data.inStock = data.inStock === 'true' || data.inStock === true;
    data.pricePerKg = Number(data.pricePerKg);
    data.displayOrder = Number(data.displayOrder) || 0;

    if (isDbConnected()) {
      try {
        const product = await Product.create(data);
        if (product) return res.status(201).json(product);
      } catch (_) {}
    }

    // Fallback: Add to DEMO_PRODUCTS
    data._id = 'd' + Date.now();
    if (!data.image) data.image = '/images/full_chicken.svg';
    DEMO_PRODUCTS.push(data);
    return res.status(201).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT update product (admin)
router.put('/:id', verifyAdmin, upload.single('image'), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.image = req.file.secure_url || ('/uploads/' + req.file.filename);
      data.imagePublicId = req.file.public_id || '';
      data.imageVersion = Date.now();
    } else {
      delete data.image;
      delete data.imagePublicId;
    }
    data.inStock = data.inStock === 'true' || data.inStock === true;
    data.pricePerKg = Number(data.pricePerKg);
    data.displayOrder = Number(data.displayOrder) || 0;

    let product = null;
    if (isDbConnected()) {
      try {
        product = await Product.findByIdAndUpdate(req.params.id, data, { new: true });
      } catch (_) {}
    }

    if (product) {
      return res.json(product);
    }

    // Fallback: Update in-memory DEMO_PRODUCTS
    const demo = DEMO_PRODUCTS.find(p => p._id === req.params.id);
    if (demo) {
      Object.assign(demo, data);
      return res.json(demo);
    }

    res.status(404).json({ error: 'Product not found' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PATCH toggle stock status (admin)
router.patch('/:id/toggle-stock', verifyAdmin, async (req, res) => {
  try {
    if (isDbConnected()) {
      const product = await Product.findById(req.params.id);
      if (product) {
        product.inStock = !product.inStock;
        await product.save();
        return res.json(product);
      }
    }
  } catch (e) {
    // fallback for demo data
  }
  const demo = DEMO_PRODUCTS.find(p => p._id === req.params.id);
  if (demo) {
    demo.inStock = !demo.inStock;
    return res.json(demo);
  }
  res.status(404).json({ error: 'Product not found' });
});

// DELETE product (admin)
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    if (isDbConnected()) {
      try {
        await Product.findByIdAndDelete(req.params.id);
      } catch (_) {}
    }

    const index = DEMO_PRODUCTS.findIndex(p => p._id === req.params.id);
    if (index !== -1) {
      DEMO_PRODUCTS.splice(index, 1);
    }
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
