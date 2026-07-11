/**
 * Admin Seeder Script
 * Run: node scripts/seedAdmin.js
 * Creates the initial admin account if one doesn't exist
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import connectDB from '../config/db.js';

const seedAdmin = async () => {
  await connectDB();

  const existing = await User.findOne({ role: 'admin' });
  if (existing) {
    console.log('✅ Admin already exists:', existing.email);
    process.exit(0);
  }

  const admin = await User.create({
    name: 'Super Admin',
    email: 'admin@fooddonation.com',
    password: 'Admin@123456',
    role: 'admin',
  });

  console.log('✅ Admin created successfully!');
  console.log('   Email   :', admin.email);
  console.log('   Password: Admin@123456');
  console.log('   ⚠️  Change this password immediately after first login!');
  process.exit(0);
};

seedAdmin().catch((err) => {
  console.error('❌ Seeder error:', err.message);
  process.exit(1);
});
