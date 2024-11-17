const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const gameRouter = require('./routes/gameRoutes');
const socketHandler = require('./socketHandler');

const app = express();
app.use(cors());
app.use('/game', gameRouter);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

socketHandler(io);

server.listen(3001, () => {
  console.log('listening on *:3001');
});