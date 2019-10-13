var express = require('express');
var router = express.Router();
var database = require('./database');
var url = require('url');

/*
	/player
*/
var options = {
	maxAge: 1000 * 60 * 15, //  would expire after 15 mins
	httpOnly: true, // the cookie only accessible by the web server
	signed: false // Indicates if the cookie should be signed
}

router.get('/joinRoom', function (req, res, next) {
	var roomID = req.query.roomID;
	if (roomID) {
		// roomID is required ! If roomID is undefined, redirect to home page
		database.ref('/Rooms/r' + roomID).once('value').then(function (snapshot) {
			if (snapshot.val()) {
				// Room existed ! Render page to enter nick name 
				res.render('player/joinRoom', { title: '', roomID: roomID, message: '' });
			} else {
				// Room not found!
				res.redirect('/');
			}
		});
	} else {
		// roomID is undefined
		res.redirect('/');
	}
});

router.post('/checkRoom', function (req, res, next) {
	res.status(200);
	res.setHeader('Content-Type', 'application/json');

	database.ref('/Rooms/r' + req.body.roomID).once('value').then(function (snapshot) {
		if (snapshot.val()) {
			// Room existed !
			res.json({ statusRoom: 1 });
		} else {
			// Room not found!
			res.json({ statusRoom: 0 });
		}
	});
});

router.get('/checkRoom', function (req, res, next) {
	res.status(200);
	res.setHeader('Content-Type', 'application/json');

	database.ref('/Rooms/r' + req.query.roomID).once('value').then(function (snapshot) {
		if (snapshot.val()) {
			// Room existed !
			res.json({ statusRoom: 1 });
		} else {
			// Room not found!
			res.json({ statusRoom: 0 });
		}
	});
});

router.post('/checkNickName', function (req, res, next) {
	var nickName = req.body.nickName;
	var roomID = req.body.roomID;
	var type = req.body.playerType; // temporaryUser 0, loggedInUser 1
	var uid = req.body.uid; // = uid if type=1; = undefined if type=0

	console.log("[Debug]Cookies" + JSON.stringify(req.cookies));

	res.status(200);
	res.setHeader('Content-Type', 'application/json');

	database.ref('/Rooms/r' + roomID + '/players').once('value').then(function (snapshot) {
		var data = snapshot.val();
		if (data) {
			var isValid = true;
			Object.keys(data).forEach(function (key) {
				if (data[key].name == nickName) {
					isValid = false;
				}
			});
			if (isValid) {
				player = 'player' + Object.keys(data).length.toString();

				// set cookies
				res.cookie('player', player);
				res.cookie('roomID', roomID);

				// respond to client 
				res.json({ isValidNickName: 1 });

				// create new user
				database.ref('/Rooms/r' + roomID + '/players/' + player).set({
					name: nickName,
					score: 0,
				});


			} else {
				res.json({ isValidNickName: 0 });
			}
		} else {// first to join
			// respond to client 
			// set cookies
			res.cookie('player', 'player0');
			res.cookie('roomID', roomID);

			// respond to client 
			res.json({ isValidNickName: 1 });

			// create new user
			database.ref('/Rooms/r' + roomID + '/players/player0').set({
				name: nickName,
				score: 0,
			});
		}
	});
});


router.get('/gameView', function (req, res, next) {
	// read cookies 
	console.log("[DEBUG] gameView:" + JSON.stringify(req.cookies));

	// check if and 
	player = req.cookies.player;
	roomID = req.cookies.roomID;
	database.ref('/Rooms/r' + roomID + '/players/' + player).once('value').then(function (snapshot) {
		var data = snapshot.val();
		if (data) {
			database.ref('/Rooms/r' + roomID).once('value').then(function (snapshot) {
				res.render(
					'player/gameView',
					{
						room: snapshot.val(),
						currentPlayer: data.name,
						currentRoom: roomID
					}
				);
			});
		} else {
			// redirect to homepage if player does not exist in that room
			res.redirect('/');
		}
	});
});


module.exports = router;
