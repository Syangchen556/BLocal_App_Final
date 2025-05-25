import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectDB from '../lib/mongodb.js';
import User from '../models/User.js';
import Shop from '../models/Shop.js';

async function createTestAccounts() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Create admin account
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = await User.findOneAndUpdate(
      { email: 'admin@blocal.bt' },
      {
        name: 'Admin User',
        email: 'admin@blocal.bt',
        password: adminPassword,
        role: 'ADMIN',
        emailVerified: true,
        status: 'active',
        profile: {
          phoneNumber: '17111111',
          address: {
            street: 'Norzin Lam',
            city: 'Thimphu',
            state: 'Thimphu',
            zipCode: '11001',
            country: 'Bhutan'
          }
        }
      },
      { upsert: true, new: true }
    );
    console.log('✅ Admin account created:', admin.email);

    // Create seller account
    const sellerPassword = await bcrypt.hash('seller123', 12);
    const seller = await User.findOneAndUpdate(
      { email: 'seller@blocal.bt' },
      {
        name: 'Test Seller',
        email: 'seller@blocal.bt',
        password: sellerPassword,
        role: 'SELLER',
        emailVerified: true,
        status: 'active',
        profile: {
          phoneNumber: '17222222',
          address: {
            street: 'Chang Lam',
            city: 'Thimphu',
            state: 'Thimphu',
            zipCode: '11001',
            country: 'Bhutan'
          }
        }
      },
      { upsert: true, new: true }
    );
    console.log('✅ Seller account created:', seller.email);

    // Create shop for seller
    const shop = await Shop.findOneAndUpdate(
      { owner: seller._id },
      {
        name: 'Test Shop',
        description: 'A test shop for development purposes',
        owner: seller._id,
        location: 'Thimphu',
        contact: {
          phone: '17222222',
          email: 'seller@blocal.bt'
        },
        status: 'active'
      },
      { upsert: true, new: true }
    );
    console.log('✅ Shop created for seller:', shop.name);

    // Create buyer account
    const buyerPassword = await bcrypt.hash('buyer123', 12);
    const buyer = await User.findOneAndUpdate(
      { email: 'buyer@blocal.bt' },
      {
        name: 'Test Buyer',
        email: 'buyer@blocal.bt',
        password: buyerPassword,
        role: 'BUYER',
        emailVerified: true,
        status: 'active',
        profile: {
          phoneNumber: '17333333',
          address: {
            street: 'Doebum Lam',
            city: 'Thimphu',
            state: 'Thimphu',
            zipCode: '11001',
            country: 'Bhutan'
          }
        }
      },
      { upsert: true, new: true }
    );
    console.log('✅ Buyer account created:', buyer.email);

    console.log('\nTest Accounts Created Successfully!');
    console.log('\nLogin Credentials:');
    console.log('------------------');
    console.log('Admin:');
    console.log('Email: admin@blocal.bt');
    console.log('Password: admin123');
    console.log('\nSeller:');
    console.log('Email: seller@blocal.bt');
    console.log('Password: seller123');
    console.log('\nBuyer:');
    console.log('Email: buyer@blocal.bt');
    console.log('Password: buyer123');

  } catch (error) {
    console.error('Error creating test accounts:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

createTestAccounts(); 