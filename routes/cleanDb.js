var express = require('express');
var router = express.Router();
var database = require('./database');

/* GET test page. */
router.get('/', function(req, res, next) {
    for(let i=0; i<1002; i++){
        let roomId;
        if(0<=i && i<=9){
            roomId = "000"+i.toString();
        }else if(10<=i && i<=99){
            roomId = "00" + i.toString();
        }else if(100<=i && i<=999){
            roomId = "0" + i.toString();
        }else{
            roomId = i.toString();
        }

        database.ref('/Rooms/r'+roomId).remove();
        console.log('[INFO] roomId ', roomId, ' was removed !'); 
    }

    res.json({
        status: 'processing',
        range: [
            'r0000',
            'r0999'
        ]
    })

});
  
module.exports = router;