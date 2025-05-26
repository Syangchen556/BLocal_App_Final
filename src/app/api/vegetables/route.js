import { NextResponse } from 'next/server';

export async function GET() {
  // Sample vegetable data with properties matching the expected format
  const vegetables = [
    {
      _id: 'veg-1',
      name: 'Tomato',
      description: { short: 'Fresh tomatoes from local farmers' },
      category: { main: 'VEGETABLES' },
      pricing: { currency: 'BTN', base: 65.00 },
      inventory: { stock: 30 }
    },
    {
      _id: 'veg-2',
      name: 'Cucumber',
      description: { short: 'Fresh cucumbers from local farmers' },
      category: { main: 'VEGETABLES' },
      pricing: { currency: 'BTN', base: 55.00 },
      inventory: { stock: 25 }
    },
    {
      _id: 'veg-3',
      name: 'Carrot',
      description: { short: 'Fresh carrots from local farmers' },
      category: { main: 'VEGETABLES' },
      pricing: { currency: 'BTN', base: 45.00 },
      inventory: { stock: 40 }
    },
    {
      _id: 'veg-4',
      name: 'Broccoli',
      description: { short: 'Fresh broccoli from local farmers' },
      category: { main: 'VEGETABLES' },
      pricing: { currency: 'BTN', base: 75.00 },
      inventory: { stock: 15 }
    },
    {
      _id: 'veg-5',
      name: 'Spinach',
      description: { short: 'Fresh spinach from local farmers' },
      category: { main: 'VEGETABLES' },
      pricing: { currency: 'BTN', base: 40.00 },
      inventory: { stock: 35 }
    },
    {
      _id: 'veg-6',
      name: 'Cabbage',
      description: { short: 'Fresh cabbage from local farmers' },
      category: { main: 'VEGETABLES' },
      pricing: { currency: 'BTN', base: 60.00 },
      inventory: { stock: 20 }
    }
  ];

  return NextResponse.json({ vegetables });
}
