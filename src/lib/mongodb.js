// lib/mongodb.js
import { MongoClient } from "mongodb";
import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI;
const options = {
  serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
  socketTimeoutMS: 30000,
  connectTimeoutMS: 30000
};

let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
  throw new Error("Please add MONGODB_URI to your .env.local file");
}

// MongoDB client for NextAuth and direct MongoDB operations
if (!global._mongoClientPromise) {
  client = new MongoClient(uri, options);
  global._mongoClientPromise = client.connect();
}

clientPromise = global._mongoClientPromise;

// Mongoose connection for models
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      bufferCommands: false, // Disable buffering to prevent timeout issues
    }).then(mongoose => {
      console.log('MongoDB connected successfully');
      return mongoose;
    });
  }
  
  cached.conn = await cached.promise;
  return cached.conn;
}

// Connect to MongoDB using the MongoDB client
export async function connectDB() {
  const client = await clientPromise;
  return client.db(); // defaults to the database in your URI
}

// Also export as default for backward compatibility
export default connectDB;

// Connect to MongoDB using Mongoose
export { dbConnect };

// Export the clientPromise for NextAuth
export { clientPromise };
