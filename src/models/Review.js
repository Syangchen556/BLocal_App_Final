import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Can be either a product or shop ID
  target: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'targetType'
  },
  targetType: {
    type: String,
    required: true,
    enum: ['Product', 'Shop']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
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
  },
  helpful: {
    count: {
      type: Number,
      default: 0
    },
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  reported: {
    count: {
      type: Number,
      default: 0
    },
    reasons: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      reason: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'hidden'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
reviewSchema.index({ user: 1, target: 1 }); // One review per user per target
reviewSchema.index({ target: 1, targetType: 1 }); // Find all reviews for a target
reviewSchema.index({ rating: -1 }); // Sort by rating
reviewSchema.index({ 'helpful.count': -1 }); // Sort by helpfulness

// Method to mark review as helpful
reviewSchema.methods.markHelpful = async function(userId) {
  if (!this.helpful.users.includes(userId)) {
    this.helpful.users.push(userId);
    this.helpful.count = this.helpful.users.length;
    await this.save();
  }
};

// Method to report review
reviewSchema.methods.report = async function(userId, reason) {
  const existingReport = this.reported.reasons.find(
    report => report.user.toString() === userId.toString()
  );
  
  if (!existingReport) {
    this.reported.reasons.push({ user: userId, reason });
    this.reported.count = this.reported.reasons.length;
    
    // Auto-hide review if it gets too many reports
    if (this.reported.count >= 5) {
      this.status = 'hidden';
    }
    
    await this.save();
  }
};

// Update average rating on the target after review changes
reviewSchema.post('save', async function() {
  const Model = mongoose.model(this.targetType);
  const stats = await mongoose.model('Review').aggregate([
    {
      $match: {
        target: this.target,
        targetType: this.targetType,
        status: 'approved'
      }
    },
    {
      $group: {
        _id: '$target',
        averageRating: { $avg: '$rating' },
        numReviews: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await Model.findByIdAndUpdate(this.target, {
      'rating.average': stats[0].averageRating,
      'rating.count': stats[0].numReviews
    });
  }
});

const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);

export default Review; 