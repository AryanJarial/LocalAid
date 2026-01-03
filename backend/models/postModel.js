import mongoose from 'mongoose';

const postSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['request', 'offer'], 
      required: true,
    },
    category: {
      type: String,
      required: true, 
    },
    status: {
      type: String,
      enum: ['open', 'closed'],
      default: 'open',
    },

    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], 
        required: true,
      },
      address: {
        type: String, 
      }
    },
  },
  {
    timestamps: true,
  }
);

postSchema.index({ location: '2dsphere' });

const Post = mongoose.model('Post', postSchema);

export default Post;