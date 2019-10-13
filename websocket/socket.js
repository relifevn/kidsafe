var socket = require('socket.io');
var lobbyData = require('../api/lobbyData');
var database = require('../routes/database');

module.exports.setup = function (server) {
	var io = socket(server);
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

		// Handle event 'host'
		socket.on('host', function (data) {
			console.log('[] HOST DATA =', data);

			if (data.state == 1) {
				// get question and starting playing
				var roomID = data.roomID;
				var questionsPackId = data.questionsPackId;
				var questionNumber = data.questionNumber;

				// get question 
				lobbyData.getQuestion(
					(rs, info) => {
						lobbyData.setStatusRoom(
							{},
							{
								roomID: roomID,
								questionNumber: questionNumber,
								status: "playing"
							}
						);
						socket.emit('host', {
							roomID: roomID,
							state: 1,
							a: rs.a,
							b: rs.b,
							c: rs.c,
							d: rs.d,
							limit: rs.limit,
							question: rs.question,
							questionNumber: info.questionNumber,
							imageURL: rs.imageURL
						});
						io.sockets.emit('player', {
							state: 1,
							roomID: roomID,
							questionNumber: info.questionNumber
						});
					},
					() => {
						socket.emit('host', { state: 3, roomID: roomID });
						io.sockets.emit('player', { state: 3, roomID: roomID });
					},
					{
						questionsPackId: questionsPackId,
						questionNumber: questionNumber
					}
				);

			} else if (data.state == 2) {
				// stop that question, display answer and top 4 score
				var roomID = data.roomID;
				var questionNumber = data.questionNumber;
				var questionsPackId = data.questionsPackId;

				// set status to not accept any answer
				lobbyData.setStatusRoom(
					function () { },
					{
						roomID: roomID,
						questionNumber: questionNumber,
						status: "waiting"
					}
				);

				// display
				lobbyData.getAnswerAndTopScores(
					function (topPlayers, allPlayers) {
						socket.emit('host', topPlayers);
						io.sockets.emit('player', allPlayers);
					},
					{
						roomID: roomID,
						questionsPackId: questionsPackId,
						questionNumber: questionNumber,
						numTop: NUM_TOP
					}
				);
			}
		});

		socket.on('player', function (data) {

			console.log('[] PLAYER DATA =', data);

			if (data.state == 1) {
				// check roomID, current questionNumber is being played
				lobbyData.answeringQuestion(
					function () {
						// do nothing
					},
					{
						roomID: data.roomID,
						questionNumber: data.questionNumber,
						answer: data.answer,
						player: data.player
					}
				);
			} else if (data.state == 3) {
				// just join room 
				io.sockets.emit('lobby', {
					state: 3,
					name: data.name,
					roomID: data.roomID
				});
			}



		});

		socket.on('lobby', function (data) {
			console.log('[] LOBBY DATA', data);

			if (data.state == 0) {
				lobbyData.checkOwnerLobby(
					function (info) {
						socket.emit('lobby', {
							state: 4,
							uid: info.uid,
							roomID: info.roomID
						});
					},
					{
						uid: data.uid,
						roomID: data.roomID,
					}
				);
			} else if (data.state == 1) {
				// get question packs of this owner
				lobbyData.getQuestionsPackData(
					function (info) {
						socket.emit('lobby', {
							state: 1,
							questionPacks: info.questionPacks,
							roomID: info.roomID
						});
					},
					{
						uid: data.uid,
						roomID: data.roomID
					}
				);
			} else if (data.state == 2) {
				// get players 
				lobbyData.getPlayers(
					function (info) {
						socket.emit('lobby', {
							state: 2,
							players: info.players,
							roomID: info.roomID
						});
					},
					{
						roomID: data.roomID
					}
				);
			}

		});

	});
}