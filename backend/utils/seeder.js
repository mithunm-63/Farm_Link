/**
 * Database Seeder
 * Run: npm run seed
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Crop = require('../models/Crop');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/farmlink';

const farmers = [
  {
    name: 'Rajesh Kumar',
    email: 'farmer1@farmlink.com',
    password: 'password123',
    role: 'farmer',
    phone: '+91-9876543210',
    farmName: 'Green Valley Farm',
    farmingType: 'organic',
    cropTypes: ['vegetables', 'fruits'],
    yearsOfExperience: 15,
    location: { city: 'Nashik', state: 'Maharashtra', pincode: '422001' },
    rating: { average: 4.7, count: 23 },
  },
  {
    name: 'Suresh Patel',
    email: 'farmer2@farmlink.com',
    password: 'password123',
    role: 'farmer',
    phone: '+91-9876543211',
    farmName: 'Sunrise Agro Farm',
    farmingType: 'conventional',
    cropTypes: ['grains', 'pulses'],
    yearsOfExperience: 20,
    location: { city: 'Pune', state: 'Maharashtra', pincode: '411001' },
    rating: { average: 4.5, count: 18 },
  },
  {
    name: 'Anita Sharma',
    email: 'farmer3@farmlink.com',
    password: 'password123',
    role: 'farmer',
    phone: '+91-9876543212',
    farmName: 'Himalayan Herbs',
    farmingType: 'organic',
    cropTypes: ['herbs', 'spices'],
    yearsOfExperience: 8,
    location: { city: 'Shimla', state: 'Himachal Pradesh', pincode: '171001' },
    rating: { average: 4.9, count: 31 },
  },
];

const retailers = [
  {
    name: 'Amit Verma',
    email: 'retailer1@farmlink.com',
    password: 'password123',
    role: 'retailer',
    phone: '+91-9876543220',
    businessName: 'Fresh Mart Superstore',
    businessType: 'supermarket',
    location: { city: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
  },
  {
    name: 'Priya Mehta',
    email: 'retailer2@farmlink.com',
    password: 'password123',
    role: 'retailer',
    phone: '+91-9876543221',
    businessName: 'The Organic Kitchen',
    businessType: 'restaurant',
    location: { city: 'Bengaluru', state: 'Karnataka', pincode: '560001' },
  },
];

const cropCategories = [
  { name: 'Alphonso Mangoes', category: 'fruits', price: 450, unit: 'kg', qty: 500 },
  { name: 'Fresh Tomatoes', category: 'vegetables', price: 35, unit: 'kg', qty: 1000 },
  { name: 'Basmati Rice', category: 'grains', price: 120, unit: 'kg', qty: 2000 },
  { name: 'Organic Turmeric', category: 'spices', price: 280, unit: 'kg', qty: 300 },
  { name: 'Green Spinach', category: 'vegetables', price: 25, unit: 'kg', qty: 400 },
  { name: 'Chickpeas (Chana)', category: 'pulses', price: 90, unit: 'kg', qty: 800 },
];

const imageUrls = [
  'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=800',
  'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800',
  'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=800',
  'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=800',
  'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=800',
  'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800',
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([User.deleteMany({}), Crop.deleteMany({})]);
    console.log('🗑️  Cleared existing data');

    // Create farmers
    const createdFarmers = await User.create(farmers);
    console.log(`✅ Created ${createdFarmers.length} farmers`);

    // Create retailers
    await User.create(retailers);
    console.log(`✅ Created ${retailers.length} retailers`);

    // Create crops
    const cropsData = cropCategories.map((crop, i) => ({
      farmer: createdFarmers[i % createdFarmers.length]._id,
      name: crop.name,
      category: crop.category,
      description: `Premium quality ${crop.name} sourced directly from our farm. Fresh, natural, and packed with nutrients.`,
      pricePerUnit: crop.price,
      unit: crop.unit,
      availableQuantity: crop.qty,
      minimumOrderQuantity: 10,
      harvestDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      grade: 'A',
      isOrganic: i % 2 === 0,
      location: {
        city: createdFarmers[i % createdFarmers.length].location.city,
        state: createdFarmers[i % createdFarmers.length].location.state,
        pincode: createdFarmers[i % createdFarmers.length].location.pincode,
      },
      images: [{ url: imageUrls[i], public_id: `seed_${i}`, isMain: true }],
      status: 'active',
      isFeatured: i < 3,
      rating: { average: 4 + Math.random(), count: Math.floor(Math.random() * 20) + 5 },
      tags: [crop.category, 'fresh', 'quality'],
    }));

    await Crop.create(cropsData);
    console.log(`✅ Created ${cropsData.length} crop listings`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 Test credentials:');
    console.log('  Farmer:   farmer1@farmlink.com / password123');
    console.log('  Retailer: retailer1@farmlink.com / password123');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seed();
