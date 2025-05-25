import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Comment text is required'],
    trim: true,
    maxlength: [1000, 'Comment cannot be more than 1000 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['ACTIVE', 'DELETED'],
    default: 'ACTIVE'
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
commentSchema.index({ post: 1, createdAt: -1 });
commentSchema.index({ author: 1, createdAt: -1 });

const Comment = mongoose.models.Comment || mongoose.model('Comment', commentSchema);

export default Comment; 