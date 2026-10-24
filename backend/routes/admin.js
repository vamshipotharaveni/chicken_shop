const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const verifyAdmin = require('../middleware/auth');
const { isDbConnected, requireDatabaseForVercel } = require('../utils/db');

// POST admin login
router.post('/login', (req, res) => {
  const { password } = req.body;
  if (!process.env.ADMIN_PASSWORD) {
    return res.status(503).json({ error: 'Admin login is not configured on the server.' });
  }
  if (typeof password === 'string' && password === process.env.ADMIN_PASSWORD) {
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
  shopAddress: process.env.SHOP_ADDRESS || 'Near canal, Saidhapur Road, Huzurabad, Karimnagar, Telangana',
  shopMessage: ''
};

// GET settings (public)
router.get('/settings', async (req, res) => {
  try {
    if (isDbConnected()) {
      let settings = await Settings.findOne();
      if (settings) {
        if (!settings.shopAddress || settings.shopAddress === 'Main Road' || settings.shopAddress === 'Main Road, Your City') {
          settings.shopAddress = process.env.SHOP_ADDRESS || 'Near canal, Saidhapur Road, Huzurabad, Karimnagar, Telangana';
        }
        return res.json(settings);
      }
    }
    res.json(localSettings);
  } catch (e) {
    res.json(localSettings);
  }
});

// PUT update settings (admin)
router.put('/settings', verifyAdmin, requireDatabaseForVercel, async (req, res) => {
  try {
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
      } catch (e) {
        return res.status(500).json({ error: `Database update failed: ${e.message}` });
      }
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
