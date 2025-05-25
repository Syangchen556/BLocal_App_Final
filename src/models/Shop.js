import mongoose from 'mongoose';
import { autoGenerateSlug } from '../utils/slugGenerator.js';

const shopSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true
  },
  description: { 
    type: String, 
    required: true 
  },
  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  logo: { type: String },
  coverImage: { type: String },
  location: { 
    type: String, 
    required: true 
  },
  contact: {
    phone: { type: String },
    email: { type: String }
  },
  products: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product' 
  }],
  ratings: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    review: { type: String }
  }],
  averageRating: { type: Number, default: 0 },
  totalSales: { type: Number, default: 0 },
  featuredProducts: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product' 
  }],
  status: { 
    type: String, 
    enum: ['active', 'inactive'], 
    default: 'active'   },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  statistics: {
    totalSales: {
      type: Number,
      default: 0
    },
    totalOrders: {
      type: Number,
      default: 0
    },
    totalProducts: {
      type: Number,
      default: 0
    }
  },
  businessHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  media: {
    logo: {
      type: String,
      default: '/images/default-shop.png'
    },
    coverImage: {
      type: String,
      default: '/images/default-shop-cover.png'
    }
  },
  verification: {
    isVerified: {
      type: Boolean,
      default: false
    },
    verifiedAt: Date,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  featuredBlogs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog'
  }],
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for better query performance
shopSchema.index({ name: 'text', description: 'text' }); // Text search
shopSchema.index({ owner: 1, status: 1 }); // Owner's shops
shopSchema.index({ location: 1, status: 1 }); // Location-based search
shopSchema.index({ averageRating: -1, status: 1 }); // Top-rated shops
shopSchema.index({ totalSales: -1, status: 1 }); // Best-selling shops

// Auto-generate slug from name
shopSchema.pre('save', async function(next) {
  if (!this.slug) {
    this.slug = autoGenerateSlug(this.name);
  }
  next();
});

// Prevent duplicate model initialization
const Shop = mongoose.models.Shop || mongoose.model('Shop', shopSchema);

export default Shop; 