const nodemailer = require('nodemailer');
const { Server } = require('socket.io');
const { verifyToken } = require('./jwt');   // ← JWT verification

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// In-memory connected sockets: userId → socket
const userSockets = new Map();

function initWebSocket(server) {
  const io = new Server(server, {
    cors: { origin: "*" }
  });

  // JWT Authentication for WebSocket
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || 
                  socket.handshake.headers['authorization']?.split(' ')[1];

    if (!token) {
      return next(new Error('Authentication required'));
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return next(new Error('Invalid or expired token'));
    }

    socket.userId = decoded.userId;
    next();
  });

  io.on('connection', (socket) => {
    if (socket.userId) {
      userSockets.set(socket.userId.toString(), socket);
      console.log(`User connected via WebSocket: ${socket.userId}`);

      socket.on('disconnect', () => {
        userSockets.delete(socket.userId.toString());
        console.log(`User disconnected: ${socket.userId}`);
      });
    }
  });

  return io;
}

async function sendTaskNotification(userId, type, task) {
  const message = type === 'overdue'
    ? `Your task "${task.title}" is now OVERDUE!`
    : `Your task "${task.title}" has been completed.`;

  // WebSocket Notification
  const socket = userSockets.get(userId.toString());
  if (socket) {
    socket.emit('taskNotification', { 
      type, 
      taskId: task._id, 
      message 
    });
  }

  // Email Notification
  if (process.env.EMAIL_USER) {
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,        
        subject: type === 'overdue' ? 'Task Overdue!' : 'Task Completed',
        text: message,
      });
      console.log(`Email sent to ${process.env.EMAIL_USER}`);
    } catch (err) {
      console.error('Email failed:', err.message);
    }
  }
}

module.exports = { initWebSocket, sendTaskNotification };