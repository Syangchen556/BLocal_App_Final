import { MongoClient } from 'mongodb';
import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

const options = {
  bufferCommands: true,
  autoIndex: true,
  connectTimeoutMS: 30000,        // Increase timeout to 30 seconds
  socketTimeoutMS: 45000,         // Socket timeout
  maxPoolSize: 50,
  minPoolSize: 10,
  ssl: true,
  tls: true,
  tlsAllowInvalidCertificates: false,
  retryWrites: true,
  retryReads: true,
};

// Cache for mongoose connection
const cached = {
  conn: null,
  promise: null
};

// MongoDB native client promise for Next.js
let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

async function connectDB() {
  // Return cached connection if exists
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    mongoose.set('strictQuery', true);
    cached.promise = mongoose.connect(uri, options)
      .then(mongoose => {
        console.log('MongoDB connected successfully!');
        return mongoose;
      })
      .catch(error => {
        console.error('MongoDB connection error:', error);
        if (error.message.includes('IP whitelist')) {
          console.error('\nTo fix this error:');
          console.error('1. Go to MongoDB Atlas dashboard');
          console.error('2. Click on "Network Access"');
          console.error('3. Click "Add IP Address"');
          console.error('4. Click "Add Current IP Address" or enter your IP');
          console.error('5. Click "Confirm"');
        }
        cached.promise = null;
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    throw error;
  }
}

// Test connection function
async function testConnection() {
  try {
    await connectDB();
    // Try to list databases as a connection test
    const adminDb = mongoose.connection.db.admin();
    await adminDb.ping();
    console.log("Successfully connected to MongoDB!");
    
    // List all databases
    const dbs = await adminDb.listDatabases();
    console.log("Available databases:", dbs.databases.map(db => db.name).join(", "));
    
    return true;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    if (error.message.includes('IP whitelist')) {
      console.error('\nTo fix this error:');
      console.error('1. Go to MongoDB Atlas dashboard');
      console.error('2. Click on "Network Access"');
      console.error('3. Click "Add IP Address"');
      console.error('4. Click "Add Current IP Address" or enter your IP');
      console.error('5. Click "Confirm"');
    }
    return false;
  }
}

export { connectDB, testConnection, clientPromise };
export default connectDB;
