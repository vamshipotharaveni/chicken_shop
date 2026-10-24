const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const verifyAdmin = require('../middleware/auth');
const upload = require('../middleware/upload');
const { isDbConnected, requireDatabaseForVercel } = require('../utils/db');

function rejectInvalidProductId(req, res) {
  if (mongoose.Types.ObjectId.isValid(req.params.id)) return false;

  res.status(404).json({ error: 'Product not found' });
  return true;
}

function getUploadedImage(file) {
  if (file.secure_url) {
    return { image: file.secure_url, imagePublicId: file.public_id || file.filename || '' };
  }
  if (file.path && /^https?:\/\//i.test(file.path)) {
    return { image: file.path, imagePublicId: file.public_id || file.filename || '' };
  }
  if (file.buffer) {
    return {
      image: '',
      imagePublicId: '',
      imageData: file.buffer,
      imageContentType: file.mimetype
    };
  }
  return { image: `/uploads/${file.filename}`, imagePublicId: '' };
}

function handleProductImageUpload(req, res, next) {
  upload.single('image')(req, res, error => {
    if (!error) return next();
    const status = error.code === 'LIMIT_FILE_SIZE' ? 413 : error.name === 'MulterError' ? 400 : 502;
    const message = error.name === 'MulterError' || error.message.includes('Only JPG')
      ? error.message
      : `Image upload failed. Check the Cloudinary configuration in the deployment environment. ${error.message}`;
    res.status(status).json({ error: message });
  });
}

// GET all products (public)
router.get('/', requireDatabaseForVercel, async (req, res) => {
  try {
    if (!isDbConnected()) return res.status(503).json({ error: 'Product data is currently unavailable because the database is not connected.' });
    const products = await Product.find().sort({ displayOrder: 1, createdAt: 1 });
    return res.json(products);
  } catch (e) {
    return res.status(500).json({ error: `Database read failed: ${e.message}` });
  }
});

router.get('/:id/image', async (req, res) => {
  try {
    if (!isDbConnected()) return res.status(503).end();
    const product = await Product.findById(req.params.id).select('+imageData');
    if (!product || !product.imageData) return res.status(404).end();
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
    res.type(product.imageContentType || 'application/octet-stream').send(product.imageData);
  } catch (e) {
    res.status(404).end();
  }
});

// POST new product (admin)
router.post('/', verifyAdmin, requireDatabaseForVercel, handleProductImageUpload, async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      Object.assign(data, getUploadedImage(req.file));
      data.imageVersion = Date.now();
    }
    data.inStock = data.inStock === 'true' || data.inStock === true;
    data.pricePerKg = Number(data.pricePerKg);
    data.displayOrder = Number(data.displayOrder) || 0;

    if (!isDbConnected()) return res.status(503).json({ error: 'Product data is currently unavailable because the database is not connected.' });
    try {
      const product = await Product.create(data);
      if (req.file && req.file.buffer) {
        product.image = `/api/products/${product._id}/image`;
        product.imageVersion = Date.now();
        await product.save();
      }
      const response = product.toObject();
      delete response.imageData;
      delete response.imageContentType;
      return res.status(201).json(response);
    } catch (e) {
      return res.status(500).json({ error: `Database save failed: ${e.message}` });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT update product (admin)
router.put('/:id', verifyAdmin, requireDatabaseForVercel, handleProductImageUpload, async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      Object.assign(data, getUploadedImage(req.file));
      if (req.file.buffer) data.image = `/api/products/${req.params.id}/image`;
    } else {
      delete data.image;
      delete data.imagePublicId;
    }
    data.inStock = data.inStock === 'true' || data.inStock === true;
    data.pricePerKg = Number(data.pricePerKg);
    data.displayOrder = Number(data.displayOrder) || 0;

    if (!isDbConnected()) return res.status(503).json({ error: 'Product data is currently unavailable because the database is not connected.' });
    if (rejectInvalidProductId(req, res)) return;
    let product;
    try {
      product = await Product.findById(req.params.id).select('+imageData');
      if (!product) return res.status(404).json({ error: 'Product not found' });

      if (req.file) {
        data.imageVersion = Math.max(Date.now(), (product.imageVersion || 0) + 1);
        if (!req.file.buffer) {
          data.imageData = null;
          data.imageContentType = '';
        }
      }

      product.set(data);
      await product.save();
      const response = product.toObject();
      delete response.imageData;
      delete response.imageContentType;
      return res.json(response);
    } catch (e) {
      return res.status(500).json({ error: `Database update failed: ${e.message}` });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PATCH toggle stock status (admin)
router.patch('/:id/toggle-stock', verifyAdmin, requireDatabaseForVercel, async (req, res) => {
  try {
    if (!isDbConnected()) return res.status(503).json({ error: 'Product data is currently unavailable because the database is not connected.' });
    if (rejectInvalidProductId(req, res)) return;
    const product = await Product.findById(req.params.id);
    if (product) {
      product.inStock = !product.inStock;
      await product.save();
      return res.json(product);
    }
    return res.status(404).json({ error: 'Product not found' });
  } catch (e) {
    return res.status(500).json({ error: `Database update failed: ${e.message}` });
  }
});

// DELETE product (admin)
router.delete('/:id', verifyAdmin, requireDatabaseForVercel, async (req, res) => {
  try {
    if (!isDbConnected()) return res.status(503).json({ error: 'Product data is currently unavailable because the database is not connected.' });
    if (rejectInvalidProductId(req, res)) return;
    const product = await Product.findByIdAndDelete(req.params.id);
    if (product) return res.json({ success: true });
    return res.status(404).json({ error: 'Product not found' });
  } catch (e) {
    res.status(500).json({ error: `Database delete failed: ${e.message}` });
  }
});

module.exports = router;
