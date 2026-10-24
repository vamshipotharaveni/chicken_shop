const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const Product = require('./models/Product');
const Offer = require('./models/Offer');

const demoProducts = [
  { name: 'Full Chicken', nameTelugu: 'పూర్తి కోడి', category: 'whole', pricePerKg: 220, unit: 'kg', image: '/images/full_chicken.svg', description: 'Fresh whole chicken with skin. Best for curries.', descriptionTelugu: 'తాజా పూర్తి కోడి. కర్రీలకు అనుకూలం.', inStock: true, displayOrder: 1 },
  { name: 'Skinless Chicken', nameTelugu: 'చర్మం లేని కోడి', category: 'skinless', pricePerKg: 240, unit: 'kg', image: '/images/full_chicken.svg', description: 'Chicken without skin. Healthy and lean.', descriptionTelugu: 'చర్మం తీసివేసిన కోడి. ఆరోగ్యకరం.', inStock: true, displayOrder: 2 },
  { name: 'Boneless Chicken', nameTelugu: 'ఎముక లేని కోడి', category: 'boneless', pricePerKg: 320, unit: 'kg', image: '/images/boneless.svg', description: 'Pure boneless chicken pieces. Easy to cook.', descriptionTelugu: 'స్వచ్ఛమైన ఎముక లేని చికెన్.', inStock: true, displayOrder: 3 },
  { name: 'Chicken Liver', nameTelugu: 'కోడి కాలేయం', category: 'liver', pricePerKg: 120, unit: 'kg', image: '/images/liver.svg', description: 'Fresh chicken liver. Rich in nutrients.', descriptionTelugu: 'తాజా కోడి కాలేయం. పోషకాలు అధికంగా.', inStock: true, displayOrder: 4 },
  { name: 'Chicken Wings', nameTelugu: 'కోడి రెక్కలు', category: 'wings', pricePerKg: 180, unit: 'kg', image: '/images/wings.svg', description: 'Juicy chicken wings. Perfect for fry.', descriptionTelugu: 'రుచికరమైన కోడి రెక్కలు.', inStock: true, displayOrder: 5 },
  { name: 'Chicken Legs', nameTelugu: 'కోడి కాళ్ళు', category: 'legs', pricePerKg: 200, unit: 'kg', image: '/images/legs.svg', description: 'Meaty chicken drumsticks.', descriptionTelugu: 'మాంసం అధికంగా ఉన్న కోడి కాళ్ళు.', inStock: true, displayOrder: 6 },
  { name: 'Chicken Keema', nameTelugu: 'కోడి కీమా', category: 'keema', pricePerKg: 340, unit: 'kg', image: '/images/keema.svg', description: 'Freshly minced chicken. Ready to cook.', descriptionTelugu: 'తాజాగా తయారైన కోడి కీమా.', inStock: true, displayOrder: 7 },
  { name: 'Chicken Gizzard', nameTelugu: 'కోడి గిజ్జర్డ్', category: 'gizzard', pricePerKg: 100, unit: 'kg', image: '/images/liver.svg', description: 'Cleaned chicken gizzard pieces.', descriptionTelugu: 'శుభ్రం చేసిన కోడి గిజ్జర్డ్.', inStock: true, displayOrder: 8 },
  { name: 'Chicken Curry Cut', nameTelugu: 'కోడి కర్రీ కట్', category: 'currycut', pricePerKg: 230, unit: 'kg', image: '/images/full_chicken.svg', description: 'Chicken cut in curry pieces.', descriptionTelugu: 'కర్రీ ముక్కలుగా కట్ చేసిన కోడి.', inStock: true, displayOrder: 9 },
  { name: 'Chicken Breast', nameTelugu: 'కోడి రొమ్ము', category: 'breast', pricePerKg: 360, unit: 'kg', image: '/images/boneless.svg', description: 'Premium chicken breast. High protein.', descriptionTelugu: 'ప్రీమియం కోడి రొమ్ము. అధిక ప్రోటీన్.', inStock: true, displayOrder: 10 },
  { name: 'Chicken Feet', nameTelugu: 'కోడి పాదాలు', category: 'feet', pricePerKg: 80, unit: 'kg', image: '/images/legs.svg', description: 'Cleaned chicken feet.', descriptionTelugu: 'శుభ్రం చేసిన కోడి పాదాలు.', inStock: false, displayOrder: 11 },
  { name: 'Chicken Heart', nameTelugu: 'కోడి గుండె', category: 'heart', pricePerKg: 110, unit: 'kg', image: '/images/liver.svg', description: 'Fresh chicken heart.', descriptionTelugu: 'తాజా కోడి గుండె.', inStock: true, displayOrder: 12 }
];

const defaultOffers = [
  {
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

async function seedProducts() {
  const result = await Product.bulkWrite(demoProducts.map(product => ({
    updateOne: {
      filter: { name: product.name },
      update: { $setOnInsert: product },
      upsert: true
    }
  })));
  console.log(`Seeded ${result.upsertedCount} missing products; existing products were preserved.`);
  return result;
}

async function seedOffers() {
  const result = await Offer.bulkWrite(defaultOffers.map(offer => ({
    updateOne: {
      filter: { text: offer.text },
      update: { $setOnInsert: offer },
      upsert: true
    }
  })));
  console.log(`Seeded ${result.upsertedCount} missing offers; existing offers were preserved.`);
  return result;
}

if (require.main === module) {
  (async () => {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI || mongoURI.includes('CLUSTER_URL') || mongoURI.includes('<db_password>') || mongoURI.includes('<db_username>')) {
      console.error('❌ Error: Valid MONGODB_URI is not configured in .env');
      console.log('   Please configure a valid MongoDB connection string before running seed.js');
      process.exit(1);
    }

    try {
      console.log('Connecting to MongoDB...');
      await mongoose.connect(mongoURI);
      console.log('✅ Connected to MongoDB');

      console.log('Seeding products...');
      await seedProducts();

      console.log('Seeding offers...');
      await seedOffers();

      await mongoose.disconnect();
      console.log('✅ Disconnected from MongoDB. Seeding finished.');
      process.exit(0);
    } catch (err) {
      console.error('❌ Seeding failed:', err.message);
      try {
        await mongoose.disconnect();
      } catch (_) {}
      process.exit(1);
    }
  })();
}

module.exports = { seedProducts, seedOffers };
