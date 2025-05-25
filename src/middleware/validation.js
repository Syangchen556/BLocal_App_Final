import { NextResponse } from 'next/server';

// Helper function to validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Helper function to validate phone number format
const isValidPhone = (phone) => {
  const phoneRegex = /^\+?[0-9]{10,15}$/;
  return phoneRegex.test(phone);
};

// Validation rules for different entities
const validationRules = {
  shop: {
    name: (value) => value?.length >= 3,
    description: (value) => value?.length >= 10,
    email: isValidEmail,
    phone: isValidPhone,
    address: (value) => value?.street && value?.city && value?.state && value?.zipCode,
  },
  product: {
    name: (value) => value?.length >= 3,
    description: (value) => value?.length >= 10,
    price: (value) => typeof value === 'number' && value > 0,
    quantity: (value) => typeof value === 'number' && value >= 0,
  },
  blog: {
    title: (value) => value?.length >= 5,
    content: (value) => value?.length >= 50,
  },
};

// Generic validation middleware
export function validateRequest(schema) {
  return async (req) => {
    const body = await req.json();
    const errors = {};

    // Apply validation rules
    Object.keys(schema).forEach((field) => {
      const rule = schema[field];
      if (!rule(body[field])) {
        errors[field] = `Invalid ${field}`;
      }
    });

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      );
    }

    return NextResponse.next();
  };
}

// Export pre-configured validation middlewares
export const validateShop = validateRequest(validationRules.shop);
export const validateProduct = validateRequest(validationRules.product);
export const validateBlog = validateRequest(validationRules.blog); 