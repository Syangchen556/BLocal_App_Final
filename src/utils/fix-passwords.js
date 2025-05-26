import { connectDB } from '../lib/mongodb.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function fixPasswords() {
  try {
    console.log('Connecting to MongoDB...');
    const db = await connectDB();
    console.log('Connected to MongoDB');

    // Define test accounts to fix
    const accounts = [
      { email: 'admin@blocal.bt', password: 'admin123' },
      { email: 'seller1@blocal.bt', password: 'seller123' },
      { email: 'buyer1@blocal.bt', password: 'buyer123' }
    ];

    for (const account of accounts) {
      console.log(`Updating password for ${account.email}...`);
      
      // Generate a new password hash
      const passwordHash = await bcrypt.hash(account.password, 12);
      
      // Update the user's password in the database
      const result = await db.collection('users').updateOne(
        { email: account.email },
        { $set: { password: passwordHash } }
      );
      
      if (result.matchedCount === 0) {
        console.log(`User ${account.email} not found`);
      } else if (result.modifiedCount === 0) {
        console.log(`Password for ${account.email} already up to date`);
      } else {
        console.log(`Password for ${account.email} updated successfully`);
      }
    }

    console.log('Password fix complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing passwords:', error);
    process.exit(1);
  }
}

fixPasswords();
