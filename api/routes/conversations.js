const router = require('express').Router();
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// Create a new conversation or find an existing one
router.post('/conversations', async (req, res) => {
  const { senderId, receiverId } = req.body;

  try {
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] }, // Changed 'members' to 'participants'
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [senderId, receiverId], // Changed 'members' to 'participants'
      });
      await conversation.save();
    }

    res.status(200).json(conversation);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get all conversations of a user
router.get('/conversations/:userId', async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: { $in: [req.params.userId] }, // Changed 'members' to 'participants'
    });
    res.status(200).json(conversations);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Send a message
router.post('/messages', async (req, res) => {
  const newMessage = new Message(req.body);

  try {
    const savedMessage = await newMessage.save();
    res.status(200).json(savedMessage);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get all messages of a conversation
router.get('/messages/:conversationId', async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
