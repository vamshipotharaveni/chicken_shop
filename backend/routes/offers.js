const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Offer = require('../models/Offer');
const verifyAdmin = require('../middleware/auth');
const { isDbConnected, requireDatabaseForVercel } = require('../utils/db');

// GET all active offers (public)
router.get('/', requireDatabaseForVercel, async (req, res) => {
  try {
    if (!isDbConnected()) return res.status(503).json({ error: 'Offer data is currently unavailable because the database is not connected.' });
    const offers = await Offer.find({ active: true }).sort({ displayOrder: 1 });
    return res.json(offers);
  } catch (e) {
    return res.status(500).json({ error: `Database read failed: ${e.message}` });
  }
});

// GET all offers including inactive (admin)
router.get('/all', verifyAdmin, requireDatabaseForVercel, async (req, res) => {
  try {
    if (!isDbConnected()) return res.status(503).json({ error: 'Offer data is currently unavailable because the database is not connected.' });
    const offers = await Offer.find().sort({ displayOrder: 1 });
    return res.json(offers);
  } catch (e) {
    return res.status(500).json({ error: `Database read failed: ${e.message}` });
  }
});

// POST new offer (admin)
router.post('/', verifyAdmin, requireDatabaseForVercel, async (req, res) => {
  try {
    if (typeof req.body.text !== 'string' || !req.body.text.trim()) {
      return res.status(400).json({ error: 'Offer title is required.' });
    }
    if (req.body.active !== undefined && typeof req.body.active !== 'boolean') {
      return res.status(400).json({ error: 'Offer status must be true or false.' });
    }
    if (!isDbConnected()) return res.status(503).json({ error: 'Offer data is currently unavailable because the database is not connected.' });
    const offer = await Offer.create({ ...req.body, text: req.body.text.trim() });
    return res.status(201).json(offer);
  } catch (e) {
    return res.status(500).json({ error: `Database save failed: ${e.message}` });
  }
});

// PUT update offer (admin)
router.put('/:id', verifyAdmin, requireDatabaseForVercel, async (req, res) => {
  try {
    if (req.body.active !== undefined && typeof req.body.active !== 'boolean') {
      return res.status(400).json({ error: 'Offer status must be true or false.' });
    }
    if (req.body.text !== undefined && (typeof req.body.text !== 'string' || !req.body.text.trim())) {
      return res.status(400).json({ error: 'Offer title is required.' });
    }
    if (!isDbConnected()) return res.status(503).json({ error: 'Offer data is currently unavailable because the database is not connected.' });
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ error: 'Offer not found. Refresh the offers list and try again.' });
    }
    const update = { ...req.body };
    if (update.text !== undefined) update.text = update.text.trim();
    const offer = await Offer.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (offer) return res.json(offer);
    return res.status(404).json({ error: 'Offer not found' });
  } catch (e) {
    return res.status(500).json({ error: `Database update failed: ${e.message}` });
  }
});

// DELETE offer (admin)
router.delete('/:id', verifyAdmin, requireDatabaseForVercel, async (req, res) => {
  try {
    if (!isDbConnected()) return res.status(503).json({ error: 'Offer data is currently unavailable because the database is not connected.' });
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ error: 'Offer not found. Refresh the offers list and try again.' });
    }
    const offer = await Offer.findByIdAndDelete(req.params.id);
    if (offer) return res.json({ success: true });
    return res.status(404).json({ error: 'Offer not found' });
  } catch (e) {
    return res.status(500).json({ error: `Database delete failed: ${e.message}` });
  }
});

module.exports = router;
