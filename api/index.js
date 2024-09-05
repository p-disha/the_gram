const express = require('express');
const http = require('http'); // Import http module
const app = express();
const server = http.createServer(app); // Create server using http
const { Server } = require('socket.io'); // Import socket.io
const io = new Server(server); // Create a new instance of socket.io
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
const multer = require('multer');
const path = require('path');

dotenv.config();

// Import Auth Route
const authRoute = require('./routes/auth');

// Import User Route
const userRoute = require('./routes/users');

// Import Post Route
const postRoute = require('./routes/posts');

// Import Message and Conversation Route
const conversationRoute = require('./routes/conversations');
const messageRoute = require('./routes/messages');

// Create a connection with MongoDB
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true }, () => {
  console.log('Connected to MongoDB');
});

// Middleware
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use(express.json());
app.use(helmet());
app.use(morgan('common'));

// Routes
app.use('/api/users', userRoute);
app.use('/api/auth', authRoute);
app.use('/api/posts', postRoute);
app.use('/api/conversations', conversationRoute);
app.use('/api/messages', messageRoute);

// Multer for image uploads
const imgStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images');
  },
  filename: (req, file, cb) => {
    cb(null, req.body.name);
  },
});

const upload = multer({ storage: imgStorage });

app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    return res.status(200).json('File uploaded!!!');
  } catch (error) {
    console.log(error);
  }
});

// Socket.io for real-time messaging
io.on('connection', (socket) => {
  console.log('A user connected');

  // Join a conversation room
  socket.on('joinConversation', (conversationId) => {
    socket.join(conversationId);
    console.log(`User joined conversation: ${conversationId}`);
  });

  // Listen for sending messages
  socket.on('sendMessage', (message) => {
    const conversationId = message.conversationId;
    io.to(conversationId).emit('receiveMessage', message);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;