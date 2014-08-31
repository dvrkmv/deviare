"use strict";

// load the redirect model
var Redirect = require('./models/redirect');
var redirecter = require('./redirecter');
var redirLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
var errorStrings = require('./errorStrings');
var apivars = require('./apivars');

var passport = require('passport');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var TwitterStrategy = require('passport-twitter').Strategy;
var ensureLoggedIn = require('../node_modules/connect-ensure-login/lib/ensureLoggedIn');
//var ensureLoggedOut = require('../node_modules/connect-ensure-login/lib/ensureLoggedOut');

// expose the routes to our app with module.exports
module.exports = function(app) {

	app.use(cookieParser());
	app.use(session({ secret: 'keyboard cat', saveUninitialized: true, resave: true }));
	app.use(passport.initialize());
	app.use(passport.session());
	 
	passport.serializeUser(function(user, done) {
		done(null, user);
	});
	 
	passport.deserializeUser(function(obj, done) {
		done(null, obj);
	});
	 
	passport.use(new TwitterStrategy({
			consumerKey: apivars.tw_consumerKey,
			consumerSecret: apivars.tw_consumerSecret,
			callbackURL: apivars.tw_callbackUrl
		},
		function(token, tokenSecret, profile, done) {
			// NOTE: You'll probably want to associate the Twitter profile with a
			//       user record in your application's DB.
			var user = profile;
			return done(null, user);
		}
	));

	// api ---------------------------------------------------------------------
	// get all redirects
	app.get('/api/redirects', function(req, res) {
		// use mongoose to get all redirects in the database
		Redirect.find(function(err, redirects) {

			// if there is an error retrieving, send the error. nothing after res.send(err) will execute
			if (err) {
				res.send(err);
			}
			res.json(redirects); // return all redirects in JSON format
		});
	});

	// create redirect and send back all redirects after creation
	app.post('/api/redirects', function(req, res) {
		// create a redirect, information comes from AJAX request from Angular
		var longUrl = req.body.longUrl;
		var shortUrl = req.body.shortUrl;
		var shortArr = [];

		if (longUrl.indexOf('http') === -1) {
			longUrl = 'http://' + longUrl;
		}
		if (shortUrl !== null && typeof shortUrl !== 'undefined' && shortUrl.indexOf('/') === 0) {
			shortUrl = shortUrl.substring(1, shortUrl.length -1);
		}
		if (shortUrl === null || typeof shortUrl === 'undefined') {
			for (var i = 0; i < 5; i++) {
				var randNum = Math.floor(Math.random() * (51 - 0));
				shortArr.push(redirLetters[randNum]);
			}
			shortUrl = shortArr.join('');
		}

		Redirect.findOne({ 
			shortUrl : shortUrl 
		}, function(err, redirect) {
			// if there is an error retrieving, send the error. nothing after res.send(err) will execute
			if (err) {
				res.send(err);
			}
			if (typeof redirect !== 'undefined' && redirect !== null) {
				res.json({ err: errorStrings.dupShort });
			} else {
				Redirect.create({
					longUrl : longUrl,
					shortUrl : shortUrl,
					views : 0
				}, function(err) {
					if (err) {
						res.send(err);
					}
					// get and return all the redirects after you create another
					Redirect.find(function(err, redirects) {
						if (err) {
							res.send(err);
						}
						res.json(redirects);
					});
				});
			}
		});
	});

	// get a specific redirect by id
	app.get('/api/redirects/:redir_id', function(req, res) {
		// use mongoose to get the matching redirect in the database
		Redirect.findOne({ 
			_id : req.params.redir_id 
		}, function(err, redirect) {
			// if there is an error retrieving, send the error. nothing after res.send(err) will execute
			if (err) {
				res.send(err);
			}
			res.json(redirect); // return specific redirect in JSON format
		});
	});

	// get a specific redirect by url
	app.get('/api/redirects/:redir_url', function(req, res) {
		// use mongoose to get the matching redirect in the database
		Redirect.findOne({ 
			shortUrl : req.params.redir_url 
		}, function(err, redirect) {
			// if there is an error retrieving, send the error. nothing after res.send(err) will execute
			if (err) {
				res.send(err);
			}
			res.json(redirect); // return specific redirect in JSON format
		});
	});

	// delete a redirect by id
	app.delete('/api/redirects/:redir_id', function(req, res) {
		Redirect.remove({
			_id : req.params.redir_id
		}, function(err) {
			if (err) {
				res.send(err);
			}
			// get and return all the redirects after you delete one
			Redirect.find(function(err, redirects) {
				if (err) {
					res.send(err);
				}
				res.json(redirects);
			});
		});
	});

	// delete a redirect by url
	app.delete('/api/redirects/:redir_url', function(req, res) {
		Redirect.remove({
			longUrl : req.params.redir_url
		}, function(err) {
			if (err) {
				res.send(err);
			}
			// get and return all the redirects after you delete one
			Redirect.find(function(err, redirects) {
				if (err) {
					res.send(err);
				}
				res.json(redirects);
			});
		});
	});

	// application -------------------------------------------------------------
	app.get('/login', function (req, res) {
		res.sendfile('login.html', {'root' : 'public'}); // do authentication with traditional page loads
	});
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});
	app.get('/account', ensureLoggedIn('/login'), function (req, res) {
		res.sendfile('account.html', {'root' : 'public'}); // show account information
	});
	app.get('/auth/twitter', passport.authenticate('twitter'));
	app.get('/auth/twitter/callback', passport.authenticate('twitter', { 
		successReturnToOrRedirect: '/', 
		failureRedirect: '/login' 
	}));
 	app.get('/', ensureLoggedIn('/login'), function(req, res) {
		res.sendfile('home.html', {'root' : 'public'}); // load the single view file (angular will handle the page changes on the front-end)
	});

	app.get('*', function(req, res) {
		redirecter.getRoutePromise(req, res);
	});

};