import { NextResponse } from 'next/server';

export async function GET() {
  // Sample fruit data with properties matching the expected format
  const fruits = [
    {
      _id: 'fruit-1',
      name: 'Apple',
      description: { short: 'Fresh apples from local farmers' },
      category: { main: 'FRUITS' },
      pricing: { currency: 'BTN', base: 75.00 },
      inventory: { stock: 25 },
      imageUrl: '/images/products/fruits/apple.jpg'
    },
    {
      _id: 'fruit-2',
      name: 'Banana',
      description: { short: 'Fresh bananas from local farmers' },
      category: { main: 'FRUITS' },
      pricing: { currency: 'BTN', base: 60.00 },
      inventory: { stock: 30 },
      imageUrl: '/images/products/fruits/banana.jpg'
    },
    {
      _id: 'fruit-3',
      name: 'Orange',
      description: { short: 'Fresh oranges from local farmers' },
      category: { main: 'FRUITS' },
      pricing: { currency: 'BTN', base: 70.00 },
      inventory: { stock: 20 },
      imageUrl: '/images/products/fruits/orange.jpg'
    },
    {
      _id: 'fruit-4',
      name: 'Strawberries',
      description: { short: 'Fresh strawberries from local farmers' },
      category: { main: 'FRUITS' },
      pricing: { currency: 'BTN', base: 90.00 },
      inventory: { stock: 15 },
      imageUrl: '/images/products/fruits/strawberries.jpg'
    },
    {
      _id: 'fruit-5',
      name: 'Mango',
      description: { short: 'Fresh mangoes from local farmers' },
      category: { main: 'FRUITS' },
      pricing: { currency: 'BTN', base: 85.00 },
      inventory: { stock: 18 },
      imageUrl: '/images/products/fruits/mango.jpg'
    },
    {
      _id: 'fruit-6',
      name: 'Watermelon',
      description: { short: 'Fresh watermelons from local farmers' },
      category: { main: 'FRUITS' },
      pricing: { currency: 'BTN', base: 120.00 },
      inventory: { stock: 10 },
      imageUrl: '/images/products/fruits/watermelon.jpg'
    }
  ];

  return NextResponse.json({ fruits });
}
