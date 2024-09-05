const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
      required: true, // Ensure that a conversationId is provided
    },
    senderId: {
      type: String,
      required: true, // Ensure that a senderId is provided
    },
    text: {
      type: String,
      required: true, // Ensure that text is provided
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', MessageSchema);
