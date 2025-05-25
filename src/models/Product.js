import mongoose from 'mongoose';
import { autoGenerateSlug } from '../utils/slugGenerator.js';

const varietySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Variety name is required'],
    trim: true
  },
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  stock: {
    current: {
      type: Number,
      required: true,
      min: 0
    },
    minimum: {
      type: Number,
      required: true,
      min: 0
    }
  },
  attributes: {
    size: String,
    color: String,
    weight: Number,
    unit: String
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'out_of_stock'],
    default: 'active'
  }
});

const specificationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Specification name is required'],
    trim: true
  },
  value: {
    type: String,
    required: [true, 'Specification value is required'],
    trim: true
  },
  unit: String,
  group: String
});

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxLength: [500, 'Review comment cannot exceed 500 characters']
  },
  images: [{
    type: String,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
      },
      message: 'Invalid image URL format'
    }
  }],
  verified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  slug: {
    type: String,    unique: true,
    sparse: true,
    lowercase: true,
    index: true
  },
  description: {
    short: {
      type: String,
      required: [true, 'Short description is required'],
      maxlength: [300, 'Short description cannot exceed 300 characters']
    },
    full: {
      type: String,
      required: [true, 'Full description is required']
    }
  },
  media: {
    mainImage: {
      type: String,
      required: [true, 'Main product image is required'],
      validate: {
        validator: function(v) {
          return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
        },
        message: 'Invalid main image URL format'
      }
    },
    gallery: [{
      type: String,
      validate: {
        validator: function(v) {
          return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
        },
        message: 'Invalid gallery image URL format'
      }
    }]
  },
  pricing: {
    base: {
      type: Number,
      required: [true, 'Base price is required'],
      min: [0, 'Price cannot be negative']
    },
    discounted: Number,
    discount: {
      type: Number,
      min: 0,
      max: 100
    },
    currency: {
      type: String,
      default: 'Nu.'
    }
  },
  inventory: {
    sku: {
      type: String,
      required: true,
      unique: true
    },
    stock: {
      type: Number,
      required: true,
      min: 0
    },
    minStock: {
      type: Number,
      required: true,
      min: 0
    },
    reserved: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  category: {
    main: {
      type: String,
      required: [true, 'Main category is required'],
      enum: ['VEGETABLES', 'FRUITS', 'HERBS', 'GRAINS', 'OTHER']
    },
    sub: String,
    tags: [String]
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'active', 'rejected', 'archived'],
    default: 'draft'
  },
  varieties: [varietySchema],
  specifications: [specificationSchema],
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: true,
      maxlength: [500, 'Review cannot exceed 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
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
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    sales: {
      total: {
        type: Number,
        default: 0
      },
      lastMonth: {
        type: Number,
        default: 0
      }
    },
    conversion: {
      type: Number,
      default: 0
    }
  },
  seo: {
    title: String,
    description: String,
    keywords: [String]
  },
  certifications: [{
    name: String,
    issuer: String,
    validUntil: Date,
    documentUrl: {
      type: String,
      validate: {
        validator: function(v) {
          return /^https?:\/\/.+\.(pdf|jpg|jpeg|png)$/i.test(v);
        },
        message: 'Invalid document URL format'
      }
    }
  }],
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
productSchema.index({ name: 'text', 'description.short': 'text', 'description.full': 'text' });
productSchema.index({ 'category.main': 1 });
productSchema.index({ status: 1 });
productSchema.index({ 'pricing.base': 1 });
productSchema.index({ 'rating.average': -1 });
productSchema.index({ 'category.main': 1, status: 1 });
productSchema.index({ shop: 1, status: 1 });
productSchema.index({ seller: 1, createdAt: -1 });
productSchema.index({ 'pricing.base': 1, status: 1 });
productSchema.index({ featured: 1, status: 1 });

// Auto-generate slug from name
productSchema.pre('save', async function(next) {
  if (!this.slug) {
    this.slug = autoGenerateSlug(this.name);
  }
  next();
});

// Update analytics on save
productSchema.pre('save', function(next) {
  if (this.isModified('reviews')) {
    const reviews = this.reviews || [];
    this.rating.average = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0;
    this.rating.count = reviews.length;
  }
  next();
});

// Virtual for current price
productSchema.virtual('currentPrice').get(function() {
  if (this.pricing.discount) {
    return this.pricing.base * (1 - this.pricing.discount / 100);
  }
  return this.pricing.base;
});

// Virtual for stock status
productSchema.virtual('stockStatus').get(function() {
  if (this.inventory.stock <= 0) return 'out_of_stock';
  if (this.inventory.stock <= this.inventory.minStock) return 'low_stock';
  return 'in_stock';
});

// Method to check stock availability
productSchema.methods.checkAvailability = function(quantity) {
  return this.inventory.stock >= quantity;
};

// Method to update stock
productSchema.methods.updateStock = async function(quantity, operation = 'decrease') {
  if (operation === 'decrease') {
    if (this.inventory.stock < quantity) {
      throw new Error('Insufficient stock');
    }
    this.inventory.stock -= quantity;
    this.inventory.reserved += quantity;
    this.analytics.sales.total += quantity;
    
    // Update last month's sales
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    if (this.updatedAt >= firstDayOfMonth) {
      this.analytics.sales.lastMonth += quantity;
    }
  } else {
    this.inventory.stock += quantity;
    this.inventory.reserved = Math.max(0, this.inventory.reserved - quantity);
  }
  
  await this.save();
};

// Method to add review
productSchema.methods.addReview = async function(userId, rating, comment, images = []) {
  const newReview = {
    user: userId,
    rating,
    comment,
    images,
    createdAt: new Date()
  };
  
  this.reviews.push(newReview);
  await this.save();
  return newReview;
};

// Method to check if product needs restocking
productSchema.methods.needsRestocking = function() {
  return this.inventory.stock <= this.inventory.minStock;
};

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

export default Product;