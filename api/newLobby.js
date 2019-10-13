var express = require('express');
var router = express.Router();
var database = require('../routes/database');

function randomId() {
  var rand = String(Math.floor(Math.random() * 1001) + 1);
  var len = rand.length;
  var randStr = "";
  switch (len) {
    case 1: 
      randStr = "000" + rand;
      break;
    case 2:
      randStr = "00" + rand;
      break;
    case 3:
      randStr = "0" + rand;
      break;
    default:
      randStr = rand;
  }
  return randStr;
}

router.post('/', function (req, res) {

  // BUGS: not fix yet, it randoms only 1 time, if random number existed => error.

  var uid = req.body.uid;
  var randId = randomId();
    
  database.ref('/Rooms/r' + randId).once('value').then(function(snapshot) {
    var data = snapshot.val();
    if (data == null) {
      // Valid new Id
      var roomData = {
        id:randId, 
        status: {
          status:"lobby",
          questionNumber:"0"
        },
        authorId:uid
      };
      database.ref('/Rooms/r' + randId).set(roomData);
      res.json({status:"OK",roomID:randId});
    }
    else {
      // Invalid new Id
      res.json({status:"ERROR"});
    }
  });
});

module.exports = router;