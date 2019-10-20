var socket = require('socket.io');
var database = require('../routes/database');

var io;

exports.emitSockets = (event, data) => {
  io.sockets.emit(event, data);
}

exports.setup = (server) => {
  io = socket(server);
  console.log('[INFO] Set up websocket !');

  io.on('disconnect', (socket) => {
    console.log('[INFO] Disconnect socket', socket.id);
  });

  io.on('connection', (socket) => {

    console.log('[INFO] Made socket connection', socket.id);

    socket.on('playerCheckIn', function (data) {
      // do something
    });

    socket.on('search', function (data) {
			/*
				{ searchKey: string }
			*/
      console.log('search', data);

      database.ref('/').once('value').then(function (snapshot) {
        var result = snapshot.val();
        console.log('[] RESULT', result);
        if (result) {
          socket.emit('schools-result', result);
        } else {
          socket.emit('schools-result', {});
        }
      });
    });

    socket.on('select-school', function (data) {
			/*
				{ key: string }
			*/
      console.log('select-school', data);

      database.ref(`/${data.key}/`).once('value').then(function (snapshot) {
        var result = snapshot.val();
        console.log('[] RESULT', result);
        if (result) {
          socket.emit('vehicles-result', result);
        } else {
          socket.emit('vehicles-result', {});
        }
      });
    });

    socket.on('select-vehicle', function (data) {
			/*
				{ vehicleKey: string, schoolKey: string }
			*/
      console.log(data)

      database.ref(`/${data.schoolKey}/vehicles/${data.vehicleKey}/`).once('value').then(function (snapshot) {
        var result = snapshot.val();
        console.log('[] RESULT', result);
        if (result) {
          socket.emit('vehicle-history', result);
        } else {
          socket.emit('vehicle-history', {});
        }
      });
    });
  });
}