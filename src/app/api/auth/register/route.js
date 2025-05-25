// IMPORTANT: Always return JSON from API endpoints. Never return HTML to fetch requests.
// Test your API endpoint in the browser to ensure it returns JSON, not an error page.
// If you get a JSON parse error, check for typos in the fetch URL or server errors.

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  console.log('Register API called');
  try {
    const { name, email, password } = await req.json();
    console.log('Received:', { name, email });
    // Validate required fields
    if (!name || !email || !password) {
      console.log('Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    let db;
    try {
      db = await connectDB();
    } catch (err) {
      console.error('connectDB failed:', err);
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }
    // Check if user already exists
    let existingUser;
    try {
      existingUser = await db.collection('users').findOne({ email });
    } catch (err) {
      console.error('Error finding user:', err);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }
    if (existingUser) {
      console.log('User already exists:', email);
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }
    // Hash password
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 10);
    } catch (err) {
      console.error('Error hashing password:', err);
      return NextResponse.json(
        { error: 'Password hashing failed' },
        { status: 500 }
      );
    }
    // Create user
    const user = {
      name,
      email,
      password: hashedPassword,
      role: 'USER', // Default role
      createdAt: new Date(),
      updatedAt: new Date()
    };
    try {
      await db.collection('users').insertOne(user);
    } catch (err) {
      console.error('Error inserting user:', err);
      return NextResponse.json(
        { error: 'User creation failed' },
        { status: 500 }
      );
    }
    console.log('User created:', email);
    return NextResponse.json(
      { message: 'User created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error (outer catch):', error);
    return NextResponse.json(
      { error: 'Error creating user' },
      { status: 500 }
    );
  }
}