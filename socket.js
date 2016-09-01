var io = require("socket.io")(3001);
var stores = require('./stores');

io.on('connection', function (socket) {
  socket.emit('connect-success');

  socket.on('disconnect', function () {
    console.log('disconnect');
  });

  socket.on('crawler-token', function (token) {
    if (stores.getStore(token)) {
      socket.join(token);
      socket.emit('join-crawler-success');
    } else {
      socket.emit('join-crawler-failed');
    }
  });
});

function emit(room, data) {
  console.info("Emitter of " + room + " is emitting" + JSON.stringify(data));
  io.to(room).emit("data", data);
}

function getEmitter(room) {
  return {
    emit: function (data) {
      emit(room, data);
    },
  };
}

module.exports = {
  getEmitter: getEmitter,
};
