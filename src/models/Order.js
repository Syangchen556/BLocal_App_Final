import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative']
  },
  variety: {
    name: String,
    sku: String
  }
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  status: {
    type: String,
    enum: ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
    default: 'PENDING'
  },
  payment: {
    method: {
      type: String,
      enum: ['CASH', 'CARD', 'MOBILE_MONEY'],
      required: true
    },
    status: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
      default: 'PENDING'
    },
    transactionId: String,
    paidAt: Date
  },
  shipping: {
    address: {
      street: {
        type: String,
        required: true
      },
      city: {
        type: String,
        required: true
      },
      state: {
        type: String,
        required: true
      },
      zipCode: {
        type: String,
        required: true
      },
      country: {
        type: String,
        required: true
      }
    },
    cost: {
      type: Number,
      required: true,
      min: 0
    },
    method: {
      type: String,
      enum: ['STANDARD', 'EXPRESS'],
      default: 'STANDARD'
    },
    trackingNumber: String,
    estimatedDelivery: Date
  },
  pricing: {
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    tax: {
      type: Number,
      required: true,
      min: 0
    },
    discount: {
      type: Number,
      default: 0,
      min: 0
    },
    total: {
      type: Number,
      required: true,
      min: 0
    }
  },
  notes: String,
  cancelReason: String
}, {
  timestamps: true
});

// Generate order number
orderSchema.pre('save', async function(next) {
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const count = await mongoose.models.Order.countDocuments() + 1;
    this.orderNumber = `ORD-${year}${month}-${count.toString().padStart(6, '0')}`;
  }
  next();
});

// Method to calculate total
orderSchema.methods.calculateTotal = function() {
  const subtotal = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const tax = subtotal * 0.13; // 13% tax
  const total = subtotal + tax + this.shipping.cost - this.pricing.discount;
  
  this.pricing.subtotal = subtotal;
  this.pricing.tax = tax;
  this.pricing.total = total;
  
  return total;
};

// Method to cancel order
orderSchema.methods.cancel = async function(reason) {
  if (this.status === 'DELIVERED') {
    throw new Error('Cannot cancel a delivered order');
  }
  
  this.status = 'CANCELLED';
  this.cancelReason = reason;
  await this.save();
  
  // Update product stock
  for (const item of this.items) {
    const product = await mongoose.models.Product.findById(item.product);
    if (product) {
      await product.updateStock(item.quantity, 'increase');
    }
  }
};

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

export default Order; 