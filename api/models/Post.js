const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  profilePicture: {
    type: String,
  },
  text: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const PostSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
      max: 500,
    },
    img: {
      type: String,
    },
    likes: {
      type: Array,
      default: [],
    },
    comments: [CommentSchema], // Add comments as an array of CommentSchema
    location: {
      type: String,
    },
    tags: {
      type: Array,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', PostSchema);
