const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { isDbConnected } = require('../utils/db');

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
router.post('/', async (req, res) => {
  const address = (req.body.deliveryAddress || '').trim();
  if (!address) {
    return res.status(400).json({ error: 'Delivery location is required' });
  }
  try {
    if (isDbConnected()) {
      const order = await Order.create(req.body);
      await trimStoredOrders();
      return res.status(201).json({ success: true, orderId: order._id });
    }
    throw new Error('db offline');
  } catch (e) {
    if (e.message === 'Delivery location is required') {
      return res.status(400).json({ error: e.message });
    }
    const offlineOrder = {
      _id: 'off-' + Date.now(),
      ...req.body,
      status: req.body.status || 'pending',
      createdAt: new Date()
    };
    DEMO_ORDERS.unshift(offlineOrder);
    if (DEMO_ORDERS.length > MAX_STORED_ORDERS) DEMO_ORDERS.length = MAX_STORED_ORDERS;
    return res.json({ success: true, orderId: offlineOrder._id });
  }
});

// GET all orders (admin)
router.get('/', async (req, res) => {
  try {
    const token = req.headers.authorization;
    if (!token || token !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (isDbConnected()) {
      const orders = await Order.find().sort({ createdAt: -1 }).limit(MAX_STORED_ORDERS);
      return res.json(orders);
    }
    return res.json(DEMO_ORDERS.slice(0, MAX_STORED_ORDERS));
  } catch (e) {
    return res.json(DEMO_ORDERS.slice(0, MAX_STORED_ORDERS));
  }
});

// PUT update order status (admin)
router.put('/:id/status', async (req, res) => {
  try {
    const token = req.headers.authorization;
    if (!token || token !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { status } = req.body;
    if (isDbConnected()) {
      try {
        const order = await Order.findByIdAndUpdate(
          req.params.id,
          { status },
          { new: true }
        );
        if (order) return res.json(order);
      } catch (err) {}
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
router.delete('/:id', async (req, res) => {
  try {
    const token = req.headers.authorization;
    if (!token || token !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (isDbConnected()) {
      try {
        await Order.findByIdAndDelete(req.params.id);
      } catch (err) {}
    }
    const idx = DEMO_ORDERS.findIndex(o => o._id === req.params.id);
    if (idx !== -1) DEMO_ORDERS.splice(idx, 1);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
