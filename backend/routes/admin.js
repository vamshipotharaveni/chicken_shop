const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const { isDbConnected } = require('../utils/db');

// POST admin login
router.post('/login', (req, res) => {
  const { password } = req.body;
  if (password === process.env.ADMIN_PASSWORD) {
    res.json({ success: true, token: process.env.ADMIN_PASSWORD });
  } else {
    res.status(401).json({ error: 'Incorrect password' });
  }
});

// In-memory settings fallback for local demo mode
let localSettings = {
  shopOpen: true,
  shopPhone: '917993996127',
  orderPhone: process.env.WHATSAPP_NUMBER || '919160726658',
  shopAddress: 'Main Road, Your City',
  shopMessage: ''
};

// GET settings (public)
router.get('/settings', async (req, res) => {
  try {
    if (isDbConnected()) {
      let settings = await Settings.findOne();
      if (settings) return res.json(settings);
    }
    res.json(localSettings);
  } catch (e) {
    res.json(localSettings);
  }
});

// PUT update settings (admin)
router.put('/settings', async (req, res) => {
  try {
    const token = req.headers.authorization;
    if (!token || token !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { shopOpen, shopPhone, orderPhone, shopAddress, shopMessage } = req.body;

    if (isDbConnected()) {
      try {
        let settings = await Settings.findOne();
        if (!settings) settings = new Settings();
        if (shopOpen !== undefined) settings.shopOpen = shopOpen;
        if (shopPhone) settings.shopPhone = shopPhone;
        if (orderPhone) settings.orderPhone = orderPhone;
        if (shopAddress) settings.shopAddress = shopAddress;
        if (shopMessage !== undefined) settings.shopMessage = shopMessage;
        await settings.save();
        return res.json(settings);
      } catch (_) {}
    }

    // In-memory fallback
    if (shopOpen !== undefined) localSettings.shopOpen = shopOpen;
    if (shopPhone) localSettings.shopPhone = shopPhone;
    if (orderPhone) localSettings.orderPhone = orderPhone;
    if (shopAddress) localSettings.shopAddress = shopAddress;
    if (shopMessage !== undefined) localSettings.shopMessage = shopMessage;
    res.json(localSettings);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
