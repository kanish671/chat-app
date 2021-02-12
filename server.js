const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server);

const SERVER_PORT = 8080;

const rooms = new Map();
const users = new Array();
io.on('connection', (socket) => {
  socket.on('join', (data) => {
    users.push(data.name);
    socket.broadcast.emit('user joined', { users });
  });

  socket.on('join room', (data) => {
    if(!rooms.has(data.room)) {
      rooms.set(data.room, new Array());
    }
    socket.emit('room contents', rooms.get(data.room));
  });

  socket.on('chat message', (data) => {
    let room = rooms.get(data.room);
    room !== undefined 
      ? room.push(`${data.from}: ${data.message}`) 
      : room = [`${data.from}: ${data.message}`];
    socket.broadcast.emit('chat message', data);
  });

  socket.on('disconnect', () => {
    console.log('Someone disconnected');
    io.emit('user joined', 'A user disconnected');
  });
});

app.use(express.static('public'));

server.listen(SERVER_PORT, () => {
  console.log(`server start at ${SERVER_PORT}`);
});