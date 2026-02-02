const express = require('express');
const path = require('path');
const http = require('http');

const app = express();
const PORT = process.env.PORT || 4000;

const server = http.createServer(app);
const io = require('socket.io')(server);

app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
let socketsConnected = new Set();

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);
  socketsConnected.add(socket.id);

  io.emit('clients-total', socketsConnected.size);

  socket.on('disconnect', () => {
    setTimeout(() => {
      socketsConnected.delete(socket.id);
      io.emit('clients-total', socketsConnected.size);
    }, 100);
  });

  socket.on('message', (data) => {
    socket.broadcast.emit('chat-message', data);
  });

  socket.on('feedback', (data) => {
    socket.broadcast.emit('feedback', data);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
