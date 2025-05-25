import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  image: {
    type: String,
    default: '/images/default-avatar.png'
  },
  role: {
    type: String,
    enum: ['ADMIN', 'SELLER', 'BUYER'],
    default: 'BUYER'
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters']
  },
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  cart: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1
    }
  }],
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop'
  },
  profile: {
    phoneNumber: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters']
    }
  },
  preferences: {
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      }
    },
    language: {
      type: String,
      default: 'en'
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  lastLogin: Date,
  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add indexes for better query performance
// userSchema.index({ email: 1 }); // Removed as email already has unique: true
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });

// Virtual for full name (if we add firstName/lastName later)
userSchema.virtual('fullName').get(function() {
  return this.name;
});

// Method to check if user is active
userSchema.methods.isActive = function() {
  return this.status === 'active';
};

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to get user's cart total
userSchema.methods.getCartTotal = async function() {
  await this.populate('cart.product');
  return this.cart.reduce((total, item) => {
    return total + (item.product.pricing.discounted || item.product.pricing.base) * item.quantity;
  }, 0);
};

// Prevent duplicate model initialization
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User; 