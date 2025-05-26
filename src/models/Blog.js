import mongoose from 'mongoose';
import { autoGenerateSlug } from '../utils/slugGenerator.js';

const commentSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxLength: [1000, 'Comment cannot be more than 1000 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const BlogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
    maxLength: [200, 'Title cannot be more than 200 characters']
  },
  slug: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true
  },
  content: {
    type: String,
    required: [true, 'Please provide content'],
    minLength: [100, 'Content must be at least 100 characters']
  },
  summary: {
    type: String,
    required: true,
    trim: true,
    maxLength: [500, 'Summary cannot be more than 500 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide an author']
  },
  media: {
    featuredImage: {
      type: String,
      required: [true, 'Please provide a featured image']
    },
    video: {
      url: String,
      thumbnail: String,
      duration: Number
    },
    gallery: [{
      type: String
    }]
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: ['RECIPES', 'FARMING', 'NUTRITION', 'SUSTAINABILITY', 'OTHER']
  },
  tags: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
    default: 'DRAFT'
  },
  metadata: {
    views: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    readTime: {
      type: Number,
      required: true
    }
  },
  comments: [commentSchema],
  publishedAt: Date,
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  },
  coverImage: {
    type: String
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add compound indexes for better query performance
BlogSchema.index({ title: 'text', content: 'text' }); // Text search index
BlogSchema.index({ category: 1, status: 1 }); // For filtering by category and status
BlogSchema.index({ author: 1, createdAt: -1 }); // For author's blog listing
BlogSchema.index({ 'metadata.views': -1 }); // For popular blogs
BlogSchema.index({ tags: 1 }); // For tag-based queries

// Auto-generate slug from title
BlogSchema.pre('save', async function(next) {
  if (!this.slug) {
    this.slug = autoGenerateSlug(this.title);
  }
  next();
});

// Virtual for comment count
BlogSchema.virtual('commentCount').get(function() {
  return this.comments?.length || 0;
});

// Method to check if blog is published
BlogSchema.methods.isPublished = function() {
  return this.status === 'PUBLISHED';
};

// Prevent duplicate model initialization
const Blog = mongoose.models.Blog || mongoose.model('Blog', BlogSchema);

export default Blog; 