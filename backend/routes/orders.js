const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const Order = require('../models/Order');
const verifyAdmin = require('../middleware/auth');
const { isDbConnected, requireDatabaseForVercel } = require('../utils/db');

const DEMO_ORDERS = [];
const MAX_STORED_ORDERS = 10;

async function trimStoredOrders() {
  if (!isDbConnected()) return;
  const extras = await Order.find().sort({ createdAt: -1 }).skip(MAX_STORED_ORDERS).select('_id');
  if (extras.length) {
    await Order.deleteMany({ _id: { $in: extras.map((o) => o._id) } });
  }
}

// POST save order (public)
router.post('/', requireDatabaseForVercel, async (req, res) => {
  const body = req.body || {};
  const address = typeof body.deliveryAddress === 'string' ? body.deliveryAddress.trim() : '';
  if (!address) {
    return res.status(400).json({ error: 'Delivery location is required' });
  }
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return res.status(400).json({ error: 'Add at least one product before placing an order.' });
  }
  try {
    if (isDbConnected()) {
      const settings = await Settings.findOne().select('shopOpen');
      if (settings && settings.shopOpen === false) {
        return res.status(409).json({ error: 'The shop is currently closed and cannot accept orders.' });
      }
      const order = await Order.create(body);
      await trimStoredOrders();
      return res.status(201).json({ success: true, orderId: order._id });
    }
    throw new Error('db offline');
  } catch (e) {
    if (e.message === 'Delivery location is required') {
      return res.status(400).json({ error: e.message });
    }
    if (isDbConnected()) {
      return res.status(500).json({ error: `Database save failed: ${e.message}` });
    }
    if (process.env.VERCEL === '1') {
      return res.status(500).json({ error: `Database save failed: ${e.message}` });
    }
    const offlineOrder = {
      _id: 'off-' + Date.now(),
      ...body,
      status: body.status || 'pending',
      createdAt: new Date()
    };
    DEMO_ORDERS.unshift(offlineOrder);
    if (DEMO_ORDERS.length > MAX_STORED_ORDERS) DEMO_ORDERS.length = MAX_STORED_ORDERS;
    return res.json({ success: true, orderId: offlineOrder._id });
  }
});

// GET all orders (admin)
router.get('/', verifyAdmin, requireDatabaseForVercel, async (req, res) => {
  try {
    if (isDbConnected()) {
      const orders = await Order.find().sort({ createdAt: -1 }).limit(MAX_STORED_ORDERS);
      return res.json(orders);
    }
    return res.json(DEMO_ORDERS.slice(0, MAX_STORED_ORDERS));
  } catch (e) {
    if (process.env.VERCEL === '1') {
      return res.status(500).json({ error: `Database read failed: ${e.message}` });
    }
    return res.json(DEMO_ORDERS.slice(0, MAX_STORED_ORDERS));
  }
});

// PUT update order status (admin)
router.put('/:id/status', verifyAdmin, requireDatabaseForVercel, async (req, res) => {
  try {
    const { status } = req.body;
    if (isDbConnected()) {
      try {
        const order = await Order.findByIdAndUpdate(
          req.params.id,
          { status },
          { new: true }
        );
        if (order) return res.json(order);
        return res.status(404).json({ error: 'Order not found' });
      } catch (err) {
        return res.status(500).json({ error: `Database update failed: ${err.message}` });
      }
    }

    const demo = DEMO_ORDERS.find(o => o._id === req.params.id);
    if (demo) {
      demo.status = status;
      return res.json(demo);
    }
    return res.status(404).json({ error: 'Order not found' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE order (admin)
router.delete('/:id', verifyAdmin, requireDatabaseForVercel, async (req, res) => {
  try {
    if (isDbConnected()) {
      const order = await Order.findByIdAndDelete(req.params.id);
      if (order) return res.json({ success: true });
      return res.status(404).json({ error: 'Order not found' });
    }
    const idx = DEMO_ORDERS.findIndex(o => o._id === req.params.id);
    if (idx !== -1) {
      DEMO_ORDERS.splice(idx, 1);
      return res.json({ success: true });
    }
    return res.status(404).json({ error: 'Order not found' });
  } catch (e) {
    res.status(500).json({ error: `Database delete failed: ${e.message}` });
  }
});

module.exports = router;
