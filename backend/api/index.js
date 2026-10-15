// ============================
// JYOTHI CHICKEN CENTER - API Server
// ============================
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

mongoose.set('bufferCommands', false);

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Static Files ─────────────────────────────────
const frontendDir = path.join(__dirname, '..', '..', 'frontend');
app.use(express.static(frontendDir));
app.use('/images', express.static(path.join(frontendDir, 'images')));

// Uploads directory (local fallback for images)
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// ── MongoDB Connection ───────────────────────────
let dbConnected = false;
const mongoURI = process.env.MONGODB_URI;

if (mongoURI && !mongoURI.includes('CLUSTER_URL')) {
  mongoose.connect(mongoURI)
    .then(() => {
      dbConnected = true;
      console.log('✅ MongoDB connected successfully');
    })
    .catch(err => {
      console.log('⚠️  MongoDB connection failed - running with demo data fallback');
      console.log('   Error:', err.message);
    });
} else {
  console.log('ℹ️  No MongoDB URI configured - running with demo data fallback');
}

// ── API Routes ───────────────────────────────────
app.use('/api/products', require('../routes/products'));
app.use('/api/orders', require('../routes/orders'));
app.use('/api/offers', require('../routes/offers'));
app.use('/api/admin', require('../routes/admin'));

// ── Health Check ─────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    db: dbConnected ? 'connected' : 'disconnected (using demo data)',
    uptime: process.uptime()
  });
});

// ── Serve Frontend ───────────────────────────────
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendDir, 'index.html'));
});

// Catch-all: serve index.html for SPA-like behavior
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(frontendDir, 'index.html'));
  } else {
    res.status(404).json({ error: 'API endpoint not found' });
  }
});

// ── Start Server ─────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('🐔 ═══════════════════════════════════════════');
  console.log('   JYOTHI CHICKEN CENTER - Server Running');
  console.log(`   🌐 http://localhost:${PORT}`);
  console.log(`   📁 Serving frontend from: ${frontendDir}`);
  console.log('🐔 ═══════════════════════════════════════════');
  console.log('');
});

module.exports = app;
