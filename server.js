// set up ======================================================================
var express = require('express');
var mongoose = require('mongoose'); 					// mongoose for mongodb
var port = process.env.PORT || 8080;
var database = require('./config/database');

var deviare = express(); 			// create our app w/ express
var logger = require('morgan');		// Logging middleware
var bodyParser = require('body-parser');	// Parsing middleware
var methodOverride = require('method-override');	// Method Override middleware

// configuration ===============================================================
mongoose.connect(database.url); 	// connect to mongoDB database on modulus.io

// all environments
deviare.set('title', 'Deviare Url Shortener');
deviare.use(express.static(__dirname + '/public')); 		// set the static files location /public/img will be /img for users
// development only
if ('development' == deviare.get('env')) {
	deviare.use(logger({ format: 'dev', immediate: true })); 	// log every request to the console
}
// production only
if ('production' == deviare.get('env')) {
	deviare.use(logger({ immediate: true }));		 			// log every request to the console
}
deviare.use(bodyParser()); 						// pull information from html in POST
deviare.use(methodOverride()); 					// simulate DELETE and PUT

// routes ======================================================================
require('./app/routes')(deviare);

// listen (start deviare with node server.js) ======================================
deviare.listen(port);
console.log("Deviare app listening on port " + port);