// load the redirect model
var Redirect = require('./models/redirect');
var redirecter = require('./redirecter');
var redirLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

// expose the routes to our app with module.exports
module.exports = function(app) {

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

		Redirect.create({
			longUrl : longUrl,
			shortUrl : shortUrl,
			views : 0
		}, function(err, redirect) {
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
			longUrl : req.params.redir_url 
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
		}, function(err, todo) {
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
		}, function(err, todo) {
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
	app.get('/', function(req, res) {
		res.sendfile('../public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
	});

	app.get('*', function(req, res) {
		redirecter.getRoutePromise(req, res);
	});

};