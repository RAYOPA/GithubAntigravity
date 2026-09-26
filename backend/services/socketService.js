let io = null;

function initSocket(server) {
  const { Server } = require('socket.io');
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 [WebSocket] Client connected: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`🔌 [WebSocket] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

function getIO() {
  return io;
}

function broadcastEvent(eventName, payload) {
  if (io) {
    io.emit(eventName, {
      timestamp: new Date().toISOString(),
      ...payload
    });
  }
}

module.exports = {
  initSocket,
  getIO,
  broadcastEvent
};
