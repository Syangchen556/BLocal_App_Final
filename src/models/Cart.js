import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
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
  variety: {
    name: String,
    sku: String
  },
  addedAt: {
    type: Date,
    default: Date.now
  },
  notes: String
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'checkout', 'abandoned'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
cartSchema.index({ user: 1 }); // Find user's cart
cartSchema.index({ status: 1, lastUpdated: -1 }); // Find abandoned carts

// Update lastUpdated timestamp on any modification
cartSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

// Method to add item to cart
cartSchema.methods.addItem = async function(productId, quantity = 1, variety = null) {
  const product = await mongoose.model('Product').findById(productId);
  if (!product) {
    throw new Error('Product not found');
  }

  if (!product.checkAvailability(quantity)) {
    throw new Error('Insufficient stock');
  }

  const existingItem = this.items.find(item => 
    item.product.toString() === productId &&
    (!variety || item.variety?.sku === variety?.sku)
  );

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    this.items.push({
      product: productId,
      shop: product.shop,
      quantity,
      variety,
      addedAt: new Date()
    });
  }

  await this.save();
  return this;
};

// Method to update item quantity
cartSchema.methods.updateQuantity = async function(productId, quantity, variety = null) {
  const item = this.items.find(item => 
    item.product.toString() === productId &&
    (!variety || item.variety?.sku === variety?.sku)
  );

  if (!item) {
    throw new Error('Item not found in cart');
  }

  const product = await mongoose.model('Product').findById(productId);
  if (!product.checkAvailability(quantity)) {
    throw new Error('Insufficient stock');
  }

  item.quantity = quantity;
  await this.save();
  return this;
};

// Method to remove item from cart
cartSchema.methods.removeItem = async function(productId, variety = null) {
  this.items = this.items.filter(item => 
    !(item.product.toString() === productId &&
    (!variety || item.variety?.sku === variety?.sku))
  );
  await this.save();
  return this;
};

// Method to clear cart
cartSchema.methods.clear = async function() {
  this.items = [];
  await this.save();
  return this;
};

// Method to calculate cart totals
cartSchema.methods.calculateTotals = async function() {
  await this.populate('items.product');
  
  const totals = {
    subtotal: 0,
    tax: 0,
    shipping: 0,
    total: 0,
    itemCount: 0
  };

  for (const item of this.items) {
    const price = item.product.pricing.discounted || item.product.pricing.base;
    const itemTotal = price * item.quantity;
    totals.subtotal += itemTotal;
    totals.itemCount += item.quantity;
  }

  totals.tax = totals.subtotal * 0.13; // 13% tax
  totals.shipping = totals.subtotal > 1000 ? 0 : 100; // Free shipping over Nu. 1000
  totals.total = totals.subtotal + totals.tax + totals.shipping;

  return totals;
};

// Method to convert cart to order
cartSchema.methods.toOrder = async function(paymentMethod, shippingAddress) {
  if (this.items.length === 0) {
    throw new Error('Cannot create order from empty cart');
  }

  const totals = await this.calculateTotals();
  const Order = mongoose.model('Order');

  const order = new Order({
    user: this.user,
    items: this.items.map(item => ({
      product: item.product._id,
      shop: item.shop,
      quantity: item.quantity,
      price: item.product.pricing.discounted || item.product.pricing.base,
      variety: item.variety
    })),
    payment: {
      method: paymentMethod
    },
    shipping: {
      address: shippingAddress,
      cost: totals.shipping
    },
    pricing: {
      subtotal: totals.subtotal,
      tax: totals.tax,
      total: totals.total
    }
  });

  await order.save();
  await this.clear();
  return order;
};

const Cart = mongoose.models.Cart || mongoose.model('Cart', cartSchema);

export default Cart; 