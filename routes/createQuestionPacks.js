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

router.get('/:id', function(req,res,next){
	var lobbyId = req.params['id'];
	res.render('host/createQuestionPacks', {lobbyId:lobbyId});
});

module.exports = router;
