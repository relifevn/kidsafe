var express = require('express');
var router = express.Router();
var database = require('./database');
var url = require('url');

/*
	/host
*/
var options = {
	maxAge: 1000 * 60 * 15, //  would expire after 15 mins
	httpOnly: true, // the cookie only accessible by the web server
	signed: false // Indicates if the cookie should be signed
}

router.get('/gameView', function(req,res,next){
	var roomID = req.query.roomID;
	var questionsPackId= req.query.questionsPackId;
	// console.log('here?');
	if(!roomID){
		redirect('/');
	}else{
		database.ref('/Rooms/r'+roomID).once('value').then(function(snapshot){
		  if(snapshot.val()){
		  	// Room existed !
		    res.render('host/gameView', {roomID: roomID,questionsPackId: questionsPackId});
		  }else{
		  	// Room not found!
		    redirect('/');
	      }
		});
	}
});

module.exports = router;
