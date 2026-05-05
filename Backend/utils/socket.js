const { Server } = require('socket.io');

let io;

const init = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*', // In production, specify the frontend URL
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('Cliente conectado:', socket.id);

    socket.on('join', (userId) => {
      socket.join(`user_${userId}`);
      console.log(`Usuario ${userId} unido a su sala privada`);
    });

    socket.on('disconnect', () => {
      console.log('Cliente desconectado');
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io no ha sido inicializado');
  }
  return io;
};

const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user_${userId}`).emit(event, data);
  }
};

const emitToAll = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};

module.exports = {
  init,
  getIO,
  emitToUser,
  emitToAll
};
