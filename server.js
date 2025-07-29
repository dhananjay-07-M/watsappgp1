const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const net = require('net');

app.use(express.static('public'));

// Socket.io events
io.on('connection', socket => {
  console.log('User connected');

  socket.on('join', username => {
    socket.username = username;
    console.log(`${username} joined`);
    io.emit('system', `${username} joined the chat`);
  });

  socket.on('sendMessage', msg => {
    if (!socket.username) return;
    console.log(`[MSG] ${socket.username}: ${msg}`);
    io.emit('message', { user: socket.username, text: msg });
  });

  socket.on('sendFile', data => {
    if (!socket.username) return;
    io.emit('file', {
      user: socket.username,
      fileName: data.fileName,
      fileType: data.fileType,
      fileData: data.fileData
    });
  });

  socket.on('disconnect', () => {
    if (socket.username) {
      console.log(`${socket.username} left`);
      io.emit('system', `${socket.username} left the chat`);
    }
  });
});

// Find available port starting at 3000 (or from env)
function findAvailablePort(startPort, callback) {
  const server = net.createServer();
  server.unref();
  server.on('error', () => findAvailablePort(startPort + 1, callback));
  server.listen(startPort, () => {
    server.close(() => callback(startPort));
  });
}

const START_PORT = process.env.PORT || 3000;
findAvailablePort(Number(START_PORT), port => {
  http.listen(port, () => {
    console.log(`✅ Server running on http://localhost:${port}`);
  });
});
