import bcrypt from 'bcryptjs';
import { connectDB } from '../lib/mongodb.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function testAuth() {
  try {
    console.log('Connecting to database...');
    const db = await connectDB();
    
    // Test user credentials
    const testEmail = 'seller1@blocal.bt';
    const testPassword = 'seller123';
    
    console.log(`Looking for user with email: ${testEmail}`);
    const user = await db.collection('users').findOne({ email: testEmail });
    
    if (!user) {
      console.log('User not found!');
      process.exit(1);
    }
    
    console.log('User found:', user.name);
    console.log('Stored password hash:', user.password);
    
    // Test password comparison
    console.log(`Testing password: ${testPassword}`);
    const isPasswordCorrect = await bcrypt.compare(testPassword, user.password);
    console.log('Password correct?', isPasswordCorrect);
    
    // Generate a new hash for the same password to verify hashing
    const newHash = await bcrypt.hash(testPassword, 12);
    console.log('New hash for same password:', newHash);
    
    // Verify the new hash works
    const verifyNewHash = await bcrypt.compare(testPassword, newHash);
    console.log('New hash verification:', verifyNewHash);
    
    // Update the user's password with the new hash
    if (!isPasswordCorrect) {
      console.log('Updating user password with new hash...');
      await db.collection('users').updateOne(
        { email: testEmail },
        { $set: { password: newHash } }
      );
      console.log('Password updated successfully!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error testing auth:', error);
    process.exit(1);
  }
}

testAuth();
