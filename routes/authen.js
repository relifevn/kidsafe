var express = require('express');
var router = express.Router();
// var db = require('./firestore');
var database = require('./database');
var url = require('url');

// /authen

router.get('/', function(req, res, next) {
    // var id = req.params['id'] || "";
    res.render('login', { title: 'Log in', message: "", lobbyID: "" });
});

router.get('/create', function(req, res, next) {
    res.render('login', { title: 'Log in', message: "", lobbyID: "create" });
});

module.exports = router;
