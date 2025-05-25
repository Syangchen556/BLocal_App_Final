import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

async function createAdminUser() {
  try {
    // Explicitly connect to the blocal database
    await mongoose.connect('mongodb://localhost:27017/blocal', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to blocal database');

    // Define the User Schema
    const userSchema = new mongoose.Schema({
      name: String,
      email: String,
      password: String,
      role: String,
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    });

    // Create the User model
    const User = mongoose.models.User || mongoose.model('User', userSchema);

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
    } else {
      // Create admin user
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const adminUser = new User({
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'ADMIN'
      });

      await adminUser.save();
      console.log('Admin user created successfully');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the function
createAdminUser(); 