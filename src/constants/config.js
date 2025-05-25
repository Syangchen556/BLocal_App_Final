export const APP_CONFIG = {
  name: 'BLocal',
  description: 'Local Vegetable and Fruit Store',
  version: '1.0.0',
};

export const API_ENDPOINTS = {
  auth: '/api/auth',
  products: '/api/products',
  shop: '/api/shop',
  cart: '/api/cart',
  wishlist: '/api/wishlist',
  orders: '/api/orders',
  blogs: '/api/blogs',
};

export const ROLES = {
  ADMIN: 'ADMIN',
  SELLER: 'SELLER',
  BUYER: 'BUYER',
};

export const SHOP_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  SHOP: '/shop',
  CART: '/cart',
  WISHLIST: '/wishlist',
  AUTH: {
    SIGNIN: '/auth/signin',
    SIGNUP: '/auth/signup',
  },
}; 