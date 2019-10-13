var lobbyCreator = {
	createLobby : function(database, res) {
	    // Get new lobby Id
	    var randomID;
	    database.ref('/Rooms/').once('value').then(function(snapshot) {
	        var lobbies = snapshot.val();
	        randomID = (Math.floor(Math.random() * 1001)).toString();
	        res.render('newlobby', {lobbyID: randomID});
	    });
	}
}

module.exports = lobbyCreator;