const express = require('express');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

// set up our express application 
app.use(express.static("public/"));

// set the view engine to ejs
app.set('view engine', 'ejs');

// use res.render to load up an ejs view file
app.set('views', __dirname + '/views');

// parse application/x-www-form-urlencoded 
app.use(bodyParser.urlencoded({ extended: true }));

// parse application/json 
app.use(bodyParser.json());

// use cookie parser 
app.use(cookieParser());

// router files 
app.use('/', require('./routes/index'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', { title: 'Not Found' }); // error.hbs file is rendered
});

module.exports = app;
