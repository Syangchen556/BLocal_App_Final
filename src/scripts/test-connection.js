import { testConnection } from '../lib/mongodb.js';

async function main() {
  try {
    const isConnected = await testConnection();
    if (isConnected) {
      console.log("✅ MongoDB connection test successful!");
    } else {
      console.log("❌ MongoDB connection test failed!");
    }
  } catch (error) {
    console.error("Error testing connection:", error);
  } finally {
    // Close the Mongoose connection
    const mongoose = (await import('mongoose')).default;
    await mongoose.disconnect();
    process.exit();
  }
}

main(); 