// load the redirect model
var Redirect = require('./models/redirect');

function getRoutePromise(req, res) {
	console.log('originalUrl', req.originalUrl);
	var query = Redirect.findOne({ 
		shortUrl : req.originalUrl.replace('/', '')
	}, function(err, redirect) {
		// if there is an error retrieving, send the error. nothing after res.send(err) will execute
		if (err) {
			res.send(err);
		}
		var isRedirect = redirect !== null;
		sendToRoute({ isRedirect: isRedirect, route: isRedirect ? redirect.longUrl : '/', redirect: redirect }, res);
	});
}

function sendToRoute(route, res) {
	res.statusCode = 302;
	if (route !== null && typeof route !== 'undefined' && route.isRedirect) {
		// Redirect
		res.setHeader('Location', route.route);
	} else {
		res.setHeader('Location', '/');
	}
	res.end();
}

// expose public methods with module.exports
module.exports = {
	getRoutePromise : getRoutePromise
};


