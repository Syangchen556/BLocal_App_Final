import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'IN_PROGRESS', 'RESOLVED'],
    default: 'PENDING'
  },
  adminResponse: {
    type: String,
    trim: true
  },
  resolvedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
contactSchema.index({ user: 1, status: 1 });
contactSchema.index({ status: 1 });
contactSchema.index({ createdAt: -1 });

const Contact = mongoose.models.Contact || mongoose.model('Contact', contactSchema);

export default Contact; 