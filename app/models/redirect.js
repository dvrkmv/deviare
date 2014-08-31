var mongoose = require('mongoose');

module.exports = mongoose.model('Redirect', {
	longUrl : String,
	shortUrl : String,
	views : Number,
	userId: String
});