const express = require('express');
const router = express.Router();
const Offer = require('../models/Offer');
const verifyAdmin = require('../middleware/auth');
const { isDbConnected, requireDatabaseForVercel } = require('../utils/db');

// Demo offers fallback — 4 Telugu festival templates
const DEMO_OFFERS = [
  {
    _id: 'of1',
    template: 'dussehra',
    discount: '15% OFF',
    text: 'Dussehra Special on all fresh chicken cuts',
    textTelugu: 'దసరా స్పెషల్ — అన్ని తాజా చికెన్ కట్స్‌పై',
    description: 'Celebrate Vijayadashami with farm-fresh hygienic chicken.',
    descriptionTelugu: 'విజయదశమి సందర్భంగా తాజా హైజీనిక్ చికెన్.',
    emoji: '🏹',
    active: true,
    displayOrder: 1
  },
  {
    _id: 'of2',
    template: 'diwali',
    discount: '₹50 OFF',
    text: 'Diwali / Deepavali lights offer on 2kg+ orders',
    textTelugu: 'దీపావళి ఆఫర్ — 2 కిలోల పైన ఆర్డర్లకు',
    description: 'Festive packing and extra savings this Deepavali.',
    descriptionTelugu: 'ఈ దీపావళికి పండుగ ప్యాకింగ్ మరియు ఎక్కువ ఆదా.',
    emoji: '🪔',
    active: true,
    displayOrder: 2
  },
  {
    _id: 'of3',
    template: 'ugadi',
    discount: '10% OFF',
    text: 'Ugadi New Year freshness deal',
    textTelugu: 'ఉగాది నూతన సంవత్సరం తాజా చికెన్ డీల్',
    description: 'Start the Telugu new year with pure farm-fresh cuts.',
    descriptionTelugu: 'తెలుగు నూతన సంవత్సరాన్ని తాజా కట్స్‌తో ప్రారంభించండి.',
    emoji: '🌼',
    active: true,
    displayOrder: 3
  },
  {
    _id: 'of4',
    template: 'sankranti',
    discount: '₹20/kg',
    text: 'Sankranti harvest special — bulk orders save more',
    textTelugu: 'సంక్రాంతి స్పెషల్ — బల్క్ ఆర్డర్లకు ఎక్కువ ఆదా',
    description: 'Weekend & festival bulk chicken at harvest rates.',
    descriptionTelugu: 'పండుగ మరియు వారాంతం బల్క్ ఆర్డర్లకు ప్రత్యేక ధర.',
    emoji: '🪁',
    active: true,
    displayOrder: 4
  }
];

function activeDemo() {
  return DEMO_OFFERS.filter(o => o.active !== false).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
}

// GET all active offers (public)
router.get('/', async (req, res) => {
  try {
    if (isDbConnected()) {
      const offers = await Offer.find({ active: true }).sort({ displayOrder: 1 });
      if (offers.length > 0) return res.json(offers);
    }
    res.json(activeDemo());
  } catch (e) {
    res.json(activeDemo());
  }
});

// GET all offers including inactive (admin)
router.get('/all', verifyAdmin, async (req, res) => {
  try {
    if (isDbConnected()) {
      const offers = await Offer.find().sort({ displayOrder: 1 });
      if (offers.length > 0) return res.json(offers);
    }
    res.json(DEMO_OFFERS);
  } catch (e) {
    res.json(DEMO_OFFERS);
  }
});

// POST new offer (admin)
router.post('/', verifyAdmin, requireDatabaseForVercel, async (req, res) => {
  try {
    if (isDbConnected()) {
      const offer = await Offer.create(req.body);
      return res.status(201).json(offer);
    }
  } catch (e) {
    return res.status(500).json({ error: `Database save failed: ${e.message}` });
  }

  {
    const newOffer = {
      _id: 'of-' + Date.now(),
      template: 'dussehra',
      discount: '',
      description: '',
      descriptionTelugu: '',
      emoji: '🔥',
      ...req.body,
      active: req.body.active !== false,
      createdAt: new Date()
    };
    DEMO_OFFERS.push(newOffer);
    return res.status(201).json(newOffer);
  }
});

// PUT update offer (admin)
router.put('/:id', verifyAdmin, requireDatabaseForVercel, async (req, res) => {
  try {
    if (isDbConnected()) {
      const offer = await Offer.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (offer) return res.json(offer);
      return res.status(404).json({ error: 'Offer not found' });
    }
  } catch (e) {
    return res.status(500).json({ error: `Database update failed: ${e.message}` });
  }
  const demo = DEMO_OFFERS.find(o => o._id === req.params.id);
  if (demo) {
    Object.assign(demo, req.body);
    return res.json(demo);
  }
  res.status(404).json({ error: 'Offer not found' });
});

// DELETE offer (admin)
router.delete('/:id', verifyAdmin, requireDatabaseForVercel, async (req, res) => {
  try {
    if (isDbConnected()) {
      const offer = await Offer.findByIdAndDelete(req.params.id);
      if (offer) return res.json({ success: true });
      return res.status(404).json({ error: 'Offer not found' });
    }
  } catch (e) {
    return res.status(500).json({ error: `Database delete failed: ${e.message}` });
  }
  const idx = DEMO_OFFERS.findIndex(o => o._id === req.params.id);
  if (idx !== -1) {
    DEMO_OFFERS.splice(idx, 1);
    return res.json({ success: true });
  }
  res.status(404).json({ error: 'Offer not found' });
});

module.exports = router;
