"use strict";

// load the redirect model
var Redirect = require('./models/redirect');

function getRoutePromise(req, res) {
	console.log('getRoutePromise originalUrl', req.originalUrl);
	Redirect.findOne({ 
		shortUrl : req.originalUrl.replace('/', '')
	}, function(err, redirect) {
		// if there is an error retrieving, send the error. nothing after res.send(err) will execute
		if (err) {
			res.send(err);
		}
		var isRedirect = redirect !== null;
		sendToRoute({ isRedirect: isRedirect, route: isRedirect ? redirect.longUrl : '/', redirect: redirect }, req, res);
	});
}

function sendToRoute(route, req, res) {
	res.statusCode = 302;
	console.log('sendToRoute originalUrl',req.originalUrl);
	if (req.originalUrl === '/') {
		// Redirect root to local-pc-guy
		res.setHeader('Location', 'http://local-pc-guy.com');
	} else if (req.originalUrl === '/add') {
		res.setHeader('Location', '/?rdr=add');
	} else if (route !== null && typeof route !== 'undefined' && route.isRedirect) {
		// Update view count
		Redirect.update(
		   { shortUrl: route.redirect.shortUrl },
		   { $set: { views: route.redirect.views + 1 } }
		);
		// Redirect
		res.setHeader('Location', route.route);
	} else {
		res.setHeader('Location', '/?err=no-such-route');
	}
	res.end();
}

// expose public methods with module.exports
module.exports = {
	getRoutePromise : getRoutePromise
};


